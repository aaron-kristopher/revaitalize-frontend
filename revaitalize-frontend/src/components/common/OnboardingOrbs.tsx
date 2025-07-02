import React from 'react';
import { motion } from 'framer-motion';

const OnboardingOrbs: React.FC = () => {
    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            {/* Orb 1: Light Blue */}
            <motion.div
                className="absolute bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-90"
                style={{ width: 400, height: 400, top: '5%', left: '10%' }}
                animate={{
                    x: ['0%', '40%', '-10%', '0%'],
                    y: ['0%', '-50%', '10%', '0%'],
                    rotate: [0, 40, -20, 0],
                }}
                transition={{
                    duration: 22,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror",
                }}
            />
            <motion.div
                className="absolute bg-sky-200 rounded-full mix-blend-multiply filter blur-2xl opacity-95"
                style={{ width: 300, height: 300, bottom: '10%', right: '15%' }}
                animate={{
                    x: ['0%', '-30%', '20%', '0%'],
                    y: ['0%', '40%', '-15%', '0%'],
                    rotate: [0, -30, 60, 0],
                }}
                transition={{
                    duration: 18,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 4, 
                }}
            />
             
            <motion.div
                className="absolute bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-75"
                style={{ width: 250, height: 250, top: '-10%', right: '5%' }} 
                animate={{
                    x: ['0%', '-25%', '15%', '0%'],
                    y: ['0%', '30%', '-5%', '0%'],
                    rotate: [0, 50, -50, 0],
                }}
                transition={{
                    duration: 28,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "loop",
                }}
            />
        </div>
    );
};

export default OnboardingOrbs;