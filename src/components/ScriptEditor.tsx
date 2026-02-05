import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Image, Play, Pause, Volume2, FileText, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
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
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyFullScript = async () => {
    const fullScript = scenes
      .map((s) => `Scene ${s.id} (${s.duration}):\n"${s.dialogue}"\n[Visual: ${s.visualInstruction}]`)
      .join('\n\n---\n\n');
    
    try {
      await navigator.clipboard.writeText(fullScript);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Full script copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try selecting and copying manually",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-border/50 gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg md:text-xl font-semibold truncate">Script Editor</h2>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Copy Script Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={copyFullScript}
            className="gap-2"
            aria-label="Copy full script"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Script"}</span>
          </Button>

          {/* Tier Toggle */}
          <div className="glass-card-subtle px-2 md:px-4 py-1.5 md:py-2 flex items-center gap-2 md:gap-3">
            <span className={cn(
              "text-xs md:text-sm font-medium transition-colors hidden sm:inline",
              !isPro ? "text-foreground" : "text-muted-foreground"
            )}>
              Free
            </span>
            <Switch
              checked={isPro}
              onCheckedChange={setIsPro}
              className="data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-accent"
              aria-label={isPro ? "Switch to free tier" : "Switch to pro tier"}
            />
            <span className={cn(
              "text-xs md:text-sm font-medium transition-colors hidden sm:inline",
              isPro ? "gradient-text" : "text-muted-foreground"
            )}>
              Pro
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Preview Toggle */}
      <div className="lg:hidden flex items-center justify-center gap-2 p-2 border-b border-border/50 bg-secondary/30">
        <Button
          variant={!showPreview ? "default" : "ghost"}
          size="sm"
          onClick={() => setShowPreview(false)}
          className={cn(
            "flex-1 transition-colors",
            !showPreview && "bg-primary/20 text-primary hover:bg-primary/30"
          )}
        >
          <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
          <span>Script</span>
        </Button>
        <Button
          variant={showPreview ? "default" : "ghost"}
          size="sm"
          onClick={() => setShowPreview(true)}
          className={cn(
            "flex-1 transition-colors",
            showPreview && "bg-primary/20 text-primary hover:bg-primary/30"
          )}
        >
          <Play className="w-4 h-4 mr-2" aria-hidden="true" />
          <span>Preview</span>
        </Button>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Script Timeline */}
        <div className={cn(
          "flex-1 overflow-y-auto p-4 md:p-6 lg:border-r lg:border-border/50",
          showPreview && "hidden lg:block"
        )}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            SCENE TIMELINE
          </h3>
          <div className="space-y-3 md:space-y-4">
            {scenes.map((scene, index) => (
              <motion.button
                key={scene.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveScene(index)}
                className={cn(
                  "scene-card cursor-pointer w-full text-left transition-all",
                  activeScene === index && "ring-2 ring-primary/50 bg-primary/5 border-primary/50"
                )}
                aria-label={`Scene ${scene.id}: ${scene.dialogue.substring(0, 50)}...`}
                aria-pressed={activeScene === index}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Scene Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shadow-md">
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
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
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
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-dashed border-border/50">
                            <Image className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                            <span className="text-xs text-muted-foreground">
                              AI-generated visual will appear here
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className={cn(
          "w-full lg:w-[340px] flex-shrink-0 p-4 md:p-6 flex flex-col items-center justify-center",
          !showPreview && "hidden lg:flex"
        )}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 self-start">
            PREVIEW
          </h3>

          <div className="preview-phone w-full max-w-[280px]">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20 flex items-center justify-center">
              <div className="w-12 h-1 bg-gray-800 rounded-full" />
            </div>

            {/* Content */}
            <div className="h-full w-full bg-gray-950 flex flex-col items-center justify-center p-6 pt-12 relative z-0">
              {/* Ambient Background Gradient inside phone */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScene}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center px-4 relative z-10"
                >
                  <p className="text-base md:text-lg font-medium leading-relaxed text-white drop-shadow-md">
                    "{scenes[activeScene]?.dialogue}"
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-105 transition-all text-white border border-white/10"
                aria-label="Play preview"
              >
                <Play className="w-5 h-5 fill-current" />
              </Button>
            </div>

            {/* Progress */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full z-20" />
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            TikTok / Reels Preview ({activeScene + 1} / {scenes.length})
          </p>
        </div>
      </div>
    </motion.div>
  );
}
