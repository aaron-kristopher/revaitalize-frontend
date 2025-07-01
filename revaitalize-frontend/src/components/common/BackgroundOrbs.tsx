import React from 'react';
import { motion } from 'framer-motion';

const BackgroundOrbs: React.FC = () => {
    return (
        <div className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden">
            <motion.div
                className="absolute rounded-full bg-blue-500 opacity-70 mix-blend-screen filter blur-2xl"
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
                className="absolute rounded-full bg-blue-400 opacity-80 mix-blend-screen filter blur-2xl"
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
                className="absolute rounded-full bg-blue-300 opacity-60 mix-blend-screen filter blur-xl"
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

export default BackgroundOrbs;