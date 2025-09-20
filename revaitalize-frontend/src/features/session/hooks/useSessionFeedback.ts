import { useState, useEffect } from "react";
import { getPredictionEvaluation } from "../utils/session.utils";

type FeedbackStatus = "waiting" | "correct" | "incorrect";

export interface FeedbackState {
  status: FeedbackStatus;
  text: string;
}

export const useSessionFeedback = (
  latestPrediction: number[] | null,
  sessionState: "idle" | "running" | "paused" | "in_rest",
) => {
  const [feedback, setFeedback] = useState<FeedbackState>({ status: "waiting", text: "Align in Camera to Start" });

  useEffect(() => {
    switch (sessionState) {
      case "in_rest":
        setFeedback({ status: "waiting", text: "Set Complete! Take a break" });
        return;

      case "idle":
      case "paused":
        setFeedback({ status: "waiting", text: "Press play to resume" });
        return;

      case "running":
        if (latestPrediction) {
          const evaluation = getPredictionEvaluation(latestPrediction);
          setFeedback({
            status: evaluation === "Correct" ? "correct" : "incorrect",
            text: evaluation === "Correct" ? "Excellent Form!" : evaluation,
          })
        } else {
          setFeedback({
            status: "waiting",
            text: "Analyzing..."
          })
        }
    }
  }, [latestPrediction, sessionState])

  return { feedback }
}

