import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
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

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

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

        {children}
      </main>
    </div>
  );
}
