import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/shared/components/ui/slider";

interface TooltipSliderProps {
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
}

export const TooltipSlider: React.FC<TooltipSliderProps> = ({ value, min, max, onChange }) => {
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
                        x: "-50%",
                    }}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{
                        opacity: isInteracting ? 1 : 0,
                        scale: isInteracting ? 1 : 0.8,
                        y: isInteracting ? 0 : 10,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
