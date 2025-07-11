// src/pages/Session/SessionPage.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from "react-webcam";
import { usePoseSequence } from "../../hooks/usePoseSequence";
import { usePoseLandmarker } from "../../hooks/usePoseLandmarker.ts";
import UserPositionSetupDialog from './UserPositionSetupDialog.tsx';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  getUserSessionRequirements,
  type SessionRequirement,
  startSession,
  endSession,
  addSetToSession,
  addRepToSet,
  updateSessionRequirement,
  getUserSessionsByTimeRange,
  getExercises,
  type Exercise,
  getUserProfile
} from '@/api/userService';
import { useSidebar } from "@/context/SidebarContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Video, CheckCircle2, AlertTriangle, Play, Square, Pause } from 'lucide-react';
import sidebarLogo from "@/assets/imgs/sidebar.png";

import flankStretchVideo from '@/assets/videos/fs-sitting.mp4';
import hidingFaceVideo from '@/assets/videos/hf-sitting.mp4';
import torsoRotationVideo from '@/assets/videos/tr-sitting.mp4';

const UPPER_BODY_CONNECTIONS = [
  { start: 11, end: 12, name: 'shoulders' }, { start: 11, end: 13, name: 'left_upper_arm' }, { start: 13, end: 15, name: 'left_lower_arm' },
  { start: 12, end: 14, name: 'right_upper_arm' }, { start: 14, end: 16, name: 'right_lower_arm' }, { start: 11, end: 23, name: 'left_torso' },
  { start: 12, end: 24, name: 'right_torso' }, { start: 23, end: 24, name: 'hips' }
];
const PREDICTION_TO_KEYPOINT_MAP: { [key: number]: number } = { 0: 11, 1: 12, 2: 13, 3: 14, 4: 15, 5: 16 };
const UPPER_BODY_INDICES = [11, 12, 13, 14, 15, 16, 23, 24];
type FeedbackStatus = 'waiting' | 'correct' | 'incorrect';

const videoMap: { [key: string]: string } = {
  "Flank Stretch": flankStretchVideo,
  "Hiding Face": hidingFaceVideo,
  "Torso Rotation": torsoRotationVideo,
};

const exerciseApiNameToIdentifier: { [key: string]: string } = {
  "Flank Stretch": "flank_stretch",
  "Hiding Face": "hiding_face",
  "Torso Rotation": "torso_rotation"
}

const exerciseVectorMap: { [key: string]: number[] } = {
  "flank_stretch": [1.0, 0.0, 0.0],
  "hiding_face": [0.0, 1.0, 0.0],
  "torso_rotation": [0.0, 0.0, 1.0],
}

function SessionPage() {
  const { requirementId } = useParams<{ requirementId: string }>();
  const { user } = useAuth();
  const { setSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const { latestPrediction, processFrame, status: poseStatus } = usePoseSequence();
  const { poseLandmarker, landmarkerStatus } = usePoseLandmarker();

  const [sessionState, setSessionState] = useState<'idle' | 'running' | 'paused' | 'in_rest'>('idle');
  const [feedback, setFeedback] = useState<{ status: FeedbackStatus; text: string }>({ status: 'waiting', text: 'Align in Camera to Start' });
  const [currentReps, setCurrentReps] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isSetUpDialogOpen, setIsSetUpDialogOpen] = useState<boolean>(true);
  const [isPainModalOpen, setIsPainModalOpen] = useState<boolean>(false);
  const [painScore, setPainScore] = useState<number>(5);

  const [activeRequirement, setActiveRequirement] = useState<SessionRequirement | null>(null);
  const [exerciseName, setExerciseName] = useState<string>('Loading Exercise...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [activeSetId, setActiveSetId] = useState<number | null>(null);
  const [restCountdown, setRestCountdown] = useState<number | null>(null);
  const activeSessionIdRef = useRef<number | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTimestampRef = useRef<number>(-1);
  const animationFrameIdRef = useRef<number | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const currentRepPredictions = useRef<number[][]>([]);
  const sessionScores = useRef<number[]>([]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user || !requirementId) return;
      try {
        setIsLoading(true);
        const [requirements, exercises] = await Promise.all([
          getUserSessionRequirements(user.id),
          getExercises()
        ]);
        const req = requirements.find(r => r.id === parseInt(requirementId, 10));
        if (!req) throw new Error("Session requirement not found for this user.");
        const exercise = exercises.find(ex => ex.id === req.exercise_id);
        if (!exercise) throw new Error(`Exercise with ID ${req.exercise_id} not found.`);
        setExerciseName(exercise.name);
        setActiveRequirement(req);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load session details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessionData();
  }, [user, requirementId]);


  const detect = useCallback(() => {
    const webcam = webcamRef.current;
    const canvas = canvasRef.current;
    if (!poseLandmarker || !webcam || !canvas || typeof webcam.video === "undefined" || webcam.video?.readyState !== 4) return;
    const video = webcam.video as HTMLVideoElement;
    const videoStreamWidth = video.videoWidth;
    const videoStreamHeight = video.videoHeight;
    if (canvas.width !== videoStreamWidth) canvas.width = videoStreamWidth;
    if (canvas.height !== videoStreamHeight) canvas.height = videoStreamHeight;
    let newTimestamp = performance.now();
    if (lastTimestampRef.current >= newTimestamp) newTimestamp = lastTimestampRef.current + 1;
    lastTimestampRef.current = newTimestamp;
    const results = poseLandmarker.detectForVideo(video, lastTimestampRef.current);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results && results.landmarks && results.landmarks.length > 0) {
      const allLandmarks = results.landmarks[0];
      const exerciseIdentifier = exerciseApiNameToIdentifier[exerciseName] || "hiding_face";
      const exerciseVector = exerciseVectorMap[exerciseIdentifier] || [0, 0, 0];
      processFrame(exerciseVector, allLandmarks, exerciseIdentifier);
      if (latestPrediction) currentRepPredictions.current.push(latestPrediction);
      const errorIndices = new Set<number>();
      if (latestPrediction?.includes(1)) {
        latestPrediction.forEach((value, index) => {
          if (value === 1) errorIndices.add(PREDICTION_TO_KEYPOINT_MAP[index]);
        });
      }
      for (const connection of UPPER_BODY_CONNECTIONS) {
        const start = allLandmarks[connection.start];
        const end = allLandmarks[connection.end];
        if (start && end) {
          const isError = errorIndices.has(connection.start) || errorIndices.has(connection.end);
          ctx.beginPath();
          ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
          ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
          ctx.lineWidth = 4; ctx.strokeStyle = isError ? '#C70039' : '#50C878'; ctx.stroke();
        }
      }
      for (const index of UPPER_BODY_INDICES) {
        const landmark = allLandmarks[index];
        if (landmark) {
          const isError = errorIndices.has(index);
          ctx.beginPath();
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 7, 0, 2 * Math.PI);
          ctx.fillStyle = isError ? '#C70039 ' : '#FFFFFF'; ctx.fill();
        }
      }
    }
  }, [processFrame, poseLandmarker, latestPrediction, exerciseName]);

  useEffect(() => {
    const runAnimation = () => {
      if (!isProcessing) {
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        return;
      }
      detect();
      animationFrameIdRef.current = requestAnimationFrame(runAnimation);
    };
    if (isProcessing) {
      animationFrameIdRef.current = requestAnimationFrame(runAnimation);
    }
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isProcessing, detect]);

  const handleStartSession = useCallback(async () => {
    if (!user || !activeRequirement) {
      setError("User or exercise data is missing.");
      return;
    }
    try {
      const newSession = await startSession(user.id, activeRequirement.exercise_id);
      setActiveSessionId(newSession.id);
      const newSet = await addSetToSession(user.id, newSession.id, { set_number: 1 });
      setActiveSetId(newSet.id);
      setSessionState('running');
      setIsProcessing(true);
      videoRef.current?.play();
      console.log(`Started session ${newSession.id}, set ${newSet.id}`);
    } catch (err: any) {
      setError("Failed to start a new session on the server.");
      console.error(err);
    }
  }, [user, activeRequirement]);

  const handleReady = useCallback(() => {
    setIsSetUpDialogOpen(false);
    handleStartSession();
  }, [handleStartSession]);

  const handleTogglePlay = useCallback(() => {
    if (sessionState === 'running') {
      setSessionState('paused');
      setIsProcessing(false);
      videoRef.current?.pause();
    } else if (sessionState === 'paused') {
      setSessionState('running');
      setIsProcessing(true);
      videoRef.current?.play();
    }
  }, [sessionState]);

  const handleEnd = useCallback(async () => {
    setIsProcessing(false);
    setSessionState('idle');
    const currentSessionId = activeSessionIdRef.current;
    if (user && currentSessionId) {
      const finalSessionScore = sessionScores.current.length > 0
        ? sessionScores.current.reduce((a, b) => a + b, 0) / sessionScores.current.length : 0;
      try {
        await endSession(user.id, currentSessionId, finalSessionScore);
        console.log("Session ended and saved successfully.");
        await handleProgressionLogic();
      } catch (err) {
        console.error("Failed to end session:", err);
        setError("There was a problem saving your session results.");
      }
    } else {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleProgressionLogic = useCallback(async () => {
    if (!user) return;
    try {
      const [sessionsThisWeek, profile] = await Promise.all([
        getUserSessionsByTimeRange(user.id, 'this_week'),
        getUserProfile(user.id)
      ]);
      const userSchedule = profile.onboarding_data?.preferred_schedule || 3;
      if (sessionsThisWeek.length >= userSchedule) {
        setIsPainModalOpen(true);
      } else {
        alert("Session complete! Great work.");
        navigate('/app');
      }
    } catch (err) {
      console.error("Failed to fetch data for progression check:", err);
      alert("Session complete! Could not check for progression update.");
      navigate('/app');
    }
  }, [user, navigate]);

  const handlePainSubmit = useCallback(async () => {
    if (!user || !activeRequirement) return;
    setIsPainModalOpen(false);
    let { number_of_reps: newReps, number_of_sets: newSets } = activeRequirement;
    const overallScore = sessionScores.current.length > 0
      ? sessionScores.current.reduce((a, b) => a + b, 0) / sessionScores.current.length : 0;
    if (overallScore >= 90 && painScore <= 3) {
      if (newReps < 8) newReps += 1;
      else if (newSets < 5) {
        newSets += 1;
        newReps = newSets + 2;
      }
    } else if (overallScore < 75 || painScore >= 7) {
      newReps = Math.max(3, newReps - 1);
    }
    try {
      await updateSessionRequirement(user.id, activeRequirement.id, { number_of_reps: newReps, number_of_sets: newSets });
      alert(`Progression updated for next week! New goal: ${newSets} sets of ${newReps} reps.`);
    } catch (err) {
      console.error("Failed to update progression:", err);
      alert("Could not save your progression for next week. Please try again later.");
    } finally {
      navigate('/app');
    }
  }, [user, activeRequirement, painScore, navigate]);

  const handleStartNextSet = useCallback(async () => {
    const currentSessionId = activeSessionIdRef.current;
    if (!user || !currentSessionId) return;
    const nextSetNumber = currentSet + 1;
    try {
      const newSet = await addSetToSession(user.id, currentSessionId, { set_number: nextSetNumber });
      setActiveSetId(newSet.id);
      setCurrentSet(nextSetNumber);
      setCurrentReps(0);
      setFeedback({ status: 'waiting', text: `Starting Set ${nextSetNumber}` });
      setSessionState('running');
      setIsProcessing(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Failed to start next set:", err);
      setError("Could not start the next set. Please end the session.");
    }
  }, [user, currentSet]);

  const handleRepComplete = useCallback(async () => {
    setIsProcessing(false);

    let totalErrors = 0;
    for (const prediction of currentRepPredictions.current) {
      // An error is any frame where the prediction array contains a 1
      if (prediction.some(value => value === 1)) {
        totalErrors++;
      }
    }
    const totalPredictions = currentRepPredictions.current.length;
    const qualityScore = totalPredictions > 0
      ? ((totalPredictions - totalErrors) / totalPredictions) * 100
      : 100; // Default to 100% if no predictions, avoiding division by zero

    sessionScores.current.push(qualityScore);
    currentRepPredictions.current = []; // Reset for next rep
    const newRepCount = currentReps + 1;

    const currentSessionId = activeSessionIdRef.current;
    if (user && currentSessionId && activeSetId) {
      try {
        await addRepToSet(user.id, currentSessionId, activeSetId, {
          rep_number: newRepCount,
          rep_quality_score: qualityScore,
        });
        setCurrentReps(newRepCount);
        console.log(`Saved rep #${newRepCount} with score ${qualityScore.toFixed(2)}`);
      } catch (err) {
        console.error("Failed to save repetition:", err);
        setError("Could not save your last rep. Please check your connection.");
      }
    }
    if (newRepCount >= (activeRequirement?.number_of_reps || 0)) {
      if (currentSet >= (activeRequirement?.number_of_sets || 0)) {
        await handleEnd();
      } else {
        setSessionState('in_rest');
        setFeedback({ status: 'waiting', text: 'Set Complete! Take a break.' });
        setRestCountdown(60);
      }
    } else {
      setTimeout(() => {
        if (videoRef.current && videoRef.current.paused && sessionState !== 'paused' && sessionState !== 'in_rest') {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
          setIsProcessing(true);
        }
      }, 1500);
    }
  }, [user, activeSetId, activeRequirement, currentReps, currentSet, handleEnd, sessionState]);

  useEffect(() => {
    if (restCountdown === null) return;
    if (restCountdown <= 0) {
      setRestCountdown(null);
      handleStartNextSet();
    } else {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
      restTimerRef.current = setTimeout(() => setRestCountdown(c => (c ? c - 1 : 0)), 1000);
    }
    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [restCountdown, handleStartNextSet]);

  useEffect(() => {
    if (latestPrediction) {
      setFeedback({
        status: latestPrediction.includes(1) ? 'incorrect' : 'correct',
        text: latestPrediction.includes(1) ? 'Adjust Your Form' : 'Excellent Form!'
      });
    }
  }, [latestPrediction]);

  const totalSets = activeRequirement?.number_of_sets || 0;
  const totalReps = activeRequirement?.number_of_reps || 0;
  const repProgress = totalReps > 0 ? (currentReps / totalReps) * 100 : 0;
  const feedbackStyles: { [key in FeedbackStatus]: string } = { waiting: 'text-slate-500', correct: 'text-green-500', incorrect: 'text-yellow-600' };
  const FeedbackIcon = feedback.status === 'correct' ? CheckCircle2 : AlertTriangle;
  const PlayIcon = sessionState === 'running' ? Pause : Play;
  const videoSrc = videoMap[exerciseName] || '';

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900">
      <UserPositionSetupDialog isOpen={isSetUpDialogOpen} onClose={() => setIsSetUpDialogOpen(false)} onReady={handleReady} />
      <Dialog open={isPainModalOpen} onOpenChange={setIsPainModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Weekly Feedback</DialogTitle><DialogDescription>On a scale of 1-10, how would you rate your pain during this week's exercises? This helps us adjust your plan.</DialogDescription></DialogHeader>
          <div className="py-4"><Label htmlFor="pain-score" className="text-right">Pain Score (1-10)</Label><Input id="pain-score" type="number" value={painScore} onChange={(e) => setPainScore(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)))} className="mt-2" /></div>
          <DialogFooter><Button onClick={handlePainSubmit}>Submit and Finish</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-4 lg:px-6 py-3 lg:py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(prev => !prev)} className="hover:bg-slate-100 hidden md:inline-flex"><img src={sidebarLogo} alt="Menu Icon" className="w-6 h-6" /></Button>
            <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbPage className="text-lg lg:text-xl font-semibold text-slate-900 capitalize">
              {isLoading ? 'Loading...' : error ? 'Error' : exerciseName}
            </BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
          </div>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 lg:p-6 bg-white overflow-y-auto">
        {isLoading ? (<div className="lg:col-span-2 text-center p-8">Loading session details...</div>)
          : error ? (<div className="lg:col-span-2 text-center p-8 text-red-500">Error: {error}</div>)
            : (
              <>
                <div className="w-full min-h-[300px] shadow-md bg-black rounded-xl lg:rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {!isSetUpDialogOpen && (
                    <>
                      <Webcam ref={webcamRef} className="w-full h-full object-cover" mirrored={true} videoConstraints={{ facingMode: 'user' }} />
                      <canvas ref={canvasRef} className="rotate-y-180 absolute top-0 left-0 w-full h-full" />
                    </>
                  )}
                  <div className="absolute top-3 left-3 lg:top-4 lg:left-4"><p className="text-base lg:text-lg font-semibold text-white px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg">Your Camera</p></div>
                </div>
                <div className="w-full min-h-[300px] shadow-md bg-black rounded-xl lg:rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <video ref={videoRef} src={videoSrc} onEnded={handleRepComplete} muted loop={false} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 lg:top-4 lg:left-4"><p className="text-base lg:text-lg font-semibold text-white px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg">Guide Video</p></div>
                </div>
              </>
            )}
      </main>
      <footer className="flex-shrink-0 bg-white border-t border-slate-200 shadow-upper p-4">
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between h-full max-w-7xl mx-auto gap-4 lg:gap-8">
          {sessionState === 'in_rest' && restCountdown !== null ? (
            <div className="w-full flex flex-col items-center justify-center order-1 lg:order-2">
              <p className="text-xl font-bold text-blue-600">REST</p><p className="text-5xl font-bold text-slate-800">{restCountdown}s</p><p className="text-slate-500">Next set starts soon...</p>
            </div>
          ) : (
            <>
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
                <div className="w-60 lg:w-72">
                  <Progress value={sessionScores.current.length > 0 ? (sessionScores.current.reduce((a, b) => a + b, 0) / sessionScores.current.length) : 0} className="h-2 bg-slate-200" />
                  <p className="text-xs text-center mt-1 text-slate-500">Session Accuracy: {sessionScores.current.length > 0 ? (sessionScores.current.reduce((a, b) => a + b, 0) / sessionScores.current.length).toFixed(0) : 0}%</p>
                </div>
              </div>
              <div className="flex flex-row-reverse lg:flex-row items-center gap-4 order-3 lg:order-3">
                <Button size="lg" className="h-14 w-14 lg:h-16 lg:w-16 p-0 rounded-full shadow-lg" onClick={handleTogglePlay} disabled={sessionState === 'idle' || sessionState === 'in_rest'}><PlayIcon className="w-7 h-7 lg:w-8 lg:h-8" /></Button>
                <Button size="lg" variant="outline" className="h-14 lg:h-16 text-base" onClick={handleEnd} disabled={sessionState === 'idle'}><Square className="w-5 h-5 mr-2" /> End Session</Button>
              </div>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};

export default SessionPage;
