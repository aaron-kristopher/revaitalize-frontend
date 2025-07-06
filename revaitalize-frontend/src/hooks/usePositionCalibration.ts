import { useRef, useState, useEffect, useCallback } from "react";
import { usePoseLandmarker } from "./usePoseLandmarker";
import Webcam from "react-webcam";


export const usePositionCalibration = (webcamRef: React.RefObject<Webcam | null>, isChecking: boolean) => {

  const { poseLandmarker, landmarkerStatus } = usePoseLandmarker();

  const [isPositioned, setIsPositioned] = useState<boolean>(false);
  const [calibrationStatus, setCalibrationStatus] = useState<string>("Initializing...")
  const [countdown, setCountdown] = useState<number | null>(null);

  const lastTimestampRef = useRef<number>(-1);
  const animationFrameIdRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);


  const MIN_HIP_Y = 0.4;
  const MAX_HIP_Y = 0.8;

  const MIN_HIP_Z = 0.0003;
  const MAX_HIP_Z = 0.005;

  const MIN_HIP_X = 0.542;
  const MAX_HIP_X = 0.582;

  const checkLoop = useCallback(() => {

    if (!webcamRef.current?.video || landmarkerStatus !== "ready" || !poseLandmarker) {
      setCalibrationStatus("Setting up Camera.")
      animationFrameIdRef.current = requestAnimationFrame(checkLoop);
      return;
    }

    const video = webcamRef.current?.video as HTMLVideoElement;
    if (video?.readyState !== 4) {
      setCalibrationStatus("Webcam is not ready");
      animationFrameIdRef.current = requestAnimationFrame(checkLoop);
      return;
    }

    let newTimestamp: number = performance.now()

    if (lastTimestampRef.current >= newTimestamp) {
      newTimestamp = lastTimestampRef.current + 1;
    }

    lastTimestampRef.current = newTimestamp;

    const result = poseLandmarker?.detectForVideo(video, lastTimestampRef.current);

    if (lastTimestampRef.current % 10 === 0) {
      animationFrameIdRef.current = requestAnimationFrame(checkLoop);
      return;
    }

    if (result && result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      const avgX = (leftHip.x + rightHip.x) / 2
      const avgZ = Math.max(leftHip.z, rightHip.z)

      console.log(avgZ);

      let statusMessage = "";
      let inPosition = false;

      if (leftHip.y < MIN_HIP_Y || rightHip.y < MIN_HIP_Y) {
        statusMessage = "Please place yourself higher in the frame.";
      }
      else if (leftHip.y > MAX_HIP_Y || rightHip.y > MAX_HIP_Y) {
        statusMessage = "Please place yourself lower in the frame.";
      }
      else if (avgZ < MIN_HIP_Z) {
        statusMessage = "Please move a little bit closer.";
      }
      else if (avgZ > MAX_HIP_Z) {
        statusMessage = "Please move a tiny step back.";
      }
      else if (avgX < MIN_HIP_X) {
        statusMessage = "Please move a little bit to the left.";
      }
      else if (avgX > MAX_HIP_X) {
        statusMessage = "Please move a little bit to the right.";
      }
      else {
        statusMessage = "Position Correct! Hold still...";
        inPosition = true;
      }

      setCalibrationStatus(statusMessage);
      setIsPositioned(inPosition);

      console.log(calibrationStatus)
      if (inPosition && countdown === 0) {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          return;
        }
      }
    } else {
      setCalibrationStatus("No Person Detected")
    }

    animationFrameIdRef.current = requestAnimationFrame(checkLoop);

  }, [isPositioned, landmarkerStatus, poseLandmarker, webcamRef])

  useEffect(() => {

    if (isPositioned && !countdown) {
      setCountdown(5);

      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownTimerRef.current!);
            return 0;
          } else {
            return --prev
          }
        })
      }, 1000);
    } else if (!isPositioned && countdown) {
      clearInterval(countdownTimerRef.current!);
      setCountdown(null);
    }
  }, [isPositioned]);

  useEffect(() => {

    if (landmarkerStatus === "ready" && isChecking) {
      animationFrameIdRef.current = requestAnimationFrame(checkLoop);
    }

    return () => {
      console.log("Cleaning up dialog setup");

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    }

  }, [isChecking, landmarkerStatus, checkLoop]);

  return { isPositioned, calibrationStatus, countdown };
}
