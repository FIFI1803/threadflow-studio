import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
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

  const handleSubmit = () => {
    if (content.trim()) {
      onGenerate(content, vibe);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card p-8 max-w-4xl mx-auto"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-lg font-semibold mb-3">
            Paste your Reddit or X Thread here
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Drop your thread here... We'll analyze it and create a production-ready script with scene breakdowns, visual instructions, and timing."
            className="min-h-[200px] bg-secondary/50 border-border/50 focus:border-primary resize-none text-base"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Select Video Vibe
            </label>
            <Select value={vibe} onValueChange={setVibe}>
              <SelectTrigger className="w-full sm:w-[240px] bg-secondary/50 border-border/50">
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
            className="glow-button w-full sm:w-auto bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-6 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Production Blueprint
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary">AI is analyzing the thread logic...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
