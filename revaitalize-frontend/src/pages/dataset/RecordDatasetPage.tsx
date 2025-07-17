import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

import { DatasetInfoCombobox } from "./DatasetInfoCombobox";
import { useUpdateDatasetRecorder } from "./useDatasetRecorder";
import ELKVideo from "@/assets/videos/fs-sitting.mp4"
import CTKVideo from "@/assets/videos/hf-sitting.mp4"
import RTKVideo from "@/assets/videos/tr-sitting.mp4"
import { useAuth } from "@/context/AuthContext";

const exercises: { value: string; label: string }[] = [
  {
    value: "CTK",
    label: "Hiding Face"
  },
  {
    value: "RTK",
    label: "Torso Rotation"
  },
  {
    value: "ELK",
    label: "Flank Stretch"
  },
]

const correctness: { value: string, label: string }[] = [
  {
    value: "correct",
    label: "Correct",
  },
  {
    value: "incorrect",
    label: "Incorrect",
  }
]

const videoMapping = {
  "CTK": CTKVideo,
  "ELK": ELKVideo,
  "RTK": RTKVideo,
}

export const RecordDatasetPage = () => {
  const [exerciseValue, setExerciseValue] = useState<string>("");
  const [categoryValue, setCorrectnessValue] = useState<string>("");

  const videoGuideRef = useRef<HTMLVideoElement | null>(null)

  const { handleStartRecording, isRecording, webcamRef, canvasRef } = useUpdateDatasetRecorder(videoGuideRef, exerciseValue, categoryValue);
  const { user } = useAuth();

  useEffect(() => {
    const videoGuide = videoGuideRef.current;

    if (videoGuide && exerciseValue)
      videoGuide.src = videoMapping[exerciseValue];

  }, [exerciseValue])

  return (
    <div className="h-full grid items-center justify-items-center">
      <div className="grid grid-cols-2 gap-4 px-4">
        <div className="relative w-full h-full">
          <Webcam mirrored={true} className="rounded-lg" ref={webcamRef} />
          <canvas className="absolute top-0 left-0 w-full h-full rotate-y-180" ref={canvasRef} />
        </div>
        <video src={ELKVideo} className="rounded-lg object-cover h-full" ref={videoGuideRef} />
      </div>
      <div className="grid  gap-4">
        <div className="grid grid-flow-col gap-4">
          <DatasetInfoCombobox comboBoxValues={exercises} category={"Exercise"} value={exerciseValue} setValue={setExerciseValue} />
          <DatasetInfoCombobox comboBoxValues={correctness} category={"Correctness"} value={categoryValue} setValue={setCorrectnessValue} />
        </div>
        <Button
          disabled={(!!!exerciseValue || !!!categoryValue || !user)}
          size={"lg"}
          onClick={handleStartRecording}
          variant={isRecording ? "destructive" : "default"}
          className="font-semibold">
          {isRecording ? "Recording..." : "Start Recording"}
        </Button>
      </div>
    </div>
  )
}

