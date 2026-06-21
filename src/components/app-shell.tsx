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
    window.location.href = "/"; 
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-white transition-transform md:translate-x-0 md:static",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-wider text-foreground">
             <div className="relative size-6 flex items-center justify-center">
               <div className="absolute inset-0 bg-primary rotate-45" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 40%)' }} />
               <div className="absolute inset-0 bg-primary rotate-45" style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 100%, 0 100%)' }} />
            </div>
             KABAOO
          </Link>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-none px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors",
                  active
                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface border-l-4 border-transparent",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-border bg-white">
          <Link to="/challenges/create">
            <Button className="w-full gap-2 font-bold uppercase tracking-wider rounded-none bg-primary hover:bg-primary/90">
              <Plus className="size-4" /> Host Tournament
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-20 border-b border-border bg-white flex items-center justify-between px-6 md:px-10 shadow-sm">
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="size-6 text-foreground" />
          </button>
          
          <div className="hidden md:block text-sm text-muted-foreground font-mono font-bold uppercase tracking-wider">
            {pathname}
          </div>

          <div className="flex items-center gap-4">
            {profile ? (
              <>
                <Link
                  to="/wallet"
                  className="hidden sm:flex items-center gap-2 px-4 h-10 rounded-none bg-surface border border-border text-sm font-mono font-bold hover:border-primary transition-colors"
                >
                  <Wallet className="size-4 text-primary" />
                  ₹{((profile.balance || 0) / 100).toFixed(2)}
                </Link>
                
                <Link to="/profile" className="flex items-center gap-3 group">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`}
                    alt="avatar"
                    className="size-10 rounded-none bg-surface border border-border group-hover:border-primary transition-colors"
                  />
                  <div className="hidden md:block text-sm leading-tight">
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">{profile.display_name}</div>
                    <div className="text-xs font-semibold text-muted-foreground">{profile.riot_id}#{profile.tagline}</div>
                  </div>
                </Link>
              </>
            ) : (
              <div className="animate-pulse flex items-center gap-3">
                <div className="h-10 w-24 bg-surface rounded-none border border-border"></div>
                <div className="h-10 w-32 bg-surface rounded-none border border-border"></div>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              className="text-muted-foreground hover:text-white hover:bg-destructive rounded-none transition-colors ml-2"
              title="Logout"
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/80 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}