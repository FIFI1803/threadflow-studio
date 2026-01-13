import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>
        <p className="text-muted-foreground animate-pulse">Loading ThreadFlow...</p>
      </motion.div>
    </div>
  );
}
