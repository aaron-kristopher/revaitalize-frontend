import React, { useRef, useCallback, useEffect } from "react";
import type Webcam from "react-webcam";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { usePoseSequence } from "./usePoseSequence";

const UPPER_BODY_CONNECTIONS = [
  { start: 11, end: 12, name: 'shoulders' },
  { start: 11, end: 13, name: 'left_upper_arm' },
  { start: 13, end: 15, name: 'left_lower_arm' },
  { start: 12, end: 14, name: 'right_upper_arm' },
  { start: 14, end: 16, name: 'right_lower_arm' },
  { start: 11, end: 23, name: 'left_torso' },
  { start: 12, end: 24, name: 'right_torso' },
  { start: 23, end: 24, name: 'hips' }
];

const PREDICTION_TO_KEYPOINT_MAP: { [key: number]: number } = {
  0: 11,
  1: 12,
  2: 13,
  3: 14,
  4: 15,
  5: 16
};

const UPPER_BODY_INDICES = [11, 12, 13, 14, 15, 16, 23, 24];
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

interface UseSessionDetectionProps {
  isEnabled: boolean;
  webcamRef: React.RefObject<Webcam | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  poseLandmarker: PoseLandmarker | null;
  exerciseName: string;
  currentRepPredictionsRef: React.RefObject<number[][]>;
}

export const useSessionDetection = (props: UseSessionDetectionProps) => {
  const { latestPredictionRef, processFrame } = usePoseSequence();

  const isEnabledRef = useRef<boolean>(props.isEnabled);
  const videoFrameCounterRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Update isEnabledRef whenever props.isEnabled changes
  useEffect(() => {
    isEnabledRef.current = props.isEnabled;
  }, [props.isEnabled]);

  const runLiveDetection = useCallback(() => {
    videoFrameCounterRef.current++;

    const webcam = props.webcamRef.current;
    const canvas = props.canvasRef.current;

    if (!props.poseLandmarker || !webcam?.video || webcam.video.readyState !== 4 || !canvas) {
      console.log("Pose detection not ready:", {
        hasLandmarker: !!props.poseLandmarker,
        hasWebcam: !!webcam?.video,
        videoReadyState: webcam?.video?.readyState,
        hasCanvas: !!canvas
      });
      return;
    }

    const video = webcam.video as HTMLVideoElement;

    if (canvas.width !== video.videoWidth)
      canvas.width = video.videoWidth;

    if (canvas.height !== video.videoHeight)
      canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    const results = props.poseLandmarker.detectForVideo(video, performance.now())

    if (!ctx)
      return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.landmarks?.length > 0) {
      const allLandmarks = results.landmarks[0];
      const exerciseIdentifier: string = exerciseApiNameToIdentifier[props.exerciseName] || "hiding_face";
      const exerciseVector: number[] = exerciseVectorMap[exerciseIdentifier] || [0, 0, 0];
      const subsampleRate: number = 3;

      if (videoFrameCounterRef.current % subsampleRate === 0) {
        console.log(`Processing frame ${videoFrameCounterRef.current}, landmarks detected: ${allLandmarks.length}`);
        processFrame(exerciseVector, allLandmarks, exerciseIdentifier);
      }

      const currentPrediction = latestPredictionRef.current

      if (currentPrediction) {
        console.log(`Adding prediction: [${currentPrediction.join(', ')}]`);
        props.currentRepPredictionsRef.current.push(currentPrediction);
        console.log(`Total predictions for current rep: ${props.currentRepPredictionsRef.current.length}`);
      } else {
        console.log("No prediction available yet");
      }

      const errorIndices = new Set<number>();

      if (currentPrediction?.includes(1)) {
        currentPrediction.forEach((value, index) => {
          if (value === 1)
            errorIndices.add(PREDICTION_TO_KEYPOINT_MAP[index]);
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
  }, [props.poseLandmarker, props.exerciseName, processFrame, latestPredictionRef, props.webcamRef, props.canvasRef, props.currentRepPredictionsRef])

  const videoFrameCallbackLoop = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    if (videoFrameCounterRef.current % 30 === 0) { // Log every 30 frames to avoid spam
      console.log("Video frame callback loop running, frame:", videoFrameCounterRef.current);
    }
    
    runLiveDetection();
    props.webcamRef.current?.video && (props.webcamRef.current.video as any).requestVideoFrameCallback(videoFrameCallbackLoop);
  }, [runLiveDetection, props.webcamRef]);

  const animationFrameLoop = useCallback(() => {
    if (!isEnabledRef.current) {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      return;
    };
    
    if (videoFrameCounterRef.current % 30 === 0) { // Log every 30 frames to avoid spam
      console.log("Animation frame loop running, frame:", videoFrameCounterRef.current);
    }
    
    runLiveDetection();
    animationFrameIdRef.current = requestAnimationFrame(animationFrameLoop);
  }, [runLiveDetection]);

  useEffect(() => {
    if (props.isEnabled) {
      videoFrameCounterRef.current = 0;

      const video = props.webcamRef.current?.video;
      try {
        console.log("INFO: Using requestVideoFrameCallback for session.");
        (video as any).requestVideoFrameCallback(videoFrameCallbackLoop);

      } catch (any) {
        console.warn("WARN: requestVideoFrameCallback not supported: Falling back to requestAnimationFrame for session.");
        animationFrameIdRef.current = requestAnimationFrame(animationFrameLoop);
      }
    } else {
      if (animationFrameIdRef.current)
        cancelAnimationFrame(animationFrameIdRef.current);
    }

    return () => {
      if (animationFrameIdRef.current)
        cancelAnimationFrame(animationFrameIdRef.current);
    }
  }, [props.isEnabled, props.webcamRef, videoFrameCallbackLoop, animationFrameLoop])

  return { latestPredictionRef }
}
