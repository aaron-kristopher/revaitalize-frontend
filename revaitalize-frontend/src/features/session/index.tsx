import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from "react-webcam";

// UI imports
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/shared/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { CheckCircle2, AlertTriangle, Play, Square, Pause, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"

// Hooks and Components
import UserPositionSetupDialog from "./components/UserPositionSetupDialog.tsx";
import { useSessionLifecycle } from "./hooks/useSessionLifecycle.ts";
import { useSessionDetection } from "./hooks/useSessionDetection.ts";
import { useSessionFeedback } from "./hooks/useSessionFeedback.ts";
import { useSessionSetup } from "./hooks/useSessionSetup"

// shared context
import { useSidebar } from "@/shared/context/SidebarContext";
import { useSharedPoseLandmarker } from '@/shared/context/PoseLandmarkerContext.tsx';
import sidebarLogo from "@/assets/imgs/sidebar.png";
import flankStretchVideo from "@/assets/videos/fs-sitting.mp4";
import hidingFaceVideo from "@/assets/videos/hf-sitting.mp4";
import torsoRotationVideo from "@/assets/videos/tr-sitting.mp4";

const videoMap: { [key: string]: string } = {
  "Flank Stretch": flankStretchVideo,
  "Hiding Face": hidingFaceVideo,
  "Torso Rotation": torsoRotationVideo,
};

function SessionPage() {

  const { setSidebarOpen } = useSidebar();
  const { poseLandmarker, landmarkerStatus } = useSharedPoseLandmarker();
  const navigate = useNavigate();

  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { isLoading, error, activeRequirement, exerciseName } = useSessionSetup();

  // Debug video source
  useEffect(() => {
    if (exerciseName && videoMap[exerciseName]) {
      console.log(`Loading video for exercise: ${exerciseName}`);
      console.log(`Video source: ${videoMap[exerciseName]}`);
    } else {
      console.warn(`No video found for exercise: ${exerciseName}`);
    }
  }, [exerciseName]);

  const {
    sessionState, setSessionState,
    currentReps, currentSet,
    restCountdown,
    isPainModalOpen, setIsPainModalOpen,
    isAlertVisible, alertContentRef,
    painScore, setPainScore,
    currentRepPredictionsRef,
    handleStartSession,
    handleRepComplete,
    handleEndSession,
    handlePainSubmit,
    sessionScores,
    isTodayAllowed,
  } = useSessionLifecycle(activeRequirement, videoRef);

  const { latestPredictionRef } = useSessionDetection({
    isEnabled: sessionState === 'running',
    webcamRef,
    canvasRef,
    poseLandmarker,
    exerciseName,
    currentRepPredictionsRef,
  });

  const { feedback } = useSessionFeedback(latestPredictionRef.current, sessionState);

  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [isUserPositioned, setIsUserPositioned] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);


  // Effect to determine when the entire system is ready to begin
  useEffect(() => {

    if (!isLoading && landmarkerStatus === 'ready')
      setIsReadyToStart(true);

    else
      setIsReadyToStart(false);

  }, [isLoading, landmarkerStatus]);

  const handleReadyFromDialog = useCallback(() => setIsUserPositioned(true), []);

  useEffect(() => {
    if (isUserPositioned && isReadyToStart) {
      handleStartSession();
    }
  }, [isUserPositioned, isReadyToStart, handleStartSession]);

  const handleTogglePlay = () => {
    setSessionState(prev => prev === 'running' ? 'paused' : 'running');
  };

  // Video event handlers
  const handleVideoLoad = useCallback(() => {
    console.log("Video loaded successfully");
    if (videoRef.current) {
      const video = videoRef.current;
      console.log(`Video duration: ${video.duration}s, readyState: ${video.readyState}`);

      // Check if video duration is reasonable
      if (video.duration < 5) {
        console.warn("Video duration is very short, this might cause issues with rep completion");
      }
    }
    setVideoError(null);
  }, []);

  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e);
    if (videoRef.current) {
      const video = videoRef.current;
      console.error(`Video error details - readyState: ${video.readyState}, networkState: ${video.networkState}`);
    }
    setVideoError("Failed to load video");
  }, []);

  const handleVideoEnded = useCallback(() => {
    console.log(`=== VIDEO ENDED EVENT ===`);
    console.log(`Session state: ${sessionState}`);
    console.log(`Current reps: ${currentReps}`);
    console.log(`Required reps: ${activeRequirement?.number_of_reps}`);
    console.log(`Current set: ${currentSet}`);
    console.log(`Total sets: ${activeRequirement?.number_of_sets}`);

    // Only call handleRepComplete if session is actually running and video actually played
    if (sessionState === 'running' && videoRef.current) {
      const video = videoRef.current;
      const videoPlayedDuration = video.currentTime;
      const minPlayDuration = Math.max(1, video.duration * 0.5); // Match the duration check in useSessionLifecycle

      console.log(`Video ended with duration: ${videoPlayedDuration.toFixed(2)}s, min required: ${minPlayDuration.toFixed(2)}s`);

      if (videoPlayedDuration >= minPlayDuration) {
        console.log("Session is running and video played sufficiently, calling handleRepComplete");
        handleRepComplete();
      } else {
        console.log("Video ended too early, ignoring");
        // Restart video for this rep
        video.currentTime = 0;
        video.play();
      }
    } else {
      console.log("Session not running or video not available, ignoring video end");
    }
    console.log(`=== END VIDEO ENDED EVENT ===`);
  }, [sessionState, handleRepComplete, currentReps, activeRequirement, currentSet]);

  const totalSets = activeRequirement?.number_of_sets || 0;
  const totalReps = activeRequirement?.number_of_reps || 0;
  const repProgress = totalReps > 0 ? (currentReps / totalReps) * 100 : 0;

  const FeedbackIcon = feedback.status === 'correct' ? CheckCircle2 : AlertTriangle;
  const PlayIcon = sessionState === 'running' ? Pause : Play;
  const feedbackStyles = { waiting: 'text-slate-500', correct: 'text-green-500', incorrect: 'text-yellow-600' };

  const overallAccuracy = useMemo(() => {
    const accuracy = sessionScores.length > 0
      ? sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length
      : 0;
    console.log(`Calculating overall accuracy: ${accuracy.toFixed(2)} from ${sessionScores.length} scores: [${sessionScores.join(', ')}]`);
    return accuracy;
  }, [sessionScores]);

  // Debug session scores
  useEffect(() => {
    console.log(`Session scores updated in index.tsx: [${sessionScores.join(', ')}]`);
  }, [sessionScores]);

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }
  if (error) {
    return <div className="flex h-screen w-full items-center justify-center text-red-500">Error: {error}</div>;
  }

  // If today is not allowed (explicit false), don't render the positioning dialog; alert is handled by lifecycle
  const shouldShowPositionDialog = isTodayAllowed !== false;

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900">
      {shouldShowPositionDialog && (
        <UserPositionSetupDialog
          isOpen={!isUserPositioned}
          onClose={() => navigate("/app")}
          onReady={handleReadyFromDialog}
          isSystemReady={isReadyToStart}
        />
      )}

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

        {isAlertVisible && (
          <Alert className="absolute top-20 right-6 z-50 w-auto">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Notice!</AlertTitle>
            <AlertDescription>{alertContentRef.current}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (<div className="lg:col-span-2 text-center p-8">Loading session details...</div>)
          : error ? (<div className="lg:col-span-2 text-center p-8 text-red-500">Error: {error}</div>)
            : (
              <>
                <div className="w-full min-h-[300px] shadow-md bg-black rounded-xl lg:rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {isUserPositioned && (
                    <>
                      <Webcam ref={webcamRef} className="w-full h-full object-cover" mirrored={true} videoConstraints={{ facingMode: 'user' }} />
                      <canvas ref={canvasRef} className="rotate-y-180 absolute top-0 left-0 w-full h-full" />
                    </>
                  )}
                  <div className="absolute top-3 left-3 lg:top-4 lg:left-4">
                    <p className="text-base lg:text-lg font-semibold text-white px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg">Your Camera</p>

                  </div>
                </div>
                <div className="w-full min-h-[300px] shadow-md bg-black rounded-xl lg:rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {videoError ? (
                    <div className="flex items-center justify-center text-white">
                      <p>Video Error: {videoError}</p>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      src={videoMap[exerciseName]}
                      onLoadStart={handleVideoLoad}
                      onLoadedData={handleVideoLoad}
                      onError={handleVideoError}
                      onEnded={handleVideoEnded}
                      muted
                      loop={false}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3 lg:top-4 lg:left-4">
                    <p className="text-base lg:text-lg font-semibold text-white px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg">Guide Video</p>

                  </div>
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
                <div>
                  <p className="text-base lg:text-lg text-slate-500">REPS</p>
                  <p className="text-xl lg:text-2xl font-semibold text-slate-800">Set {currentSet} of {totalSets}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 order-1 lg:order-2">
                <div className={`flex items-center gap-3 font-bold text-xl lg:text-2xl transition-colors ${feedbackStyles[feedback.status]}`}>
                  {feedback.status !== 'waiting' && <FeedbackIcon className="w-7 h-7 lg:w-8 lg:h-8" />}
                  <span>{feedback.text}</span>
                </div>
                <div className="w-60 lg:w-72">
                  <Progress value={overallAccuracy} className="h-2 bg-slate-200" />
                  <p className="text-xs text-center mt-1 text-slate-500">Session Accuracy: {overallAccuracy.toFixed((0))}%</p>
                </div>
              </div>
              <div className="flex flex-row-reverse lg:flex-row items-center gap-4 order-3 lg:order-3">
                <Button size="lg" className="h-14 w-14 lg:h-16 lg:w-16 p-0 rounded-full shadow-lg" onClick={handleTogglePlay} disabled={sessionState === 'idle' || sessionState === 'in_rest'}><PlayIcon className="w-7 h-7 lg:w-8 lg:h-8" /></Button>
                <Button size="lg" variant="outline" className="h-14 lg:h-16 text-base" onClick={() => { handleEndSession(false) }} disabled={sessionState === 'idle'}><Square className="w-5 h-5 mr-2" /> End Session</Button>
              </div>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};

export default SessionPage;
