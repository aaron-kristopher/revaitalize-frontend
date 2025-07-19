import { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useAuth } from "@/context/AuthContext";
import { usePoseLandmarker } from "@/hooks/usePoseLandmarker";

const KEYPOINT_MAPPING = [
	"Nose", "Left_eye_inner", "Left_eye", "Left_eye_outer", "Right_eye_inner", "Right_eye", "Right_eye_outer",
	"Left_ear", "Right_ear", "Mouth_left", "Mouth_right", "Left_shoulder", "Right_shoulder", "Left_elbow",
	"Right_elbow", "Left_wrist", "Right_wrist", "Left_pinky", "Right_pinky", "Left_index", "Right_index",
	"Left_thumb", "Right_thumb", "Left_hip", "Right_hip", "Left_knee", "Right_knee", "Left_ankle", "Right_ankle",
	"Left_heel", "Right_heel", "Left_foot_index", "Right_foot_index",
];

export const useUpdateDatasetRecorder = (
	videoGuideRef: React.RefObject<HTMLVideoElement | null>,
	exercise: string,
	category: string,
) => {
	const [statusMessage, setStatusMessage] = useState<string>("Ready to record");
	const [isRecording, setIsRecording] = useState<boolean>(false);
	const isRecordingRef = useRef<boolean>(isRecording);

	// --- REFACTORED: This is now a counter for actual video frames ---
	const videoFrameCounterRef = useRef<number>(0);
	const subsampleRateRef = useRef<number>(3); // Default subsample every 3rd frame

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const recordedChunksRef = useRef<Blob[]>([]);
	const currentFilenameRef = useRef<string>("");

	const ws = useRef<WebSocket | null>(null);
	const webcamRef = useRef<Webcam | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const { poseLandmarker } = usePoseLandmarker();
	const { user } = useAuth();

	useEffect(() => {
		isRecordingRef.current = isRecording
	}, [isRecording]);

	// This is the core detection logic, now called by the video frame callback
	const runDetectionOnVideoFrame = useCallback((now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => {

		if (!isRecordingRef.current)
			return;

		videoFrameCounterRef.current++;

		const webcam = webcamRef.current;
		const canvas = canvasRef.current;
		const videoGuide = videoGuideRef.current;

		if (!webcam || !canvas || !poseLandmarker)
			return;

		if (videoFrameCounterRef.current % subsampleRateRef.current === 0) {
			const video = webcam.video as HTMLVideoElement;
			const videoStreamWidth = video.videoWidth;
			const videoStreamHeight = video.videoHeight;

			if (canvas.width !== videoStreamWidth) canvas.width = videoStreamWidth;
			if (canvas.height !== videoStreamHeight) canvas.height = videoStreamHeight;

			const results = poseLandmarker.detectForVideo(video, now);
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			if (results.landmarks?.length > 0) {
				const landmarks = results.landmarks[0];
				const drawingUtil = new DrawingUtils(ctx);

				if (ws.current?.readyState === WebSocket.OPEN) {
					const currentFrameTimestamp = videoGuide?.currentTime.toFixed(3);
					const landmarkData: { [key: string]: number[] } = {};

					landmarks.forEach((landmark, index) => {
						landmarkData[KEYPOINT_MAPPING[index]] = [landmark.x, landmark.y, landmark.z];
					});

					ws.current.send(JSON.stringify({
						event: "frame",
						payload: { timestamp: currentFrameTimestamp, landmarks: landmarkData },
					}));
				}

				drawingUtil.drawLandmarks(landmarks, { color: "lightblue" });
				drawingUtil.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: "yellow" });

			}
		}

		if (isRecordingRef.current && webcam.video) {
			(webcam.video as any).requestVideoFrameCallback(runDetectionOnVideoFrame);
		}
	}, [poseLandmarker, videoGuideRef]);

	const uploadVideoAndFinalize = async (videoBlob: Blob) => {
		setStatusMessage("Uploading video file...");
		const formData = new FormData();
		formData.append("video_file", videoBlob);
		formData.append("filename", currentFilenameRef.current);
		formData.append("exercise", exercise);
		formData.append("category", category);

		try {
			const response = await fetch("http://127.0.0.1:8001/predict/api/upload-video-and-finalize", {
				method: "POST",
				body: formData,
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.detail || "Upload and finalization failed");
			setStatusMessage("Dataset entry created successfully!");
			alert("Dataset entry created successfully!");
		} catch (error) {
			setStatusMessage(`Error: ${error.message}`);
			alert(`Error: ${error.message}`);
		}
	};

	const handleEndRecording = useCallback(() => {
		if (mediaRecorderRef.current?.state === "recording") {
			mediaRecorderRef.current.stop();
		}
		setIsRecording(false);
	}, []);

	const handleStartRecording = useCallback(() => {
		const webcam = webcamRef.current;

		if (isRecording || !user || !webcam?.stream) {
			return;
		}

		setIsRecording(true);
		setStatusMessage("Initializing...");

		const uniqueId = Date.now().toString().slice(5, 10);
		currentFilenameRef.current = `G4-BP-${exercise}-${user.first_name}-${uniqueId}.json`;

		// Reset counters and data stores
		videoFrameCounterRef.current = 0;
		recordedChunksRef.current = [];

		// Setup MediaRecorder
		const stream = webcam.stream as MediaStream;
		mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "video/webm" });
		mediaRecorderRef.current.ondataavailable = (e) => {
			if (e.data.size > 0) recordedChunksRef.current.push(e.data);
		};
		mediaRecorderRef.current.onstop = () => {
			const videoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" });
			uploadVideoAndFinalize(videoBlob);
		};
		mediaRecorderRef.current.start();

		ws.current = new WebSocket("ws://127.0.0.1:8001/predict/api/ws/create-dataset");
		ws.current.onopen = () => {
			console.log("WebSocket connected.");
			setStatusMessage("Streaming landmark data...");
			ws.current?.send(JSON.stringify({
				event: "config",
				payload: { filename: currentFilenameRef.current, exercise, category },
			}));

			if (videoGuideRef.current) {
				videoGuideRef.current.currentTime = 0;
				videoGuideRef.current.play();
				videoGuideRef.current.onended = handleEndRecording;
			}
			if (webcam.video) {
				(webcam.video as any).requestVideoFrameCallback(runDetectionOnVideoFrame);
			}
		};

		ws.current.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log("Server message:", data);
			setStatusMessage(data.message);
		};

		ws.current.onerror = (e) => {
			console.error("WebSocket Error:", e);
			setStatusMessage("Error: Connection lost.");
		};

		ws.current.onclose = () => {
			console.log("WebSocket closed.");
		};

	}, [isRecording, user, exercise, category, videoGuideRef, handleEndRecording, runDetectionOnVideoFrame]);

	return { handleStartRecording, isRecording, statusMessage, webcamRef, canvasRef };
};
