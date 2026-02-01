import { motion } from "framer-motion";
import { Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8"
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          Welcome back, <span className="gradient-text">{displayName}</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Ready to transform threads into viral content?
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="glass-card px-3 md:px-4 py-2 flex items-center gap-2 shadow-lg">
          <Coins className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" aria-hidden="true" />
          <span className="font-semibold text-sm md:text-base">{credits}</span>
          <span className="text-muted-foreground text-xs md:text-sm hidden sm:inline">Credits</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex glass-card-subtle border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all"
        >
          <Sparkles className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
          <span>Get More</span>
        </Button>
      </div>
    </motion.header>
  );
}
