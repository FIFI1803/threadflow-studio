import { motion } from "framer-motion";
import { Coins } from "lucide-react";

interface DashboardHeaderProps {
  displayName: string;
  credits: number;
}

export function DashboardHeader({ displayName, credits }: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex items-center justify-between mb-8"
    >
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="gradient-text">{displayName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Ready to transform threads into viral content?
        </p>
      </div>
      
      <div className="glass-card px-4 py-2 flex items-center gap-2">
        <Coins className="w-5 h-5 text-primary" />
        <span className="font-semibold">{credits}</span>
        <span className="text-muted-foreground text-sm">Credits</span>
      </div>
    </motion.header>
  );
}
