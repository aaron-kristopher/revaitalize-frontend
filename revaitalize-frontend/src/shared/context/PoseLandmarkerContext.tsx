import { PoseLandmarker } from "@mediapipe/tasks-vision";
import { createContext, useContext, type ReactNode } from "react";
import { usePoseLandmarker, type LandmarkerStatus } from "@/shared/hooks/usePoseLandmarker";

interface PoseLandmarkerContextType {
  poseLandmarker: PoseLandmarker | null;
  landmarkerStatus: LandmarkerStatus
}

const PoseLandmarkerContext = createContext<PoseLandmarkerContextType | undefined>(undefined);

export const PoseLandmarkerProvider = ({ children }: { children: ReactNode }) => {
  const { poseLandmarker, landmarkerStatus } = usePoseLandmarker();
  const value = { poseLandmarker, landmarkerStatus };

  return (
    <PoseLandmarkerContext.Provider value={value}>
      {children}
    </PoseLandmarkerContext.Provider>
  )
}

export const useSharedPoseLandmarker = () => {
  const context = useContext(PoseLandmarkerContext);

  if (context === undefined) {
    throw new Error("useSharedPoseLandmaker must be within a PoseLandmarkerProvider.")
  }

  return context;
}
