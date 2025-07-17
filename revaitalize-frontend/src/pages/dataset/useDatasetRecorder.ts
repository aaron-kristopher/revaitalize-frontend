import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";

import { useAuth } from "@/context/AuthContext";
import { usePoseLandmarker } from "@/hooks/usePoseLandmarker"

const KEYPOINT_MAPPING = [
	"Nose",
	"Left_eye_inner",
	"Left_eye",
	"Left_eye_outer",
	"Right_eye_inner",
	"Right_eye",
	"Right_eye_outer",
	"Left_ear",
	"Right_ear",
	"Left_mouth",
	"Right_mouth",
	"Left_shoulder",
	"Right_shoulder",
	"Left_elbow",
	"Right_elbow",
	"Left_wrist",
	"Right_wrist",
	"Left_pinky",
	"Right_pinky",
	"Left_index",
	"Right_index",
	"Left_thumb",
	"Right_thumb",
	"Left_hip",
	"Right_hip",
	"Left_knee",
	"Right_knee",
	"Left_ankle",
	"Right_ankle",
	"Left_heel",
	"Right_heel",
	"Left_foot_index",
	"Right_foot_index",
]

export const useUpdateDatasetRecorder = (
	videoGuideRef: React.RefObject<HTMLVideoElement | null>,
	exercise: string,
	category: string,
) => {

	const [isRecording, setIsRecording] = useState<boolean>(false);

	const animationFrameIdRef = useRef<number>(0);


	// Refs for monitoring fps and subsampling frames
	const lastTimestampRef = useRef<number>(performance.now());
	const totalFrameCountRef = useRef<number>(0);
	const frameCountRef = useRef<number>(0);
	const fpsRef = useRef<number>(0);
	const subsampleFrameRef = useRef<number>(0);
	const seconds = useRef<number>(0);

	const ws = useRef<WebSocket | null>(null)

	const webcamRef = useRef<Webcam | null>(null)
	const canvasRef = useRef<HTMLCanvasElement | null>(null)

	const { poseLandmarker, landmarkerStatus } = usePoseLandmarker();
	const { user } = useAuth();

	const detect = useCallback((timestamp: number) => {
		frameCountRef.current++;

		const delta = timestamp - lastTimestampRef.current;

		if (delta >= 1000) {
			fpsRef.current = frameCountRef.current
			subsampleFrameRef.current = Math.round(fpsRef.current * 0.10);
			console.log("FPS: ", fpsRef.current);
			console.log("Subsample: ", subsampleFrameRef.current);

			frameCountRef.current = 0;
			lastTimestampRef.current = timestamp;
			seconds.current++;
		}

		const webcam = webcamRef.current;
		const canvas = canvasRef.current;
		const videoGuide = videoGuideRef.current;

		if (!poseLandmarker || !webcam || !canvas || !videoGuide || typeof webcam.video === "undefined" || webcam.video?.readyState !== 4) {
			return;
		}

		const video = webcam.video as HTMLVideoElement;
		const videoStreamWidth = video.videoWidth;
		const videoStreamHeight = video.videoHeight;

		if (canvas.width !== videoStreamWidth)
			canvas.width = videoStreamWidth

		if (canvas.height !== videoStreamHeight)
			canvas.height = videoStreamHeight

		const results = poseLandmarker.detectForVideo(video, performance.now());
		const ctx = canvas.getContext("2d");

		if (!ctx)
			return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (!poseLandmarker) {
			console.error("Bro is empty")
		}

		if (!results) {
			console.error("We got nothing bruv")
		}

		if (!results.landmarks) {
			console.error("Shit! got no landmarks")
		}

		if (results.landmarks.length <= 0) {
			console.error("Landmarks' empty bro")
		}

		if (results && results.landmarks && results.landmarks.length > 0) {

			const landmarks = results.landmarks[0];
			const drawingUtil = new DrawingUtils(ctx);

			if (!ws.current) {
				console.log("Websocket empty");
			} else if (ws.current.readyState !== WebSocket.OPEN) {
				console.log("WS aint open")
			}

			if (ws.current &&
				ws.current.readyState === WebSocket.OPEN &&
				frameCountRef.current % subsampleFrameRef.current === 0) {

				totalFrameCountRef.current++;
				const currentFrameTimestamp = `${totalFrameCountRef.current}.0`

				const landmarkData: { [key: string]: number[] } = {}

				landmarks.forEach((landmark, index) => {
					const key = KEYPOINT_MAPPING[index];
					landmarkData[key] = [landmark.x, landmark.y, landmark.z]
				})

				const framePayload = {
					event: "frame",
					payload: {
						timestamp: currentFrameTimestamp,
						landmarks: landmarkData,
					}
				};

				ws.current.send(JSON.stringify(framePayload))
			}

			drawingUtil.drawLandmarks(landmarks, {
				color: "lightblue",
				lineWidth: 2,
			})

			drawingUtil.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
				color: "yellow",
				lineWidth: 2,
			})
		}

	}, [poseLandmarker, webcamRef, canvasRef, videoGuideRef, ws]);

	useEffect(() => {
		const runAnimation = (timestamp: number) => {
			console.log("INFO:\tRunning animation")
			console.log("INFO:\tRecording Status: ", isRecording)
			if (!isRecording)
				return;

			detect(timestamp);
			animationFrameIdRef.current = requestAnimationFrame(runAnimation);
		}

		if (isRecording)
			animationFrameIdRef.current = requestAnimationFrame(runAnimation);

		return () => {
			if (animationFrameIdRef.current)
				cancelAnimationFrame(animationFrameIdRef.current)
		}

	}, [isRecording, detect]);


	const handleEndRecording = useCallback(() => {
		if (ws.current && ws.current.readyState === WebSocket.OPEN) {
			console.log("Sending 'end' message and closing WebSocket.");
			ws.current.send(JSON.stringify({ event: "end", payload: {} }))
		}
		setIsRecording(false);
	}, []);

	const handleStartRecording = useCallback(() => {
		if (isRecording || !user)
			return;

		setIsRecording(true);
		totalFrameCountRef.current = 0;
		const uniqueId = Date.now().toString().slice(5, 10);
		const filename = `G4-BP-${exercise}-${user.first_name}-${uniqueId}.json`

		ws.current = new WebSocket("ws://127.0.0.1:8001/predict/api/ws/create-dataset");
		ws.current.onopen = () => {
			console.log("WebSocket connection established.");
			const configPayload = {
				event: "config",
				payload: {
					filename: filename,
					exercise: exercise,
					category: category,
				},
			};

			ws.current?.send(JSON.stringify(configPayload));

			const videoGuide = videoGuideRef.current;
			if (videoGuide) {
				videoGuide.currentTime = 0;
				videoGuide.play();
				videoGuide.onended = handleEndRecording;
			}
		};

		ws.current.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log("Message from server: ", data);
			console.log("Elapsed time: ", seconds.current);

			if (data.status === "success") {
				alert(`Dataset entry saved successfully: ${filename}`);
			} else {
				alert(`Error saving dataset: ${data.message}`);
			}
		};

		ws.current.onerror = (error) => {
			console.error("WebSocket Error: ", error);
			alert("Connection to the recording service failed.");
			setIsRecording(false);
		};

		ws.current.onclose = () => {
			console.log("WebSocket connection closed.");
			setIsRecording(false);
		};
	}, [isRecording, user, exercise, category, videoGuideRef, handleEndRecording]);


	return { handleStartRecording, isRecording, webcamRef, canvasRef };
}
