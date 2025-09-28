import { AnimatePresence, type Variants, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface OptionCardProps {
  text: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const stepVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
};

export const OptionCard: React.FC<OptionCardProps> = ({ text, isSelected, onSelect }) => {
  return (
    <motion.div
      onClick={onSelect}
      variants={stepVariants}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full p-4 border-2 rounded-xl cursor-pointer transition-colors duration-200 bg-white/50 backdrop-blur-sm ${isSelected ? "border-[#0077B6]" : "border-gray-300/50 hover:border-sky-400"
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
