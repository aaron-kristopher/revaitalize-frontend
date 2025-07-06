import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useState, useRef, useEffect, useCallback } from "react"

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  READY: "ready",
  ERROR: "error",
  CLOSING: "closing",
} as const;

type LandmarkerStatus = typeof STATUS[keyof typeof STATUS];

export const usePoseLandmarker = () => {
  const [landmarkerStatus, setLandmarkerStatus] = useState<LandmarkerStatus>(STATUS.IDLE);

  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  const createPoseLandmarker = useCallback(async () => {
    try {
      setLandmarkerStatus(STATUS.LOADING);
      console.log("Loading PoseLandmarker Instance...");

      const vision = await FilesetResolver.forVisionTasks("/wasm");

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/pose_landmarker_full.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      setLandmarkerStatus(STATUS.READY);
      console.log("Successfully Initialized PoseLandmarker Instance.")

    } catch (error) {
      setLandmarkerStatus(STATUS.ERROR)
      console.error("Failed to create PoseLandmarker!");
      console.error(error);
    }
  }, []);

  useEffect(() => {
    console.log("usePoseDetection useEffect: Initializing Mediapipe...");
    createPoseLandmarker();

    return () => {
      console.log("usePoseLandmarker useEffect: Cleaning up PoseLandmarker...");
      console.log("usePoseLandmarker useEffect: Closing PoseLandmarker...");
      poseLandmarkerRef.current?.close();
    }

  }, [])

  return { poseLandmarker: poseLandmarkerRef.current, landmarkerStatus }
}
