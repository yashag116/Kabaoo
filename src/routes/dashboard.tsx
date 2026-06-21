import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, Swords, AlertCircle, Target, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Kabaoo" },
      { name: "description", content: "Your Kabaoo mission control." },
    ],
  }),
  component: Dashboard,
});

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [activeMatches, setActiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate({ to: "/auth" });
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setDebugError(profileError.message);
        setLoading(false);
        return;
      } 
      setProfile(profileData);

      const { data: matchesData } = await supabase
        .from("matches")
        .select(`*, participants!inner(user_id)`)
        .eq("participants.user_id", user.id)
        .in("status", ["waiting", "in_progress"])
        .order("created_at", { ascending: false });

      if (matchesData) setActiveMatches(matchesData);
      
      setLoading(false);
    }

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (debugError) {
    return (
      <AppShell>
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 max-w-2xl mx-auto mt-12 text-center">
          <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-500 mb-2">Load Failed</h2>
          <p className="text-sm text-foreground mb-6 font-mono bg-background p-3 rounded">{debugError}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Mission Control</div>
            <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold">
              {profile?.display_name || "Unknown Player"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Riot ID: {profile?.riot_id}#{profile?.tagline}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/profile">
              <Button variant="outline" className="font-semibold card-lift">View Trophy Room</Button>
            </Link>
            <Link to="/challenges/create">
              <Button className="gap-2 font-semibold shadow-[var(--shadow-glow)] card-lift">
                <Swords className="size-4" /> Host Bracket
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-card p-6 md:p-8 shadow-[var(--shadow-card)] hover:border-primary/50 transition-colors duration-300">
          <div className="absolute -top-20 -right-10 size-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <Wallet className="size-3.5 text-primary" /> Available Funds
              </div>
              <div className="mt-2 font-display text-5xl font-bold text-gradient-primary">
                {formatINR((profile?.balance || 0) / 100)}
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/wallet"><Button size="lg" className="gap-2 font-semibold card-lift shadow-[var(--shadow-glow)]"><ArrowDownLeft className="size-4" /> Deposit</Button></Link>
              <Link to="/wallet"><Button size="lg" variant="outline" className="gap-2 font-semibold card-lift"><ArrowUpRight className="size-4" /> Withdraw</Button></Link>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Needs Your Attention</h2>
          </div>
          
          {activeMatches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
              <Target className="size-10 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold">You are clear for deployment</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">You have no active lobbies or pending matches right now.</p>
              <Link to="/challenges/public">
                <Button variant="outline" className="font-semibold card-lift">Find a Tournament</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {activeMatches.map(m => (
                <div key={m.id} className="group rounded-lg border border-border card-accent bg-card p-5 flex flex-col justify-between card-lift hover:border-primary/40 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs font-semibold uppercase text-primary tracking-wider">{m.status.replace("_", " ")}</div>
                      <div className="font-display font-bold mt-1 group-hover:text-primary transition-colors">{m.game_mode} ({m.tournament_format})</div>
                    </div>
                    <Users className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm font-mono text-muted-foreground">Prize: {formatINR(m.prize_pool / 100)}</div>
                    <Link to="/match/$id" params={{ id: m.id }}>
                      <Button size="sm" className="font-bold card-lift">Enter Lobby</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}