import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ThreadInputProps {
  onGenerate: (content: string, vibe: string) => void;
  isLoading: boolean;
}

const vibeOptions = [
  { value: "cinematic", label: "🎬 Cinematic", description: "Epic, dramatic pacing" },
  { value: "minimalist", label: "✨ Minimalist", description: "Clean, simple cuts" },
  { value: "fast-paced", label: "⚡ Fast-Paced", description: "Quick, energetic edits" },
];

export function ThreadInput({ onGenerate, isLoading }: ThreadInputProps) {
  const [content, setContent] = useState("");
  const [vibe, setVibe] = useState("cinematic");
  const [charCount, setCharCount] = useState(0);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    setCharCount(text.length);
  };

  const handleSubmit = () => {
    if (content.trim()) {
      onGenerate(content, vibe);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && content.trim() && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card p-4 md:p-6 lg:p-8 max-w-4xl mx-auto"
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="thread-content" className="block text-base md:text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Paste your Reddit or X Thread here
            </label>
            <span className={cn(
              "text-xs transition-colors duration-300",
              charCount > 1000 ? "text-orange-400" : "text-muted-foreground"
            )}>
              {charCount} characters
            </span>
          </div>
          <Textarea
            id="thread-content"
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Drop your thread here... We'll analyze it and create a production-ready script with scene breakdowns, visual instructions, and timing."
            className="min-h-[180px] md:min-h-[220px] bg-secondary/30 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 resize-none text-sm md:text-base transition-all duration-300 backdrop-blur-sm"
            disabled={isLoading}
            aria-label="Thread content"
            aria-describedby="thread-hint"
          />
          <p id="thread-hint" className="text-xs text-muted-foreground mt-2">
            Tip: Press Cmd/Ctrl + Enter to generate
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label htmlFor="video-vibe" className="block text-sm font-medium text-muted-foreground mb-2">
              Select Video Vibe
            </label>
            <Select value={vibe} onValueChange={setVibe} disabled={isLoading}>
              <SelectTrigger
                id="video-vibe"
                className="w-full sm:w-[240px] bg-secondary/50 border-border/50 focus:ring-2 focus:ring-primary/20 transition-all h-11"
                aria-label="Select video vibe"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {vibeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isLoading}
            className="glow-button w-full sm:w-auto bg-gradient-to-br from-primary to-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 md:px-8 h-11 md:h-12 text-base md:text-lg transition-all"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Generate Production Blueprint</span>
                <span className="sm:hidden">Generate</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-2 h-2 rounded-full bg-primary"
            />
            <span className="text-xs md:text-sm text-primary font-medium">
              AI is analyzing the thread logic...
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
