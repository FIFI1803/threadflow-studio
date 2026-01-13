import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Image, Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Scene {
  id: number;
  dialogue: string;
  visualInstruction: string;
  duration: string;
}

interface ScriptEditorProps {
  scenes: Scene[];
  onBack: () => void;
}

export function ScriptEditor({ scenes, onBack }: ScriptEditorProps) {
  const [isPro, setIsPro] = useState(false);
  const [activeScene, setActiveScene] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold">Script Editor</h2>
        </div>

        {/* Tier Toggle */}
        <div className="flex items-center gap-4">
          <div className="glass-card-subtle px-4 py-2 flex items-center gap-3">
            <span className={cn(
              "text-sm font-medium transition-colors",
              !isPro ? "text-foreground" : "text-muted-foreground"
            )}>
              Free (Script Only)
            </span>
            <Switch
              checked={isPro}
              onCheckedChange={setIsPro}
              className="data-[state=checked]:bg-gradient-primary"
            />
            <span className={cn(
              "text-sm font-medium transition-colors",
              isPro ? "gradient-text" : "text-muted-foreground"
            )}>
              Pro (Automated Video)
            </span>
          </div>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Script Timeline */}
        <div className="flex-1 overflow-y-auto p-6 border-r border-border/50">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            SCENE TIMELINE
          </h3>
          <div className="space-y-4">
            {scenes.map((scene, index) => (
              <motion.div
                key={scene.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveScene(index)}
                className={cn(
                  "scene-card cursor-pointer",
                  activeScene === index && "border-primary/50 bg-primary/5"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Scene Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {scene.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Duration Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
                        {scene.duration}
                      </span>
                    </div>

                    {/* Dialogue */}
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Dialogue
                      </p>
                      <p className="text-sm leading-relaxed">{scene.dialogue}</p>
                    </div>

                    {/* Visual Instruction */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Visual Instruction
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {scene.visualInstruction}
                      </p>
                    </div>

                    {/* Pro Feature: Image Placeholder */}
                    <AnimatePresence>
                      {isPro && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 overflow-hidden"
                        >
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-dashed border-border">
                            <Image className="w-5 h-5 text-primary" />
                            <span className="text-xs text-muted-foreground">
                              AI-generated visual will appear here
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-[340px] flex-shrink-0 p-6 flex flex-col items-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 self-start">
            PREVIEW
          </h3>
          
          <div className="preview-phone w-full max-w-[270px] relative overflow-hidden">
            {/* Phone Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-10" />
            
            {/* Content */}
            <div className="h-full flex flex-col items-center justify-center p-6 pt-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScene}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <p className="text-sm leading-relaxed">
                    {scenes[activeScene]?.dialogue}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
              >
                <Volume2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Progress */}
            <div className="absolute bottom-16 left-4 right-4">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((activeScene + 1) / scenes.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            TikTok / Reels Preview
          </p>
        </div>
      </div>
    </motion.div>
  );
}
