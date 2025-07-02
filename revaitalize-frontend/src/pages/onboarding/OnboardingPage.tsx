import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import onboardingLogo from "@/assets/imgs/onboarding-logo.png";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

// Assuming BackgroundOrbs is in this location and correctly typed
import OnboardingOrbs from '@/components/common/OnboardingOrbs';

// --- Type Definitions for our data and props ---

interface OnboardingQuestion {
    question: string;
    options: string[];
}

interface OptionCardProps {
    text: string;
    isSelected: boolean;
    onSelect: () => void;
}

// --- Component Data ---

const onboardingQuestions: OnboardingQuestion[] = [
    {
        question: "How often would you like to engage in rehabilitation exercises?",
        options: ["Once a day", "3-4 times a week", "1-2 times a week"],
    },
    {
        question: "What is your primary goal with these exercises?",
        options: ["Reduce chronic pain", "Increase flexibility", "Improve strength"],
    },
    {
        question: "What time of day do you prefer to exercise?",
        options: ["In the morning", "During the afternoon", "In the evening"],
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
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isComplete, setIsComplete] = useState<boolean>(false);

    const handleNext = (): void => {
        if (currentStep < onboardingQuestions.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            setIsComplete(true);
            // You can add a redirect here after a delay, e.g.,
            // setTimeout(() => navigate('/app'), 2000);
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

    const currentQuestionData = onboardingQuestions[currentStep];
    const isLastStep = currentStep === onboardingQuestions.length - 1;
    const progress = ((currentStep + 1) / onboardingQuestions.length) * 100;

    return (
        <div className="relative min-h-screen bg-[#EAF7FF] p-8 flex flex-col justify-center overflow-hidden">
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
                                    <motion.h1 variants={stepVariants} className="text-3xl font-bold text-[#013A63] mb-10">
                                        {currentQuestionData.question}
                                    </motion.h1>
                                    <motion.div variants={stepVariants} className="space-y-3">
                                        {currentQuestionData.options.map((option) => (
                                            <OptionCard
                                                key={option}
                                                text={option}
                                                isSelected={answers[currentStep] === option}
                                                onSelect={() => handleAnswerSelect(option)}
                                            />
                                        ))}
                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>
                        </main>

                        <footer className="w-full max-w-xl mx-auto flex flex-col items-center mt-12 z-10">
                            <div className="w-full bg-gray-200/80 rounded-full h-2 mb-5">
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
                                        className="bg-white border-2 border-gray-300 text-[#0077B6] hover:bg-sky-100 hover:border-sky-200 rounded-full px-10 py-4 text-base font-semibold disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
                                    >
                                        Previous
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={handleNext}
                                        disabled={!answers[currentStep]}
                                        className="bg-[#0077B6] hover:bg-blue-600 text-white rounded-full px-10 py-4 text-base font-semibold disabled:bg-gray-300"
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