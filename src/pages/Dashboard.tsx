import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ThreadInput } from "@/components/ThreadInput";
import { ScriptEditor } from "@/components/ScriptEditor";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  credits: number;
  tier: string;
}

interface Scene {
  id: number;
  dialogue: string;
  visualInstruction: string;
  duration: string;
}

interface GeneratedScript {
  scenes: Scene[];
}

// Mock scenes data for the editor
const mockScenes = [
  {
    id: 1,
    dialogue: "You won't believe what happened at the tech conference last week...",
    visualInstruction: "Open on a dramatic wide shot of a crowded conference hall. Slow zoom into speaker on stage.",
    duration: "3s",
  },
  {
    id: 2,
    dialogue: "The CEO walked on stage and dropped this bombshell...",
    visualInstruction: "Cut to close-up of a surprised audience member. Use tension-building sound effect.",
    duration: "4s",
  },
  {
    id: 3,
    dialogue: "They're completely pivoting the entire company strategy.",
    visualInstruction: "Quick montage of headlines and stock charts. Add whoosh transition.",
    duration: "3s",
  },
  {
    id: 4,
    dialogue: "But here's the part nobody's talking about...",
    visualInstruction: "Dramatic pause. Fade to black momentarily, then reveal key visual.",
    duration: "5s",
  },
  {
    id: 5,
    dialogue: "This changes everything for the industry. Follow for more insider updates.",
    visualInstruction: "End card with subscribe animation. Add upbeat outro music.",
    duration: "4s",
  },
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/auth");
      } else if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/auth");
      } else if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (content: string, vibe: string) => {
    // Check if user has credits
    if ((profile?.credits ?? 0) <= 0) {
      toast({
        title: "Out of credits",
        description: "You've used all your free credits. Upgrade to continue creating.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setGenerating(true);

    try {
      // 1. Invoke the generate-script edge function
      const { data: scriptData, error: functionError } = await supabase.functions.invoke('generate-script', {
        body: { thread_content: content, video_vibe: vibe }
      });

      if (functionError) throw new Error(functionError.message || "Failed to call AI service");
      if (!scriptData) throw new Error("No data returned from AI service");

      const generatedScript = scriptData;
      setGeneratedScript(generatedScript);

      // 2. Save project to database
      const { error: dbError } = await supabase.from("projects").insert({
        user_id: user.id,
        thread_content: content,
        video_vibe: vibe,
        title: content.substring(0, 50) + "...",
        status: "completed", // Set to completed since we generated it successfully
        script_data: generatedScript
      });

      if (dbError) throw dbError;

      // 3. Deduct credit after successful generation
      const { error: creditError } = await supabase
        .from("profiles")
        .update({ credits: (profile?.credits ?? 0) - 1 })
        .eq("user_id", user.id);

      if (creditError) {
        console.error("Failed to deduct credit:", creditError);
      } else {
        // Refresh profile to update credits in UI
        await fetchProfile(user.id);
      }

      toast({
        title: "Blueprint generated!",
        description: `Your production script is ready. (${(profile?.credits ?? 1) - 1} credits remaining)`,
      });

      setShowEditor(true);
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate blueprint",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <AppSidebar
        user={user}
        profile={profile}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      <main className="flex-1 overflow-hidden flex flex-col relative z-10 transition-all duration-300">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white text-xs font-bold">TF</span>
            </div>
            <span className="font-bold gradient-text">ThreadFlow</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <AnimatePresence mode="wait">
          {showEditor && generatedScript ? (
            <ScriptEditor
              key="editor"
              scenes={generatedScript.scenes || mockScenes}
              onBack={() => setShowEditor(false)}
            />
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
            >
              <DashboardHeader
                displayName={profile?.display_name || user?.email?.split("@")[0] || "Creator"}
                credits={profile?.credits || 50}
              />
              <ThreadInput onGenerate={handleGenerate} isLoading={generating} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
