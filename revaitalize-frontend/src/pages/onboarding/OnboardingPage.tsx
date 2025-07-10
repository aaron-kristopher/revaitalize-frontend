import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import onboardingLogo from "@/assets/imgs/onboarding-logo.png";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import OnboardingOrbs from '@/components/common/OnboardingOrbs';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    createUserOnboarding, 
    createUserProblem, 
    type OnboardingCreatePayload, 
    type UserProblemCreatePayload,
    createSessionRequirement,
    type SessionRequirementCreatePayload
} from '../../api/userService';

// --- Type Definitions for our data and props ---

interface OnboardingQuestion {
    question: string;
    type: 'options' | 'slider';
    options?: string[];
    min?: number;
    max?: number;
}

interface OptionCardProps {
    text: string;
    isSelected: boolean;
    onSelect: () => void;
}

const AuroraStyles = React.memo(() => (
  <style>
    {`
      @keyframes aurora {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      .animate-aurora {
        background-size: 200% 200%;
        animation: aurora 4s ease infinite;
      }
    `}
  </style>
));

interface TooltipSliderProps {
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
}

const TooltipSlider: React.FC<TooltipSliderProps> = ({ value, min, max, onChange }) => {
    const [isInteracting, setIsInteracting] = useState(false);
    
    const range = max - min;
    const valuePercent = range > 0 ? ((value - min) / range) * 100 : 0;

    return (
        <div className="flex w-full flex-col items-center gap-4 pt-4">
            <div
                className="relative w-full py-5"
                onPointerDown={() => setIsInteracting(true)}
                onPointerUp={() => setIsInteracting(false)}
                onMouseLeave={() => setIsInteracting(false)} 
            >
                <motion.div
                    className="absolute bottom-full mb-3 flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-to-r from-[#013A63] to-[#0077B6] animate-aurora text-xl font-bold text-white shadow-lg"
                    style={{
                        left: `${valuePercent}%`,
                        x: '-50%', 
                    }}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{
                        opacity: isInteracting ? 1 : 0,
                        scale: isInteracting ? 1 : 0.8,
                        y: isInteracting ? 0 : 10,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    {value}
                </motion.div>

                <Slider
                    value={[value]}
                    min={min}
                    max={max}
                    step={1}
                    onValueChange={(val) => onChange(val[0])}
                    className="w-full"
                />
            </div>
            <div className="w-full flex justify-between px-1 text-sm font-medium text-slate-500">
                <span>Low Pain</span>
                <span>High Pain</span>
            </div>
        </div>
    );
};


// --- Component Data ---

const onboardingQuestions: OnboardingQuestion[] = [
    {
        question: "What is your main motivation or primary goal in partaking in rehabilitation exercises?",
        type: 'options',
        options: ["Reduce Pain", "Improve Mobility", "Increase Flexibility", "Improve Strength"],
    },
    {
        question: "On a scale of 1 to 10, rate your current back pain level.",
        type: 'slider',
        min: 1,
        max: 10,
    },
    {
        question: "What movement do you have problems with doing?",
        type: 'options',
        options: ["Twisting", "Bending to the Side", "Raising an Arm"],
    },
    {
        question: "What is your preferred exercise frequency within a week?",
        type: 'options',
        options: ["2 times a week", "3 times a week", "5 times a week", "7 times a week"],
    },
];

// --- Animation Variants ---

const stepVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
};

// --- Child Component: OptionCard ---

const OptionCard: React.FC<OptionCardProps> = ({ text, isSelected, onSelect }) => {
    return (
        <motion.div
            onClick={onSelect}
            variants={stepVariants}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full p-4 border-2 rounded-xl cursor-pointer transition-colors duration-200 bg-white/50 backdrop-blur-sm ${
                isSelected ? 'border-[#0077B6]' : 'border-gray-300/50 hover:border-sky-400'
            }`}
        >
            <span className="text-base font-medium text-slate-800">{text}</span>
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1/2 -translate-y-1/2 right-4"
                    >
                        <CheckCircle2 className="h-6 w-6 text-[#0077B6]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// --- Main Page Component ---

const OnboardingPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<number, string>>({
        1: '5',
    });
    const [isComplete, setIsComplete] = useState<boolean>(false);

    const handleNext = (): void => {
        if (currentStep < onboardingQuestions.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            setIsComplete(true);
        }
    };

    const handlePrev = (): void => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleAnswerSelect = (value: string): void => {
        setAnswers((prev) => ({ ...prev, [currentStep]: value }));
    };

    const handleSubmit = async () => {
        if (!userId) {
            console.error("User ID is missing!");
            
            return;
        }
        
        const problemMap: Record<string, string> = {
            "Twisting": "torso_rotation",
            "Bending to the Side": "flank_stretch",
            "Raising an Arm": "hiding_face" 
        };

        // 2. Extract and format the answers
        const goalAnswer = answers[0];
        const painScoreAnswer = parseInt(answers[1], 10);
        const problemAnswer = answers[2];
        const scheduleAnswer = parseInt(answers[3].split(' ')[0], 10); 

        // 3. Prepare the main onboarding payload
        const onboardingPayload: OnboardingCreatePayload = {
            primary_goal: goalAnswer,
            pain_score: painScoreAnswer,
            preferred_schedule: scheduleAnswer,
        };
        
        // 4. Prepare the problem area payload
        const problemPayload: UserProblemCreatePayload = {
            // Use the map to get the backend-specific name
            problem_area: problemMap[problemAnswer] || problemAnswer,
        };

        let initialReps: number;
        let initialSets: number;

        if (painScoreAnswer >= 1 && painScoreAnswer <= 6) {
            initialSets = 3;
            initialReps = 5;
        } else { // 7-10
            initialSets = 2;
            initialReps = 3;
        }

        // Logic: Map the problem name to an Exercise ID from your database.
        // NOTE: This is a temporary mapping. In a real app, you might fetch this from the API.
        // Let's assume the Exercise IDs in your DB are: 1=torso_rotation, 2=flank_stretch, 3=hiding_face
        const exerciseIdMap: Record<string, number> = {
            "torso_rotation": 1,
            "flank_stretch": 2,
            "hiding_face": 3
        };

        const assignedExerciseId = exerciseIdMap[problemPayload.problem_area];
        
        // Prepare the payload for the new API call
        const requirementPayload: SessionRequirementCreatePayload = {
            user_id: parseInt(userId),
            exercise_id: assignedExerciseId,
            number_of_reps: initialReps,
            number_of_sets: initialSets,
        };

        try {
            // Here you would set a loading state if you had one
            
            // 5. Send the data to the backend in parallel
            await Promise.all([
                createUserOnboarding(parseInt(userId), onboardingPayload),
                createUserProblem(parseInt(userId), problemPayload),
                createSessionRequirement(parseInt(userId), requirementPayload)
            ]);

            // 6. On success, trigger the completion animation
            setIsComplete(true);

            // 7. After a delay, redirect to the dashboard
            setTimeout(() => {
                navigate('/dashboard'); // Or wherever the user should go next
            }, 3000); // 3-second delay to show the "You're all set!" message

        } catch (error) {
            console.error("Failed to submit onboarding data:", error);
            // Here you would set an error state to show a message to the user
            alert("There was a problem submitting your information. Please try again.");
        }
    };

    const currentQuestionData = onboardingQuestions[currentStep];
    const isLastStep = currentStep === onboardingQuestions.length - 1;
    const progress = ((currentStep + 1) / onboardingQuestions.length) * 100;

    return (
        <div className="relative min-h-screen bg-[#EAF7FF] p-8 flex flex-col justify-center overflow-hidden">
            <AuroraStyles />
            <OnboardingOrbs />

            <AnimatePresence>
                {!isComplete && (
                    <motion.div 
                        key="onboarding-flow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex flex-col justify-center"
                    >
                        <header className="w-full flex justify-center py-4 z-10">
                            <img src={onboardingLogo} alt="RevAlitalize Logo" className="h-28 -translate-x-4" />
                        </header>

                        <main className="w-full max-w-xl mx-auto z-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    variants={stepVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="w-full text-center"
                                >
                                    <motion.p variants={stepVariants} className="text-sm font-bold text-[#0077B6] tracking-wider uppercase mb-2">
                                        Step {currentStep + 1} / {onboardingQuestions.length}
                                    </motion.p>
                                    <motion.h1 variants={stepVariants} className="text-3xl font-bold text-[#013A63] mb-6">
                                        {currentQuestionData.question}
                                    </motion.h1>
                                    
                                    {currentQuestionData.type === 'slider' ? (
                                        <motion.div variants={stepVariants}>
                                            <TooltipSlider
                                                value={Number(answers[currentStep])}
                                                min={currentQuestionData.min!}
                                                max={currentQuestionData.max!}
                                                onChange={(value) => handleAnswerSelect(String(value))}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div variants={stepVariants} className="space-y-3">
                                            {currentQuestionData.options?.map((option) => (
                                                <OptionCard
                                                    key={option}
                                                    text={option}
                                                    isSelected={answers[currentStep] === option}
                                                    onSelect={() => handleAnswerSelect(option)}
                                                />
                                            ))}
                                        </motion.div>
                                    )}

                                </motion.div>
                            </AnimatePresence>
                        </main>

                        <footer className="w-full max-w-xl mx-auto flex flex-col items-center mt-12 z-10">
                            <div className="w-full bg-slate-200 rounded-full h-2 mb-5">
                                <motion.div
                                    className="bg-[#0077B6] h-2 rounded-full"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                />
                            </div>
                            <div className="w-full flex items-center justify-between">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={handlePrev}
                                        disabled={currentStep === 0}
                                        className="bg-white border-2 border-slate-300 text-[#0077B6] hover:bg-sky-100 hover:border-sky-200 rounded-full px-10 py-4 text-base font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
                                    >
                                        Previous
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={isLastStep ? handleSubmit : handleNext}
                                        disabled={!answers[currentStep]}
                                        className="bg-[#0077B6] hover:bg-blue-600 text-white rounded-full px-10 py-4 text-base font-semibold disabled:bg-slate-300"
                                    >
                                        {isLastStep ? 'Finish' : 'Next'}
                                    </Button>
                                </motion.div>
                            </div>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        key="completion"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-20"
                    >
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, rotate: 360, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
                        >
                            <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto" />
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition:{ delay: 0.8 } }} className="text-3xl font-bold text-[#013A63] mt-6">
                            You're all set!
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition:{ delay: 0.9 } }} className="text-slate-600 mt-2">
                            We're preparing your personalized dashboard.
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OnboardingPage;