import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  CreditCard,
  Shield,
  Palette,
  Save,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  credits: number;
  tier: string;
}

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    scriptComplete: true,
    videoReady: true,
    marketing: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });

      await loadUserData();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Palette className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>

              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-2 border-primary/30">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                      {displayName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG or GIF (Max 2MB)
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email
                  </p>
                </div>

                {/* Tier */}
                <div className="space-y-2">
                  <Label>Current Plan</Label>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="font-semibold text-primary capitalize">
                        {profile?.tier || "Free"} Tier
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {profile?.credits || 0} credits remaining
                    </span>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your account
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Script Generation Complete</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your script is ready
                    </p>
                  </div>
                  <Switch
                    checked={notifications.scriptComplete}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, scriptComplete: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Video Ready</p>
                    <p className="text-sm text-muted-foreground">
                      Alert when your video generation is complete
                    </p>
                  </div>
                  <Switch
                    checked={notifications.videoReady}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, videoReady: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing & Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Receive news, tips, and special offers
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketing: checked })
                    }
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Billing & Subscription</h3>

              <div className="space-y-6">
                {/* Current Plan */}
                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{profile?.tier || "Free"} Plan</h4>
                    <Badge className="bg-primary">Current</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {profile?.credits || 0} credits remaining
                  </p>
                  <Button variant="outline" className="w-full">
                    Upgrade Plan
                  </Button>
                </div>

                <Separator />

                {/* Payment Method */}
                <div>
                  <h4 className="font-medium mb-3">Payment Method</h4>
                  <Card className="p-4 border-dashed">
                    <p className="text-sm text-muted-foreground text-center">
                      No payment method added
                    </p>
                    <Button variant="outline" className="w-full mt-3">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </Card>
                </div>

                <Separator />

                {/* Billing History */}
                <div>
                  <h4 className="font-medium mb-3">Billing History</h4>
                  <p className="text-sm text-muted-foreground">
                    No billing history available
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Preferences</h3>

              <div className="space-y-6">
                {/* Theme */}
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Default Video Vibe */}
                <div className="space-y-2">
                  <Label>Default Video Vibe</Label>
                  <Select defaultValue="cinematic">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="dramatic">Dramatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Language */}
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Danger Zone */}
                <div className="pt-4">
                  <h4 className="font-medium text-destructive mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Danger Zone
                  </h4>
                  <Card className="p-4 border-destructive/50 bg-destructive/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button variant="destructive">Delete</Button>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
