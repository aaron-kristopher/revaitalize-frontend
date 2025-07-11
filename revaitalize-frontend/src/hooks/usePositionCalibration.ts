// src/hooks/usePositionCalibration.ts

import { useRef, useState, useEffect, useCallback } from "react";
import { usePoseLandmarker } from "./usePoseLandmarker";
import Webcam from "react-webcam";

export type CalibrationDirection = 'left' | 'right' | 'up' | 'down' | 'forward' | 'back' | null;

export interface CalibrationResult {
  isPositioned: boolean;
  calibrationStatus: string;
  countdown: number | null;
  direction: CalibrationDirection;
}

export const usePositionCalibration = (webcamRef: React.RefObject<Webcam | null>, isChecking: boolean): CalibrationResult => {

  const { poseLandmarker, landmarkerStatus } = usePoseLandmarker();

  const [isPositioned, setIsPositioned] = useState<boolean>(false);
  const [calibrationStatus, setCalibrationStatus] = useState<string>("Initializing...");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [direction, setDirection] = useState<CalibrationDirection>(null);

  const lastTimestampRef = useRef<number>(-1);
  const animationFrameIdRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Constants for calibration
  const MIN_HIP_Y = 0.4;
  const MAX_HIP_Y = 0.8;
  const MIN_HIP_Z = 0.003;
  const MAX_HIP_Z = 0.05;
  const MIN_HIP_X = 0.54;
  const MAX_HIP_X = 0.58;

  const checkLoop = useCallback(() => {
    // Exit condition if the component unmounts or stops checking
    if (!isChecking) {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      return;
    }

    // --- More resilient webcam and landmarker check ---
    if (!webcamRef.current?.video || webcamRef.current.video.readyState < 4) {
      setCalibrationStatus("Setting up Camera...");
      animationFrameIdRef.current = requestAnimationFrame(checkLoop);
      return;
    }
    if (landmarkerStatus !== "ready" || !poseLandmarker) {
      setCalibrationStatus("Loading analysis model...");
      animationFrameIdRef.current = requestAnimationFrame(checkLoop);
      return;
    }

    const video = webcamRef.current.video as HTMLVideoElement;
    let newTimestamp: number = performance.now();
    if (lastTimestampRef.current >= newTimestamp) {
      newTimestamp = lastTimestampRef.current + 1;
    }
    lastTimestampRef.current = newTimestamp;

    const result = poseLandmarker.detectForVideo(video, newTimestamp);

    if (result && result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      // Ensure hips are visible before proceeding
      if (leftHip.visibility < 0.5 || rightHip.visibility < 0.5) {
        setCalibrationStatus("No person detected. Please position yourself in the frame.");
        setIsPositioned(false);
        setDirection(null);
        animationFrameIdRef.current = requestAnimationFrame(checkLoop);
        return;
      }

      const avgX: number = (leftHip.x + rightHip.x) / 2;
      const avgY: number = (leftHip.y + rightHip.y) / 2;
      const avgZ: number = Math.max(leftHip.z, rightHip.z); // Using max is fine here

      let statusMessage: string = "";
      let inPosition: boolean = false;
      let dir: CalibrationDirection = null;

      if (avgY < MIN_HIP_Y) {
        statusMessage = "Please move down a bit.";
        dir = "down";
      } else if (avgY > MAX_HIP_Y) {
        statusMessage = "Please move up a bit.";
        dir = "up";
      } else if (avgZ < MIN_HIP_Z) {
        statusMessage = "Please move a little bit closer.";
        dir = "forward";
      } else if (avgZ > MAX_HIP_Z) {
        statusMessage = "Please move a tiny step back.";
        dir = "back";
      } else if (avgX < MIN_HIP_X) {
        statusMessage = "Please move a little to your left.";
        dir = "left"; // Mirrored camera means user moves right
      } else if (avgX > MAX_HIP_X) {
        statusMessage = "Please move a little to your right.";
        dir = "right"; // Mirrored camera means user moves left
      } else {
        statusMessage = "Position Correct! Hold still...";
        inPosition = true;
        dir = null;
      }

      setCalibrationStatus(statusMessage);
      setIsPositioned(inPosition);
      setDirection(dir);
    } else {
      setCalibrationStatus("No person detected. Please position yourself in the frame.");
      setIsPositioned(false);
      setDirection(null);
    }

    animationFrameIdRef.current = requestAnimationFrame(checkLoop);
  }, [isChecking, landmarkerStatus, poseLandmarker, webcamRef]);

  // This effect manages the countdown timer
  useEffect(() => {
    // If we are in position and there is no timer running, start one.
    if (isPositioned && countdownTimerRef.current === null) {
      setCountdown(5);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
            return 0;
          } else {
            return prev - 1;
          }
        });
      }, 1000);
    }
    // If we move out of position, cancel the timer.
    else if (!isPositioned && countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
      setCountdown(null);
    }
  }, [isPositioned]);

  // This effect manages the animation frame loop
  useEffect(() => {
    if (isChecking && landmarkerStatus === "ready") {
      animationFrameIdRef.current = requestAnimationFrame(checkLoop);
    } else {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [isChecking, landmarkerStatus, checkLoop]);

  return { isPositioned, calibrationStatus, countdown, direction };
}
