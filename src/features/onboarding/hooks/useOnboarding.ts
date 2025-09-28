import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	createUserOnboarding,
	createUserProblem,
	createSessionRequirement,
	type OnboardingCreatePayload,
	type UserProblemCreatePayload,
	type SessionRequirementCreatePayload
} from "@/shared/api/userService"

const ONBOARDING_QUESTIONS = [
	{
		question: "What is your main motivation or primary goal in partaking in rehabilitation exercises?",
		type: "options",
		options: ["Reduce Pain", "Improve Mobility", "Increase Flexibility", "Improve Strength"],
	},
	{
		question: "On a scale of 1 to 10, rate your current back pain level.",
		type: "slider",
		min: 1,
		max: 10,
	},
	{
		question: "What movement do you have problems with doing?",
		type: "options",
		options: ["Twisting", "Bending to the Side", "Raising an Arm"],
	},
	{
		question: "What is your preferred exercise frequency within a week?",
		type: "options",
		options: ["2 times a week", "3 times a week", "5 times a week", "7 times a week"],
	},
];

export const useOnboarding = () => {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();

	const [currentStep, setCurrentStep] = useState<number>(0);
	const [answers, setAnswers] = useState<Record<number, string>>({ 1: "5" })

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [isComplete, setIsComplete] = useState<boolean>(false);

	const handleNext = () => {
		if (currentStep < ONBOARDING_QUESTIONS.length) {
			setCurrentStep(prev => prev + 1);
		} else {
			handleSubmit();
		}
	}

	const handlePrev = () => {
		if (currentStep > 0) {
			setCurrentStep(prev => prev - 1);
		}
	};

	const handleAnswerSelect = (value: string) => {
		setAnswers(prev => ({ ...prev, [currentStep]: value }));
	}

	const handleSubmit = async () => {
		if (!userId) {
			setError("User ID is missing from the URL");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const problemMap: Record<string, string> = {
				"Twisting": "torso_rotation",
				"Bending to the Side": "flank_stretch",
				"Raising an Arm": "hiding_face"
			}
			const painScore = parseInt(answers[1], 10);
			const problemArea = problemMap[answers[2]] || answers[2];

			console.log(answers)

			const onboardingPayload: OnboardingCreatePayload = {
				primary_goal: answers[0],
				pain_score: painScore,
				preferred_schedule: parseInt(answers[3].split(" ")[0], 10),
			}

			const problemPayload: UserProblemCreatePayload = {
				problem_area: problemArea,
			}

			const exerciseIdMap: Record<string, number> = {
				"hiding_face": 1, "flank_stretch": 2, "torso_rotation": 3
			}


			const requirementPayload: SessionRequirementCreatePayload = {
				user_id: parseInt(userId),
				exercise_id: exerciseIdMap[problemArea],
				number_of_reps: painScore <= 6 ? 5 : 3,
				number_of_sets: painScore <= 6 ? 3 : 2,
			};


			console.log("requirements: ", requirementPayload)
			console.log("onboarding: ", onboardingPayload)
			console.log("problem: ", problemPayload)

			await Promise.all([
				createUserOnboarding(parseInt(userId), onboardingPayload),
				createUserProblem(parseInt(userId), problemPayload),
				createSessionRequirement(parseInt(userId), requirementPayload)
			]);

			setIsComplete(true);
			setTimeout(() => navigate("/app"), 3000)

		} catch (error: any) {
			setError(error.message || "An unexpected error occurred.");
			console.error("error", error)
			alert("There was a problem submitting your information. Please try again.");

		} finally {
			setIsLoading(false);
		}
	}

	return {
		currentStep,
		answers,
		isComplete,
		isLoading,
		error,
		questions: ONBOARDING_QUESTIONS,
		handleNext,
		handlePrev,
		handleAnswerSelect,
		handleSubmit
	}
}
