import { useState, useEffect, useRef, useCallback } from 'react';

import Webcam from "react-webcam";
import { usePoseSequence } from "../../hooks/usePoseSequence";
import { usePoseLandmarker } from "../../hooks/usePoseLandmarker.ts"
import UserPositionSetupDialog from './UserPositionSetupDialog.tsx';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { getUserSessionRequirements, type SessionRequirement, getExercises, type Exercise, startSession, addSetToSession, addRepToSet, endSession } from '@/api/userService';
import { useSidebar } from "@/context/SidebarContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Video, CheckCircle2, AlertTriangle, Play, Square, Pause } from 'lucide-react';
import sidebarLogo from "@/assets/imgs/sidebar.png";

const UPPER_BODY_CONNECTIONS = [
  { start: 7, end: 2, name: 'ear_to_eyes' },
  { start: 2, end: 0, name: 'eyes_to_nose' },
  { start: 0, end: 5, name: 'nose_to_eyes' },
  { start: 5, end: 8, name: 'eyes_to_ear' },
  { start: 9, end: 10, name: 'mouth' },
  { start: 11, end: 12, name: 'shoulders' },
  { start: 11, end: 13, name: 'left_upper_arm' },
  { start: 13, end: 15, name: 'left_lower_arm' },
  { start: 12, end: 14, name: 'right_upper_arm' },
  { start: 14, end: 16, name: 'right_lower_arm' },
  { start: 11, end: 23, name: 'left_torso' },
  { start: 12, end: 24, name: 'right_torso' },
  { start: 23, end: 24, name: 'hips' }
];

const PREDICTION_TO_KEYPOINT_MAP: { [key: number]: number } = { 0: 11, 1: 12, 2: 13, 3: 14, 4: 15, 5: 16 };
const UPPER_BODY_INDICES = [0, 2, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23, 24];

type FeedbackStatus = 'waiting' | 'correct' | 'incorrect';

function SessionPage() {
  const { requirementId } = useParams<{ requirementId: string }>(); // Get the ID from the URL
  const { user } = useAuth(); const { setSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const { latestPrediction, processFrame, status } = usePoseSequence();
  const { poseLandmarker, landmarkerStatus } = usePoseLandmarker();

  const [sessionState, setSessionState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [feedback, setFeedback] = useState<{ status: FeedbackStatus; text: string }>({ status: 'waiting', text: 'Press Play to Begin' });
  const [currentReps, setCurrentReps] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [accuracy, setAccuracy] = useState(0);
  const [isSetUpDialogOpen, setIsSetUpDialogOpen] = useState<boolean>(true);

  const [activeRequirement, setActiveRequirement] = useState<SessionRequirement | null>(null);
  const [exerciseName, setExerciseName] = useState<string>('Loading Exercise...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [activeSetId, setActiveSetId] = useState<number | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTimestampRef = useRef<number>(-1);
  const animationFrameIdRef = useRef<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const oheExerciseRef = useRef<number[]>([0.0, 1.0, 0.0]);

  const correctFormTimer = useRef<NodeJS.Timeout | null>(null);

   useEffect(() => {
    if (!isProcessing || !latestPrediction) return;

    // --- Rep Completion Logic ---
    const isCorrectForm = !latestPrediction.includes(1);

    if (isCorrectForm) {
        setFeedback({ status: 'correct', text: 'Excellent Form!' });
        
        // If form is correct and a timer isn't already running, start one.
        if (!correctFormTimer.current) {
            console.log("Correct form detected, starting 2-second timer for rep completion...");
            correctFormTimer.current = setTimeout(() => {
                // After 2 seconds of correct form, the rep is complete.
                console.log("Timer fired! Rep complete.");
                // We'll use a placeholder score for now.
                // In your real app, this would be a calculated quality score.
                const placeholderQualityScore = 95.0; 
                handleRepComplete(placeholderQualityScore);
                
                // Clear the timer so it can be started again for the next rep
                if(correctFormTimer.current) {
                    clearTimeout(correctFormTimer.current);
                    correctFormTimer.current = null;
                }
            }, 2000); // 2000 milliseconds = 2 seconds
        }
    } else {
        setFeedback({ status: 'incorrect', text: 'Adjust Your Form' });

        // If form becomes incorrect, cancel any existing "correct form" timer.
        if (correctFormTimer.current) {
            console.log("Form became incorrect, cancelling timer.");
            clearTimeout(correctFormTimer.current);
            correctFormTimer.current = null;
        }
    }
  }, [latestPrediction, isProcessing]);

  const detect = useCallback(() => {
    const webcam = webcamRef.current;
    const canvas = canvasRef.current;

    if (!poseLandmarker || !webcam || !canvas || typeof webcam.video === "undefined" || webcam.video?.readyState !== 4) {
      return;
    }
    const video = webcam.video as HTMLVideoElement;
    const videoStreamWidth = video.videoWidth;
    const videoStreamHeight = video.videoHeight;

    if (canvas.width !== videoStreamWidth) canvas.width = videoStreamWidth;
    if (canvas.height !== videoStreamHeight) canvas.height = videoStreamHeight;

    const videoDisplayWidth = video.offsetWidth;
    const videoDisplayHeight = video.offsetHeight;

    if (canvas.style.width !== `${videoDisplayWidth}px`) canvas.style.width = `${videoDisplayWidth}px`;
    if (canvas.style.height !== `${videoDisplayHeight}px`) canvas.style.height = `${videoDisplayHeight}px`;

    let newTimestamp = performance.now();
    if (lastTimestampRef.current >= newTimestamp) {
      newTimestamp = lastTimestampRef.current + 1;
    }
    lastTimestampRef.current = newTimestamp;

    const results = poseLandmarker.detectForVideo(video, lastTimestampRef.current);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Failed to Load 2d context from canvas!");
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results && results.landmarks && results.landmarks.length > 0) {
      const allLandmarks = results.landmarks[0];
      processFrame(oheExerciseRef.current, allLandmarks);

      const errorIndices = new Set<number>();

      if (latestPrediction) {
        latestPrediction.forEach((value, index) => {
          if (value === 1) {
            const keypointIndex = PREDICTION_TO_KEYPOINT_MAP[index];
            if (keypointIndex !== undefined) {
              errorIndices.add(keypointIndex);
            }
          }
        });
      }

      for (const connection of UPPER_BODY_CONNECTIONS) {
        const startLandmark = allLandmarks[connection.start];
        const endLandmark = allLandmarks[connection.end];

        if (startLandmark && endLandmark) {
          const isError = errorIndices.has(connection.start) || errorIndices.has(connection.end);
          const color = isError ? '#C70039 ' : '#50C878';

          ctx.beginPath();
          ctx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height);
          ctx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height);
          ctx.lineWidth = 4; ctx.strokeStyle = color; ctx.stroke();
        }
      }

      for (const index of UPPER_BODY_INDICES) {
        const landmark = allLandmarks[index];
        if (landmark) {
          const isError = errorIndices.has(index);
          const color = isError ? '#C70039 ' : '#FFFFFF';
          ctx.beginPath();
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 7, 0, 2 * Math.PI);
          ctx.fillStyle = color; ctx.fill();
        }
      }
    } else {
      console.log("No results")
    }
  }, [processFrame, poseLandmarker, latestPrediction]);

  useEffect(() => {
    const runAnimation = () => {
      if (!isProcessing) {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        } return;
      }
      detect();
      animationFrameIdRef.current = requestAnimationFrame(runAnimation);
    };
    if (isProcessing) {
      animationFrameIdRef.current = requestAnimationFrame(runAnimation);
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isProcessing, detect]);

  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, []);

  const handleTogglePlay = async () => {
    // Check if we are starting a session for the very first time
    if (sessionState === 'idle') {
      if (!user || !activeRequirement) {
        setError("User or exercise data is missing. Cannot start session.");
        return;
      }
      
      try {
        // --- THIS IS THE NEW LOGIC ---
        // Call the API to create the session record in the database
        const newSession = await startSession(user.id, activeRequirement.exercise_id);
        
        // Save the ID of the new session in our state
        setActiveSessionId(newSession.id);
        
        console.log("Started new session with ID:", newSession.id);

        const newSet = await addSetToSession(user.id, newSession.id, 1);
        setActiveSetId(newSet.id);
        console.log("Started new set with ID:", newSet.id);
        
        // Now, proceed with the existing logic to start the UI
        setSessionState('running');
        setIsProcessing(true);
        // -----------------------------
      } catch (err: any) {
        setError("Failed to start a new session on the server.");
        console.error(err);
      }

    } else if (sessionState === 'paused') {
      setSessionState('running');
      setIsProcessing(true);
    } else if (sessionState === 'running') {
      setSessionState('paused');
      setIsProcessing(false);
    }
  };

  const handleEnd = async () => {
    setIsProcessing(false);
    setSessionState('idle');
    if (user && activeSessionId) {
        try {
            // In a real app, you would calculate the average score of all reps.
            // For now, we'll use the 'accuracy' state as a placeholder.
            const finalSessionScore = accuracy;
            
            await endSession(user.id, activeSessionId, finalSessionScore);
            console.log("Session ended and saved successfully.");

            // Give user feedback and redirect them back to the dashboard
            alert("Session complete! Great work.");
            // We need the navigate function for this. Let's add it.
            // const navigate = useNavigate(); at the top of the component.
            navigate('/dashboard');

        } catch (err) {
            console.error("Failed to end session:", err);
            setError("There was a problem saving your session results.");
        }
    }
    setFeedback({ status: 'waiting', text: 'Press Play to Begin' });
    setCurrentReps(0);
    setAccuracy(0);
    setCurrentSet(1);
    setActiveSessionId(null);
    setActiveSetId(null);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    }
  };

  const handleReady = () => {
    setIsSetUpDialogOpen(false);

    // TODO: Finish what to do when the user is ready
    // TODO: run toggle play or something

    if (sessionState === "idle") {
      setSessionState('running');
      setIsProcessing(true);
    }

  }

  const handleRepComplete = async (qualityScore: number) => {
    // We need all these IDs to save the rep correctly. If any are missing, do nothing.
    if (!user || !activeSessionId || !activeSetId || !activeRequirement) {
        console.error("Cannot save rep: missing user, session, set, or requirement ID.");
        return;
    }

    // --- Update UI State ---
    const newRepCount = currentReps + 1;
    setCurrentReps(newRepCount);
    
    // --- Save to Database ---
    try {
        await addRepToSet(user.id, activeSessionId, activeSetId, {
            rep_number: newRepCount,
            rep_quality_score: qualityScore,
        });
        console.log(`Saved rep #${newRepCount} for set ${activeSetId}`);
    } catch (err) {
        console.error("Failed to save repetition:", err);
        // You could add logic here to show an error to the user if saving fails
    }

    // --- Check for Set Completion ---
    if (newRepCount >= activeRequirement.number_of_reps) {
        console.log(`Set ${currentSet} complete!`);
        // We will add the logic for starting the next set here in the next step.
        // --- ADD THIS LOGIC ---
      // Pause the session to give the user a break
      setSessionState('paused');
      setIsProcessing(false);
      setFeedback({ status: 'waiting', text: 'Set Complete! Take a break.' });

      // Check if there are more sets to do
      if (currentSet < activeRequirement.number_of_sets) {
        // --- Prepare for the NEXT set ---
        const nextSetNumber = currentSet + 1;
        
        // Wait for a 5-second rest period before starting the next set
        setTimeout(async () => {
            try {
                // Create the new set record in the database
                const newSet = await addSetToSession(user!.id, activeSessionId!, nextSetNumber);
                setActiveSetId(newSet.id);
                
                // Update the UI for the new set
                setCurrentSet(nextSetNumber);
                setCurrentReps(0); // Reset rep count for the new set
                setFeedback({ status: 'waiting', text: `Starting Set ${nextSetNumber}` });

                // Optional: a small delay before auto-resuming
                setTimeout(() => {
                    setSessionState('running');
                    setIsProcessing(true);
                }, 1500);

            } catch(err) {
                console.error("Failed to start next set:", err);
                setError("Could not start the next set. Please end the session.");
            }
        }, 5000); // 5-second rest period

      } else {
        // --- All sets are complete! End the session. ---
        console.log("All sets complete. Ending session.");
        handleEnd(); // Call the existing handleEnd function
      }
      // --- END OF NEW LOGIC ---
    }
  };

  // --- INTEGRATION: Update UI based on prediction ---
  useEffect(() => {
    if (!isProcessing) return;
    if (latestPrediction) {
      if (latestPrediction.includes(1)) {
        setFeedback({ status: 'incorrect', text: 'Adjust Your Form' });
      }
      else { setFeedback({ status: 'correct', text: 'Excellent Form!' }); setAccuracy(prev => Math.min(prev + 0.1, 98)); }
    }
    console.log(latestPrediction);
  }, [latestPrediction, isProcessing]);

  // --- JSX & Dynamic Styles ---
  const totalSets = activeRequirement?.number_of_sets || 0;
  const totalReps = activeRequirement?.number_of_reps || 0;
  const repProgress = totalReps > 0 ? (currentReps / totalReps) * 100 : 0;
  const feedbackStyles: { [key in FeedbackStatus]: string } = { waiting: 'text-slate-500', correct: 'text-green-500', incorrect: 'text-yellow-600' };
  const FeedbackIcon = feedback.status === 'correct' ? CheckCircle2 : AlertTriangle;
  const PlayIcon = sessionState === 'running' ? Pause : Play;

  // --- VideoPlaceholder Component ---
  const VideoPlaceholder = ({ title }: { title: string }) => (
    <div className="w-full min-h-[300px] lg:min-h-[400px] bg-black rounded-xl lg:rounded-2xl flex items-center justify-center text-slate-400 relative overflow-hidden">
      <Video className="w-16 h-16 lg:w-24 lg:h-24 text-slate-700" />
      <div className="absolute top-3 left-3 lg:top-4 lg:left-4"><p className="text-base lg:text-lg font-semibold text-white px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg">{title}</p></div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900">

      <UserPositionSetupDialog isOpen={isSetUpDialogOpen} onClose={() => { setIsSetUpDialogOpen(false) }} onReady={handleReady} />
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-4 lg:px-6 py-3 lg:py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(prev => !prev)} className="hover:bg-slate-100 hidden md:inline-flex"><img src={sidebarLogo} alt="Menu Icon" className="w-6 h-6" /></Button>
            <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbPage className="text-lg lg:text-xl font-semibold text-slate-900">
                {isLoading ? 'Loading...' : error ? 'Error' : exerciseName}
            </BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 lg:p-6 bg-white overflow-y-auto">
        
        {/* --- Conditional Rendering Block --- */}
        {isLoading ? (
          <div className="lg:col-span-2 text-center p-8">Loading session details...</div>
        ) : error ? (
          <div className="lg:col-span-2 text-center p-8 text-red-500">Error: {error}</div>
        ) : (
          <>
            {/* This content only renders on success */}
            <div className="w-full min-h-[300px] shadow-md bg-black rounded-xl lg:rounded-2xl flex items-center justify-center relative overflow-hidden">
              {sessionState !== 'idle' ? (
                <>
                  <Webcam ref={webcamRef} className="w-full h-full object-cover" mirrored={true} videoConstraints={{ facingMode: 'user' }} />
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full rotate-y-180" />
                </>
              ) : (
                <></>
              )}
              <div className="absolute top-3 left-3 lg:top-4 lg:left-4"><p className="text-base lg:text-lg font-semibold text-white px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg">Your Camera</p></div>
            </div>
            <VideoPlaceholder title="Guide Video" />
          </>
        )}
        {/* --- End Conditional Rendering Block --- */}

      </main>

      <footer className="flex-shrink-0 bg-white border-t border-slate-200 shadow-upper p-4">
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between h-full max-w-7xl mx-auto gap-4 lg:gap-8">
          <div className="flex items-center gap-4 lg:gap-6 order-2 lg:order-1">
            <div className="relative w-20 h-20 lg:w-24 lg:h-24">
              <svg className="w-full h-full" viewBox="0 0 100 100"><circle className="text-slate-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" /><circle className="text-blue-600 transition-all duration-500" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" strokeDasharray={282.74} strokeDashoffset={282.74 * (1 - repProgress / 100)} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} /></svg>
              <span className="absolute inset-0 flex items-center justify-center text-3xl lg:text-4xl font-bold text-slate-800">{currentReps}</span>
            </div>
            <div><p className="text-base lg:text-lg text-slate-500">REPS</p><p className="text-xl lg:text-2xl font-semibold text-slate-800">Set {currentSet} of {totalSets}</p></div>
          </div>
          <div className="flex flex-col items-center gap-2 order-1 lg:order-2">
            <div className={`flex items-center gap-3 font-bold text-xl lg:text-2xl transition-colors ${feedbackStyles[feedback.status]}`}>
              {feedback.status !== 'waiting' && <FeedbackIcon className="w-7 h-7 lg:w-8 lg:h-8" />}
              <span>{feedback.text}</span>
            </div>
            <div className="w-60 lg:w-72"><Progress value={accuracy} className="h-2 bg-slate-200" /><p className="text-xs text-center mt-1 text-slate-500">Session Accuracy: {accuracy}%</p></div>
          </div>
          <div className="flex flex-row-reverse lg:flex-row items-center gap-4 order-3 lg:order-3">
            <Button size="lg" className="h-14 w-14 lg:h-16 lg:w-16 p-0 rounded-full shadow-lg" onClick={handleTogglePlay}><PlayIcon className="w-7 h-7 lg:w-8 lg:h-8" /></Button>
            <Button size="lg" variant="outline" className="h-14 lg:h-16 text-base" onClick={handleEnd} disabled={sessionState === 'idle'}><Square className="w-5 h-5 mr-2" /> End Session</Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SessionPage;
