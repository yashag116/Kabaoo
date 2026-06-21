import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  Award,
  Users,
  Target,
  Trophy,
  User,
  Shield,
  Plus,
  Menu,
  X,
  Zap,
  LogOut,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/challenges/public", label: "Browse Tournaments", icon: Trophy },
  { to: "/challenges/friend", label: "Private Tournament", icon: Users },
  { to: "/challenges/active", label: "My Tournaments", icon: Target },
  { to: "/leaderboard", label: "Leaderboard", icon: Award },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/admin", label: "Admin", icon: Shield },
] as const;

interface ShellProfile {
  display_name: string;
  riot_id: string;
  tagline: string;
  balance: number;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  // Real database state
  const [profile, setProfile] = useState<ShellProfile | null>(null);

  useEffect(() => {
    async function loadShellData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, riot_id, tagline, balance")
          .eq("id", user.id)
          .single();
        
        if (data) setProfile(data);
      }
    }
    loadShellData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // Force completely out to home page
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface/95 backdrop-blur transition-transform md:translate-x-0 md:static",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-wider">
            <span className="grid place-items-center h-8 w-8 rounded-md bg-primary text-primary-foreground">
              <Zap className="size-4" />
            </span>
            KABAOO
          </Link>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-foreground border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-border bg-surface">
          <Link to="/challenges/create">
            <Button className="w-full gap-2 font-semibold">
              <Plus className="size-4" /> Host Tournament
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 nav-glass flex items-center justify-between px-4 md:px-8">
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
          </button>
          
          <div className="hidden md:block text-sm text-muted-foreground font-mono">
            {pathname}
          </div>

          {/* Dynamic User Header */}
          <div className="flex items-center gap-3">
            {profile ? (
              <>
                <Link
                  to="/wallet"
                  className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-md bg-surface-elevated border border-border text-sm font-mono"
                >
                  <Wallet className="size-4 text-primary" />
                  ₹{((profile.balance || 0) / 100).toFixed(2)}
                </Link>
                
                <Link to="/profile" className="flex items-center gap-2">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`}
                    alt="avatar"
                    className="size-9 rounded-md bg-surface-elevated border border-border"
                  />
                  <div className="hidden md:block text-sm leading-tight">
                    <div className="font-semibold">{profile.display_name}</div>
                    <div className="text-xs text-muted-foreground">{profile.riot_id}#{profile.tagline}</div>
                  </div>
                </Link>
              </>
            ) : (
              // Loading skeleton so the header doesn't jump around while fetching
              <div className="animate-pulse flex items-center gap-3">
                <div className="h-9 w-24 bg-surface-elevated rounded-md border border-border"></div>
                <div className="h-9 w-32 bg-surface-elevated rounded-md border border-border"></div>
              </div>
            )}

            {/* ALWAYS SHOW LOGOUT BUTTON (Moved outside the profile check) */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              className="text-muted-foreground hover:text-red-500 ml-2"
              title="Logout"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}