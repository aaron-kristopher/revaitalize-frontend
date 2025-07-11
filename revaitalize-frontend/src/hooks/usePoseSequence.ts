import { useState, useCallback, useRef } from "react";

const KEYPOINTS_IDX = [
  0, 2, 5, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24
  // 0: "Nose",
  // 2: "Left_eye",
  // 5: "Right_eye",
  // 7: "Left_ear",
  // 8: "Right_ear",
  // 11: "Left_shoulder",
  // 12: "Right_shoulder",
  // 13: "Left_elbow",
  // 14: "Right_elbow",
  // 15: "Left_wrist",
  // 16: "Right_wrist",
  // 23: "Left_hip",
  // 24: "Right_hip",
]

const STATUS = {
  IDLE: "idle",
  FETCHING: "fetching",
  COLLECTING: "collecting",
  ERROR: "error",
} as const;

interface BlazePoseLandmarks {
  x: number,
  y: number,
  z: number,
  visibility?: number;
}

type PoseStatus = typeof STATUS[keyof typeof STATUS]

export const usePoseSequence = () => {


  const [latestPrediction, setLatestPrediction] = useState<number[] | null>(null);
  const [status, setStatus] = useState<PoseStatus>(STATUS.IDLE);

  const landmarkSequence = useRef<number[][]>([]);
  const isReadyToPredict = useRef<boolean>(true);
  const frameCount = useRef<number>(0);

  const sendSequenceForPrediction = useCallback(async (exerciseName: string) => {

    if (landmarkSequence.current.length < 20 || !isReadyToPredict.current) {
      return;
    }

    setStatus(STATUS.FETCHING);
    isReadyToPredict.current = false;

    try {
      const url = "http://127.0.0.1:8001/predict/api/predict/";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          list_landmarks: landmarkSequence.current,
          exercise_name: exerciseName
        })
      })

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      setLatestPrediction(result.prediction[0]);
      setStatus(STATUS.COLLECTING);

    } catch (error) {
      console.error("Error during calling prediction API: ", error)
      setStatus(STATUS.ERROR)

    } finally {
      isReadyToPredict.current = true;
    }
  }, [])

  const processFrame = useCallback(async (ohe: number[], landmarks: BlazePoseLandmarks[], exerciseName: string) => {
    frameCount.current++;

    if (frameCount.current % 3 !== 0) {
      return;
    }

    const filteredLandmarks = KEYPOINTS_IDX.map(index => landmarks[index]).flatMap(lm => [lm.x, lm.y, lm.z]);
    const frameData: number[] = [...ohe, ...filteredLandmarks];

    if (landmarkSequence.current.length >= 20) {
      landmarkSequence.current.shift();
    }

    landmarkSequence.current.push(frameData)

    if (landmarkSequence.current.length === 20 && isReadyToPredict.current) {
      sendSequenceForPrediction(exerciseName)
    }

  }, [sendSequenceForPrediction]);

  return { latestPrediction, processFrame, status }
}
