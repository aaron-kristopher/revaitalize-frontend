// import {
//   PoseLandmarker,
//   FilesetResolver,
//   DrawingUtils,
// } from "@mediapipe/tasks-vision";
//
// import { useRef, useEffect, useState, useCallback } from "react";
// import Webcam from "react-webcam";
//
// import { usePoseSequence } from "../../hooks/usePoseSequence";
//
// function PoseDetection() {
//
//
//   const UPPER_BODY_CONNECTIONS = [
//     { start: 7, end: 2, name: 'ear_to_eyes' },
//     { start: 2, end: 0, name: 'eyes_to_nose' },
//     { start: 0, end: 5, name: 'nose_to_eyes' },
//     { start: 5, end: 8, name: 'eyes_to_ear' },
//     { start: 9, end: 10, name: 'mouth' },
//     { start: 11, end: 12, name: 'shoulders' },
//     { start: 11, end: 13, name: 'left_upper_arm' },
//     { start: 13, end: 15, name: 'left_lower_arm' },
//     { start: 12, end: 14, name: 'right_upper_arm' },
//     { start: 14, end: 16, name: 'right_lower_arm' },
//     { start: 11, end: 23, name: 'left_torso' },
//     { start: 12, end: 24, name: 'right_torso' },
//     { start: 23, end: 24, name: 'hips' },
//   ];
//
//   const PREDICTION_TO_KEYPOINT_MAP: { [key: number]: number } = {
//     0: 11, // Prediction index 0 -> Left Shoulder (BlazePose index 11)
//     1: 12, // Prediction index 1 -> Right Shoulder (BlazePose index 12)
//     2: 13, // Prediction index 2 -> Left Elbow (BlazePose index 13)
//     3: 14, // Prediction index 3 -> Right Elbow (BlazePose index 14)
//     4: 15, // Prediction index 4 -> Left Wrist (BlazePose index 15)
//     5: 16, // Prediction index 5 -> Right Wrist (BlazePose index 16)
//   };
//
//   const UPPER_BODY_INDICES = [0, 2, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23, 24];
//
//   const webcamRef = useRef<Webcam>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const lastTimestampRef = useRef<number>(-1);
//   const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
//   const animationFrameIdRef = useRef<number | null>(null);
//
//   const [fps, setFps] = useState<number>(0);
//   const fpsTracker = useRef({
//     frameCount: 0,
//     lastTimeStamp: performance.now(),
//   });
//
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const oheExerciseRef = useRef<number[]>([0.0, 1.0, 0.0])
//
//   const { latestPrediction, processFrame, status } = usePoseSequence();
//
//   const createPoseLandmarker = useCallback(async () => {
//     try {
//       console.log("Creating PoseLandmarker...");
//       const vision = await FilesetResolver.forVisionTasks("/wasm");
//       const landmarker = await PoseLandmarker.createFromOptions(vision, {
//         baseOptions: {
//           modelAssetPath: "/models/pose_landmarker_full.task",
//           delegate: "GPU"
//         },
//         runningMode: "VIDEO",
//         numPoses: 1,
//       });
//
//       poseLandmarkerRef.current = landmarker;
//       console.log("PoseLandmarker Created Successfully.");
//
//     } catch (error) {
//       console.error("Failed to create PoseLandmarker!");
//       console.error(error);
//
//     }
//   }, []);
//
//   const detect = useCallback(() => {
//     const poseLandmarker = poseLandmarkerRef.current;
//     const webcam = webcamRef.current;
//     const canvas = canvasRef.current;
//
//     if (!poseLandmarker || !webcam || !canvas || typeof webcam.video === "undefined" || webcam.video.readyState !== 4) {
//       return;
//     }
//
//     // const now = performance.now();
//     // fpsTracker.current.frameCount++;
//     //
//     // if (now - fpsTracker.current.lastTimeStamp >= 1000) {
//     //   const calculatedFps = fpsTracker.current.frameCount;
//     //   setFps(calculatedFps);
//     //
//     //   fpsTracker.current.frameCount = 0;
//     //   fpsTracker.current.lastTimeStamp = now;
//     // }
//
//     const video = webcam.video as HTMLVideoElement;
//     const videoStreamWidth = video.videoWidth;
//     const videoStreamHeight = video.videoHeight;
//
//     if (canvas.width !== videoStreamWidth) canvas.width = videoStreamWidth;
//     if (canvas.height !== videoStreamHeight) canvas.height = videoStreamHeight;
//
//     const videoDisplayWidth = video.offsetWidth;
//     const videoDisplayHeight = video.offsetHeight;
//
//     if (canvas.style.width !== `${videoDisplayWidth}px`) canvas.style.width = `${videoDisplayWidth}px`;
//     if (canvas.style.height !== `${videoDisplayHeight}px`) canvas.style.height = `${videoDisplayHeight}px`;
//
//     let newTimestamp = performance.now();
//     if (lastTimestampRef.current >= newTimestamp) {
//       newTimestamp = lastTimestampRef.current + 1;
//     }
//
//     lastTimestampRef.current = newTimestamp;
//
//     const results = poseLandmarker.detectForVideo(video, lastTimestampRef.current);
//     const ctx = canvas.getContext("2d");
//     if (!ctx) {
//       console.error("Failed to Load 2d context from canvas!");
//       return
//     }
//
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//
//     if (results && results.landmarks && results.landmarks.length > 0) {
//       const allLandmarks = results.landmarks[0];
//
//       processFrame(oheExerciseRef.current, allLandmarks)
//
//       const canvasWidth = canvasRef.current!.width;
//       const canvasHeight = canvasRef.current!.height;
//
//       // 1. Create a set of erroneous keypoint INDICES for fast lookups.
//       //    This is equivalent to the `error_indices` list in your Python code.
//       const errorIndices = new Set<number>();
//       if (latestPrediction) { // `latestPrediction` comes from your usePoseSequence hook
//         latestPrediction.forEach((value, index) => {
//           if (value === 1) { // If the model predicted an error (value is 1)
//             // Use the map to find the corresponding BlazePose index
//             const keypointIndex = PREDICTION_TO_KEYPOINT_MAP[index];
//             if (keypointIndex !== undefined) {
//               errorIndices.add(keypointIndex);
//             }
//           }
//         });
//       }
//
//       // 2. Draw the connections with dynamic colors
//       for (const connection of UPPER_BODY_CONNECTIONS) {
//         const startLandmark = allLandmarks[connection.start];
//         const endLandmark = allLandmarks[connection.end];
//
//         if (startLandmark && endLandmark) {
//           // A connection is an error if either of its endpoints is in our error set
//           const isError = errorIndices.has(connection.start) || errorIndices.has(connection.end);
//           const color = isError ? '#C70039 ' : '#50C878'; // Red for error, Green for correct
//
//           ctx.beginPath();
//           ctx.moveTo(startLandmark.x * canvasWidth, startLandmark.y * canvasHeight);
//           ctx.lineTo(endLandmark.x * canvasWidth, endLandmark.y * canvasHeight);
//           ctx.lineWidth = 4;
//           ctx.strokeStyle = color;
//           ctx.stroke();
//         }
//       }
//
//       // 3. Draw the landmark points themselves, highlighting errors
//       for (const index of UPPER_BODY_INDICES) {
//         const landmark = allLandmarks[index];
//         if (landmark) {
//           const isError = errorIndices.has(index);
//           const color = isError ? '#C70039 ' : '#FFFFFF'; // Red for error points, White for correct
//
//           ctx.beginPath();
//           ctx.arc(landmark.x * canvasWidth, landmark.y * canvasHeight, 7, 0, 2 * Math.PI);
//           ctx.fillStyle = color;
//           ctx.fill();
//         }
//       }
//     }
//   }, [processFrame, latestPrediction]);
//
//   useEffect(() => {
//     const runAnimation = () => {
//       if (!isProcessing) {
//         if (animationFrameIdRef.current) {
//           cancelAnimationFrame(animationFrameIdRef.current)
//         }
//         return;
//       }
//
//       detect();
//       animationFrameIdRef.current = requestAnimationFrame(runAnimation);
//     };
//
//     if (isProcessing) {
//       animationFrameIdRef.current = requestAnimationFrame(runAnimation);
//     } else {
//       if (animationFrameIdRef.current) {
//         cancelAnimationFrame(animationFrameIdRef.current)
//       }
//     }
//
//     return () => {
//       if (animationFrameIdRef.current) {
//         cancelAnimationFrame(animationFrameIdRef.current);
//       }
//     };
//   }, [isProcessing, detect])
//
//
//   const handleToggleProcessing = async () => {
//     setIsProcessing(prev => !prev);
//   };
//
//   useEffect(() => {
//     console.log("PoseDetection useEffect: Initializing MediaPipe...");
//     createPoseLandmarker();
//
//     return () => {
//       console.log("PoseDetection useEffect: Cleaning up...");
//       if (animationFrameIdRef.current) {
//         cancelAnimationFrame(animationFrameIdRef.current);
//         animationFrameIdRef.current = null;
//       }
//       if (poseLandmarkerRef.current) {
//         console.log("Closing PoseLandmarker from Detection");
//         poseLandmarkerRef.current.close();
//         poseLandmarkerRef.current = null;
//       }
//     }
//
//   }, [createPoseLandmarker])
//
//
//   return (
//     <div className="px-16 pt-8">
//       <div className="py-4">
//         <p className="text-md">Prediction: {latestPrediction?.includes(1) ? "Incorrect" : "Correct"}</p>
//       </div>
//       <div className="grid gap-2 grid-cols-2">
//         <div className="relative">
//           <Webcam
//             className="rounded-lg drop-shadow-md"
//             ref={webcamRef}
//             videoConstraints={
//               {
//                 facingMode: 'user',
//               }
//             }
//           />
//           <canvas
//             className="absolute top-0 left-0"
//             ref={canvasRef}
//           />
//         </div>
//       </div>
//
//       <div className="py-4">
//         <button className="btn btn-outline btn-primary" onClick={handleToggleProcessing}>
//           {isProcessing ? 'Stop Posing' : 'Start Posing'}
//         </button>
//       </div>
//
//     </div>
//   )
// }
//
// export default PoseDetection
