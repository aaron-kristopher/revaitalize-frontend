import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { SCHEDULE_CONFIG } from "@/shared/config/scheduling";
import { getMostFrequentError } from "../utils/session.utils";
import {
  startSession,
  endSession,
  addSetToSession,
  addRepToSet,
  updateExerciseSet,
  updateSessionRequirement,
  getUserProfile,
  type SessionRequirement
} from "@/shared/api/userService"

export const useSessionLifecycle = (
  activeRequirement: SessionRequirement | null,
  videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessionState, setSessionState] = useState<"idle" | "running" | "paused" | "in_rest">("idle");
  const [currentReps, setCurrentReps] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(0);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [activeSetId, setActiveSetId] = useState<number | null>(null);
  const [restCountdown, setRestCountdown] = useState<number | null>(null);

  const [isPainModalOpen, setIsPainModalOpen] = useState<boolean>(false);
  const [painScore, setPainScore] = useState<number>(5);

  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const alertContentRef = useRef<string>("");

  const currentRepPredictionsRef = useRef<number[][]>([]);
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const mostFrequentErrorRef = useRef<string>("");

  // Add refs to track video state
  const videoStartTimeRef = useRef<number>(0);
  const isVideoPlayingRef = useRef<boolean>(false);

  // Add ref to track current set scores
  const currentSetScoresRef = useRef<number[]>([]);
  // Add ref to track error flags for each rep in the current set
  const currentSetErrorFlagsRef = useRef<string[]>([]);

  // New: track if today is allowed (null = unknown/loading)
  const [isTodayAllowed, setIsTodayAllowed] = useState<boolean | null>(null);
  const hasRunGuardRef = useRef<boolean>(false);
  const hasShownAlertRef = useRef<boolean>(false);

  // Helper: compute allowed days from profile
  const computeAllowedDays = (profile: any) => {
    const scheduleCount = profile.onboarding_data?.preferred_schedule || 3;
    const defaultConfig = SCHEDULE_CONFIG[scheduleCount as keyof typeof SCHEDULE_CONFIG];
    const custom = profile.onboarding_data?.custom_allowed_days;
    const allowedDays = Array.isArray(custom)
      && custom.length === scheduleCount
      && custom.every((d: number) => d >= 0 && d <= 6)
        ? custom
        : defaultConfig.allowedDays;
    return { allowedDays, defaultConfig } as const;
  }

  // New: early scheduling guard; shows alert and redirects if not allowed
  const checkSchedulingAndGuard = useCallback(async () => {
    if (hasRunGuardRef.current) return isTodayAllowed ?? false;
    hasRunGuardRef.current = true;

    if (!user) {
      setIsTodayAllowed(false);
      return false;
    }
    try {
      const profile = await getUserProfile(user.id);
      const { allowedDays } = computeAllowedDays(profile);
      const today = new Date().getDay();
      const allowed = allowedDays.includes(today);
      setIsTodayAllowed(allowed);

      if (!allowed) {
        if (!hasShownAlertRef.current) {
          hasShownAlertRef.current = true;
          toggleAlert("Today is not a scheduled exercise day. Please come back on your next scheduled day.");
          setTimeout(() => navigate("/app"), 2500);
        }
        return false;
      }
      return true;
    } catch (e) {
      setIsTodayAllowed(false);
      if (!hasShownAlertRef.current) {
        hasShownAlertRef.current = true;
        toggleAlert("Unable to verify schedule. Please try again later.");
        setTimeout(() => navigate("/app"), 2500);
      }
      return false;
    }
  }, [user, navigate, isTodayAllowed]);

  useEffect(() => {
    // Run the early guard as soon as lifecycle is used
    checkSchedulingAndGuard();
  }, [checkSchedulingAndGuard]);

  const handleStartSession = useCallback(async () => {
    if (!user || !activeRequirement)
      return;

    console.log("Starting session...");

    const profile = await getUserProfile(user.id);
    const scheduleCount = profile.onboarding_data?.preferred_schedule || 3;
    const defaultConfig = SCHEDULE_CONFIG[scheduleCount as keyof typeof SCHEDULE_CONFIG];
    const custom = profile.onboarding_data?.custom_allowed_days;
    const allowedDays = Array.isArray(custom)
      && custom.length === scheduleCount
      && custom.every(d => d >= 0 && d <= 6)
        ? custom
        : defaultConfig.allowedDays;

    const today = new Date().getDay();

    console.log("Allowed days:", allowedDays);

    if (!allowedDays.includes(today)) {
      if (!hasShownAlertRef.current) {
        hasShownAlertRef.current = true;
        toggleAlert("Today is not a scheduled exercise day. Please come back on your next scheduled day.");
        setTimeout(() => navigate("/app"), 2500);
      }
      return;
    }

    try {
      const newSession = await startSession(user.id, activeRequirement.exercise_id);
      setActiveSessionId(newSession.id);

      const newSet = await addSetToSession(user.id, newSession.id, { set_number: 1 });
      setActiveSetId(newSet.id);

      setCurrentSet(1);
      setCurrentReps(0);
      setSessionState("running");
      console.log("Session started successfully");

      // Reset current set scores for new set
      currentSetScoresRef.current = [];
      // Reset current set error flags for new set
      currentSetErrorFlagsRef.current = [];

    } catch (error: any) {
      console.error("Failed to start session", error);
      toggleAlert((`Failed to start session: ${error.message}`));
    }
  }, [user, activeRequirement, navigate]);

  const handleRepComplete = useCallback(async () => {
    console.log(`=== HANDLE REP COMPLETE START ===`);
    console.log(`User: ${!!user}, Session ID: ${activeSessionId}, Set ID: ${activeSetId}, Requirement: ${!!activeRequirement}`);

    if (!user || !activeSessionId || !activeSetId || !activeRequirement) {
      console.log("Missing required data, returning early");
      return;
    }

    // Prevent multiple calls for the same rep
    if (currentRepPredictionsRef.current.length === 0) {
      console.log("No predictions available, ignoring rep completion");
      return;
    }

    console.log(`Rep completed. Current: ${currentReps + 1}, Required: ${activeRequirement.number_of_reps}, Set: ${currentSet}/${activeRequirement.number_of_sets}`);
    console.log(`Predictions available: ${currentRepPredictionsRef.current.length}`);

    // Check if video actually played for a reasonable duration
    const video = videoRef?.current;
    if (video && video.duration > 0) {
      const videoPlayedDuration = video.currentTime - videoStartTimeRef.current;
      const minPlayDuration = Math.max(1, video.duration * 0.5); // At least 50% of video duration (reduced from 80%)

      console.log(`Video duration check: played=${videoPlayedDuration.toFixed(2)}s, min=${minPlayDuration.toFixed(2)}s, total=${video.duration.toFixed(2)}s`);

      if (videoPlayedDuration < minPlayDuration) {
        console.log("Video ended too early, ignoring rep completion");
        // Reset video and continue
        if (video) {
          video.currentTime = 0;
          video.play();
        }
        return;
      }
    }

    mostFrequentErrorRef.current = getMostFrequentError(currentRepPredictionsRef.current);

    let totalErrors = currentRepPredictionsRef.current.filter(
      pred => pred.some(binaryProb => binaryProb === 1)).length;
    const totalPredictions = currentRepPredictionsRef.current.length;
    const qualityScore = totalPredictions > 0 ? ((totalPredictions - totalErrors) / totalPredictions) * 100 : 100;

    console.log(`Adding session score: ${qualityScore} (total predictions: ${totalPredictions}, errors: ${totalErrors})`);
    console.log(`Current rep predictions before clearing: ${currentRepPredictionsRef.current.length} predictions`);

    // Add to both session scores and current set scores
    setSessionScores(prev => {
      const newScores = [...prev, qualityScore];
      console.log(`Session scores updated: ${newScores.join(', ')}`);
      return newScores;
    });

    // Add to current set scores
    currentSetScoresRef.current.push(qualityScore);
    console.log(`Current set scores: [${currentSetScoresRef.current.join(', ')}]`);

    // Store the error flag for this rep before clearing predictions
    const repErrorFlag = mostFrequentErrorRef.current;
    currentSetErrorFlagsRef.current.push(repErrorFlag);
    console.log(`Current set error flags: [${currentSetErrorFlagsRef.current.join(', ')}]`);

    currentRepPredictionsRef.current = [];
    console.log(`Current rep predictions after clearing: ${currentRepPredictionsRef.current.length} predictions`);

    const newRepCount = currentReps + 1;

    console.log(`Saving rep ${newRepCount} with score ${qualityScore.toFixed(2)}`);

    await addRepToSet(user.id, activeSessionId, activeSetId, {
      rep_number: newRepCount,
      rep_quality_score: qualityScore,
      error_flag: repErrorFlag,
    });

    console.log(`Successfully saved rep ${newRepCount}`);

    setCurrentReps(newRepCount);

    if (newRepCount >= activeRequirement?.number_of_reps) {
      console.log(`Set ${currentSet} completed. Moving to next set or ending session.`);
      console.log(`Total reps completed in this set: ${currentSetScoresRef.current.length}`);
      console.log(`Set scores: [${currentSetScoresRef.current.join(', ')}]`);

      // Calculate set quality score and update the exercise set
      if (currentSetScoresRef.current.length > 0) {
        const setQualityScore = currentSetScoresRef.current.reduce((a, b) => a + b, 0) / currentSetScoresRef.current.length;
        console.log(`Set ${currentSet} quality score: ${setQualityScore.toFixed(2)}`);

        // Determine if any rep in this set had an error by checking stored error flags
        const hasAnyError = currentSetErrorFlagsRef.current.some(errorFlag => errorFlag !== "No Error");

        // Set error_flag based on whether any rep had errors
        const setErrorFlag = hasAnyError ? "With Error" : "No Error";
        console.log(`Set ${currentSet} error flag: ${setErrorFlag} (hasAnyError: ${hasAnyError})`);
        console.log(`Error flags for this set: [${currentSetErrorFlagsRef.current.join(', ')}]`);

        try {
          await updateExerciseSet(user.id, activeSessionId, activeSetId, {
            set_quality_score: setQualityScore,
            error_flag: setErrorFlag,
            is_completed: true
          });
          console.log(`Successfully updated set ${currentSet} with quality score and error flag: ${setErrorFlag}`);
        } catch (error: any) {
          console.error("Failed to update set quality score:", error);
        }
      } else {
        console.warn(`No scores available for set ${currentSet}`);
      }

      if (currentSet >= activeRequirement?.number_of_sets) {
        // All sets and reps completed - end session
        console.log("All sets completed. Ending session.");
        setSessionState("idle");
        await handleEndSession(true);
      } else {
        // Set completed, start rest period
        console.log("Starting rest period.");
        setSessionState("in_rest");
      }
    } else {
      // Rep completed, pause briefly before next rep
      console.log(`Rep ${newRepCount} completed. Pausing briefly before next rep.`);
      setSessionState("paused");
      setTimeout(() => {
        setSessionState(currentState => (currentState === "paused" ? "running" : currentState))
      }, 1500)
    }
  }, [user, activeSessionId, activeSetId, activeRequirement, currentReps, currentSet, videoRef]);

  const handleStartNextSet = useCallback(async () => {
    console.log(`=== HANDLE START NEXT SET CALLED ===`);
    console.log(`Call stack:`, new Error().stack);
    console.log(`User: ${!!user}, Session ID: ${activeSessionId}, Current Set: ${currentSet}`);

    if (!user || !activeSessionId) {
      console.log("Missing user or session ID, returning early");
      return;
    }

    // Prevent duplicate set creation
    if (sessionState !== "in_rest") {
      console.log("Not in rest state, ignoring start next set request");
      return;
    }

    // Prevent duplicate set creation with ref guard
    if (isStartingNewSetRef.current) {
      console.log("Already starting a new set, ignoring duplicate request");
      return;
    }

    isStartingNewSetRef.current = true;
    console.log(`Starting set ${currentSet + 1}`);

    try {
      const newSet = await addSetToSession(user.id, activeSessionId, {
        set_number: currentSet + 1
      });

      console.log(`Successfully created set ${currentSet + 1} with ID ${newSet.id}`);

      setActiveSetId(newSet.id);
      setCurrentSet(currentSet + 1);
      setCurrentReps(0);
      setSessionState("running");

      // Reset current set scores for new set
      currentSetScoresRef.current = [];
      // Reset current set error flags for new set
      currentSetErrorFlagsRef.current = [];

    } catch (error: any) {
      console.log("Failed to start new session: ", error);
    } finally {
      // Reset the guard after a short delay to allow state updates to complete
      setTimeout(() => {
        isStartingNewSetRef.current = false;
        console.log("Reset isStartingNewSetRef guard");
      }, 100);
    }

    console.log(`=== END HANDLE START NEXT SET ===`);
  }, [user, activeSessionId, currentSet, sessionState]);

  const toggleAlert = (content: string) => {
    setIsAlertVisible(true);
    alertContentRef.current = content;

    setTimeout(() => {
      setIsAlertVisible(false);
    }, 2500)
  }

  const handleEndSession = useCallback(async (isComplete: boolean) => {
    if (!user || !activeSessionId)
      return;

    const finalScore = sessionScores.length > 0 ? sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length : 0;

    await endSession(user.id, activeSessionId, finalScore, mostFrequentErrorRef.current, isComplete);

    const profile = await getUserProfile(user.id);
    const scheduleCount = profile.onboarding_data?.preferred_schedule || 3;
    const defaultConfig = SCHEDULE_CONFIG[scheduleCount as keyof typeof SCHEDULE_CONFIG];
    const custom = profile.onboarding_data?.custom_allowed_days;
    const allowedDays = Array.isArray(custom)
      && custom.length === scheduleCount
      && custom.every(d => d >= 0 && d <= 6)
        ? custom
        : defaultConfig.allowedDays;

    // Determine "last day" based on allowedDays (highest weekday index)
    const lastDay = allowedDays.length ? Math.max(...allowedDays) : defaultConfig.lastDay;
    const today = new Date().getDay();

    if (today === lastDay) {
      setIsPainModalOpen(true);
    } else {
      toggleAlert("Session complete! Great Work");
      setTimeout(() => navigate("/app"), 2500);
    }
  }, [user, activeSessionId, navigate, sessionScores]);

  const handlePainSubmit = useCallback(async () => {
    if (!user || !activeRequirement)
      return;

    setIsPainModalOpen(false);

    let { number_of_reps: newReps, number_of_sets: newSets } = activeRequirement;

    const overallScore = sessionScores.length > 0 ? (sessionScores.reduce(
      (a, b) => a + b, 0) / sessionScores.length) : 0;

    if (overallScore >= 90 && painScore <= 3) {
      if (newReps < 8) {
        newReps += 1;

      } else if (newSets < 5) {
        newSets += 1;
        newReps = newSets + 2;
      }

    } else if (overallScore < 75 || painScore >= 7) {
      newReps = Math.max(3, newReps - 1);
    }

    try {
      await updateSessionRequirement(user.id, activeRequirement.id, { number_of_reps: newReps, number_of_sets: newSets });
      toggleAlert(`Progression updated for next week! New goal: ${newSets} sets of ${newReps} reps.`);
    } catch (error: any) {
      console.error("Failed to update progression:", error);
      alert("Could not save your progression for next week. Please try again later.");
    } finally {
      navigate("/app");
    }
  }, [user, activeRequirement, painScore, navigate, sessionScores]);

  // Track session state changes
  useEffect(() => {
    console.log(`Session state changed to: ${sessionState}`);
  }, [sessionState]);

  // Video state management - only control video playback, don't auto-end session
  useEffect(() => {
    const video = videoRef?.current;
    if (!video)
      return;

    console.log(`Session state changed to: ${sessionState}`);

    switch (sessionState) {
      case "running":
        if (video.paused) {
          if (video.currentTime > 0 && video.duration - video.currentTime < 0.1) {
            video.currentTime = 0;
          }
          video.play();
          // Track when video starts playing
          videoStartTimeRef.current = video.currentTime;
          isVideoPlayingRef.current = true;
          console.log(`Video started playing at time: ${videoStartTimeRef.current}s`);
        }
        break;

      case "paused":
        if (!video.paused) {
          video.pause();
          isVideoPlayingRef.current = false;
          console.log("Video paused");
        }
        break;

      case "in_rest":
      case "idle":
        if (!video.paused) {
          video.pause();
          isVideoPlayingRef.current = false;
          console.log("Video stopped");
        }
        video.currentTime = 0;
        break;
    }
  }, [sessionState, videoRef])

  // Rest countdown management
  useEffect(() => {
    if (sessionState === "in_rest") {
      console.log("Starting rest countdown from 60");
      setRestCountdown(10);
    }
  }, [sessionState]);

  useEffect(() => {
    console.log(`Rest countdown effect running: countdown=${restCountdown}, sessionState=${sessionState}`);

    if (restCountdown === null || restCountdown <= 0) {
      return;
    }

    console.log(`Rest countdown: ${restCountdown}s`);

    const timer = setTimeout(() => {
      setRestCountdown(prev => {
        if (prev === null || prev <= 1) {
          // Countdown finished, start next set
          console.log("Rest countdown finished, starting next set");
          // Use setTimeout to avoid state update conflicts
          setTimeout(() => {
            // Only start next set if we're still in rest state and haven't already started
            if (sessionState === "in_rest") {
              console.log("Calling handleStartNextSet from rest countdown");
              handleStartNextSet();
            } else {
              console.log("Session state changed, not calling handleStartNextSet");
            }
          }, 0);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      console.log(`Clearing rest countdown timer for countdown=${restCountdown}`);
      clearTimeout(timer);
    };
  }, [restCountdown, handleStartNextSet, sessionState]);

  // Add a ref to track if we're already starting a new set
  const isStartingNewSetRef = useRef<boolean>(false);

  return {
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
    isStartingNewSetRef,
    currentSetScoresRef,
    currentSetErrorFlagsRef,
    isTodayAllowed,
    checkSchedulingAndGuard,
  }
}
