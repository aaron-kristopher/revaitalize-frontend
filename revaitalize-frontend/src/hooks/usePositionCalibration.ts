import { useRef, useState, useEffect, useCallback } from "react";
import { usePoseLandmarker } from "./usePoseLandmarker";
import Webcam from "react-webcam";


export const usePositionCalibration = (webcamRef: React.RefObject<Webcam | null>) => {

  const { poseLandmarker, landmarkerStatus } = usePoseLandmarker();

  const [isNotInPosition, setIsNotInPosition] = useState<boolean>(true);
  const [calibrationStatus, setCalibrationStatus] = useState<string>("Please be at least 1 meter from the camera.")

  const lastTimestampRef = useRef<number>(-1);
  const animationFrameIdRef = useRef<number | null>(null);


  const MIN_HIP_Y = 0.4;
  const MAX_HIP_Y = 0.8;

  const MIN_HIP_Z = 0.0003;
  const MAX_HIP_Z = 0.0007;

  const checkLoop = useCallback(() => {

    if (!webcamRef.current?.video || landmarkerStatus !== "ready" || !poseLandmarker) {
      console.log("Still setting up");
      animationFrameIdRef.current = requestAnimationFrame(checkLoop);
      return;
    }

    const video = webcamRef.current?.video as HTMLVideoElement;
    if (video?.readyState !== 4) {
      console.log("Webcam is not ready");
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

      let statusMessage = "";
      let inPosition = false;

      if (leftHip.y < MIN_HIP_Y || rightHip.y < MIN_HIP_Y) {
        statusMessage = "Please place yourself higher in the frame.";
      }
      else if (leftHip.y > MAX_HIP_Y || rightHip.y > MAX_HIP_Y) {
        statusMessage = "Please place yourself lower in the frame.";
      }
      else if (rightHip.z < MIN_HIP_Z) {
        statusMessage = "Please move a little bit closer.";
      }
      else if (rightHip.z > MAX_HIP_Z) {
        statusMessage = "Please move a tiny step back.";
      }
      else {
        statusMessage = "Position Correct! Hold still...";
        inPosition = true;
      }

      setCalibrationStatus(statusMessage);
      setIsNotInPosition(!inPosition);

      console.log(calibrationStatus)
      if (inPosition) {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          return;
        }
      }
    } else {
      setCalibrationStatus("No Person Detected")
    }

    animationFrameIdRef.current = requestAnimationFrame(checkLoop);
  }, [isNotInPosition, landmarkerStatus, poseLandmarker, webcamRef])

  useEffect(() => {

    if (landmarkerStatus === "ready" && isNotInPosition) {
      animationFrameIdRef.current = requestAnimationFrame(checkLoop);
    }

    return () => {
      console.log("Cleaning up dialog setup");

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    }

  }, [landmarkerStatus, isNotInPosition, checkLoop]);
  return { isNotInPosition, calibrationStatus };
}
