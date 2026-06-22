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
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {/* Sidebar - NOW LOCKED ON DESKTOP */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-white transition-transform md:translate-x-0 md:sticky md:top-0 md:h-screen flex flex-col",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-24 items-center justify-between px-6 border-b border-border shrink-0">
          <Link to="/" className="flex items-center">
            <img src="/Kabaoo.png" alt="Kabaoo" className="h-12 md:h-14 lg:h-16 object-contain" />
          </Link>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
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
                    ? "bg-[#FF4655]/10 text-[#FF4655] border-l-4 border-[#FF4655]"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 border-l-4 border-transparent",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-white shrink-0">
          <Link to="/challenges/create">
            <Button className="w-full gap-2 font-bold uppercase tracking-wider rounded-none bg-[#FF4655] hover:bg-[#e03e4b] text-white">
              <Plus className="size-4" /> Host Tournament
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-24 border-b border-border bg-white/80 backdrop-blur-md flex items-center justify-between px-6 md:px-10 shadow-sm">
          <div className="flex items-center gap-4">
             <button className="md:hidden" onClick={() => setOpen(true)}>
               <Menu className="size-6 text-foreground" />
             </button>
             <Link to="/" className="md:hidden flex items-center">
               <img src="/Kabaoo.png" alt="Kabaoo" className="h-10 object-contain" />
             </Link>
          </div>
          
          <div className="hidden md:block text-sm text-muted-foreground font-mono font-bold uppercase tracking-wider">
            {pathname}
          </div>

          <div className="flex items-center gap-4">
            {profile ? (
              <>
                <Link
                  to="/wallet"
                  className="hidden sm:flex items-center gap-2 px-4 h-10 rounded-none bg-black/5 border border-black/10 text-sm font-mono font-bold hover:border-[#FF4655] transition-colors"
                >
                  <Wallet className="size-4 text-[#FF4655]" />
                  ₹{((profile.balance || 0) / 100).toFixed(2)}
                </Link>
                
                <Link to="/profile" className="flex items-center gap-3 group">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`}
                    alt="avatar"
                    className="size-10 rounded-none bg-black/5 border border-black/10 group-hover:border-[#FF4655] transition-colors"
                  />
                  <div className="hidden md:block text-sm leading-tight">
                    <div className="font-bold text-foreground group-hover:text-[#FF4655] transition-colors">{profile.display_name}</div>
                    <div className="text-xs font-semibold text-muted-foreground">{profile.riot_id}#{profile.tagline}</div>
                  </div>
                </Link>
              </>
            ) : (
              <div className="animate-pulse flex items-center gap-3">
                <div className="h-10 w-24 bg-black/5 rounded-none border border-black/10"></div>
                <div className="h-10 w-32 bg-black/5 rounded-none border border-black/10"></div>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              className="text-muted-foreground hover:text-white hover:bg-red-500 rounded-none transition-colors ml-2"
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
          className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}