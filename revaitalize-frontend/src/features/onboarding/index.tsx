import { Button } from "@/shared/components/ui/button";
import onboardingLogo from "@/assets/imgs/onboarding-logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

import { useOnboarding } from "./hooks/useOnboarding";

import { OnboardingOrbs } from "./components/OnboardingOrbs";
import { AuroraStyles } from "./components/AuroraStyles";
import { TooltipSlider } from "./components/TooltipSlider";
import { OptionCard, stepVariants } from "./components/OptionCard";



const OnboardingPage: React.FC = () => {
    const {
        currentStep,
        answers,
        isComplete,
        isLoading,
        questions,
        handleNext,
        handlePrev,
        handleAnswerSelect,
        handleSubmit,
    } = useOnboarding();

    const currentQuestionData = questions[currentStep];
    const isLastStep = currentStep === questions.length - 1;
    const progress = ((currentStep + 1) / questions.length) * 100;

    return (
        <>
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
                                            Step {currentStep + 1} / {questions.length}
                                        </motion.p>
                                        <motion.h1 variants={stepVariants} className="text-3xl font-bold text-[#013A63] mb-6">
                                            {currentQuestionData.question}
                                        </motion.h1>

                                        {currentQuestionData.type === "slider" ? (
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
                                            {isLoading ? <Loader2 className="animate-spin" /> : (isLastStep ? "Finish" : "Next")}
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
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
                            >
                                <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto" />
                            </motion.div>
                            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }} className="text-3xl font-bold text-[#013A63] mt-6">
                                You're all set!
                            </motion.h1>
                            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.9 } }} className="text-slate-600 mt-2">
                                We"re preparing your personalized dashboard.
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default OnboardingPage;
