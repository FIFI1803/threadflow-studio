import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ThreadInput } from "@/components/ThreadInput";
import { ScriptEditor } from "@/components/ScriptEditor";
import { LoadingScreen } from "@/components/LoadingScreen";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  credits: number;
  tier: string;
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
  const navigate = useNavigate();
  const { toast } = useToast();

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
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (content: string, vibe: string) => {
    if (!user) return;

    setGenerating(true);

    try {
      // Save project to database
      const { error } = await supabase.from("projects").insert({
        user_id: user.id,
        thread_content: content,
        video_vibe: vibe,
        title: content.substring(0, 50) + "...",
        status: "processing",
      });

      if (error) throw error;

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2500));

      toast({
        title: "Blueprint generated!",
        description: "Your production script is ready for review.",
      });

      setShowEditor(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate blueprint",
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
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar user={user} profile={profile} />

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {showEditor ? (
            <ScriptEditor
              key="editor"
              scenes={mockScenes}
              onBack={() => setShowEditor(false)}
            />
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto p-8"
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
