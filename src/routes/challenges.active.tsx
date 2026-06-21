import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/supabase";
import { Loader2, Swords, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/challenges/active")({
  head: () => ({ meta: [{ title: "My Active Matches · Kabaoo" }] }),
  component: ActiveMatchesPage,
});

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

function ActiveMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadMyMatches() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUser(user);

      // STRICT FILTER: Inner join on participants to find exactly where this user is playing
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          participants!inner(user_id)
        `)
        .eq("participants.user_id", user.id)
        .in("status", ["waiting", "in_progress"]) 
        .order("created_at", { ascending: false });

      if (!error && data) {
        setMatches(data);
      }
      setLoading(false);
    }

    loadMyMatches();
  }, []);

  const handleCancelMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to cancel this challenge? It will be removed from the public lobby.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: 'cancelled' })
        .eq("id", matchId);

      if (error) throw error;

      setMatches(matches.filter(m => m.id !== matchId));

    } catch (err) {
      alert("Failed to cancel the match. Please try again.");
      console.error(err);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">My Active Matches</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your live games, waiting lobbies, and recent history.</p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/50">
            <Target className="size-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold">No active matches</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">You aren't currently in any lobbies.</p>
            <Link to="/challenges/public">
              <Button variant="outline" className="font-semibold card-lift">Find a Match</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => {
              const isHost = m.creator_id === currentUser?.id;
              const canCancel = isHost && m.status === 'waiting';
              
              return (
                <div key={m.id} className="rounded-lg border border-border card-accent bg-card p-5 shadow-[var(--shadow-card)] card-lift flex flex-col hover:border-primary/40 transition-all duration-300 group">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{m.game_mode} ({m.tournament_format})</div>
                      <div className="font-display text-lg font-bold mt-1 group-hover:text-primary transition-colors duration-300">
                        {isHost ? "You are Hosting" : "You are Participating"}
                      </div>
                    </div>
                    <div className="rounded-full bg-surface px-3 py-1 text-xs font-semibold border border-border capitalize">
                      {m.status.replace("_", " ")}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-surface p-3 rounded-md border border-border">
                      <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Entry</div>
                      <div className="font-mono font-bold mt-0.5">{formatINR(m.entry_fee / 100)}</div>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-md border border-primary/30">
                      <div className="text-[10px] text-primary font-semibold uppercase tracking-wider">Prize</div>
                      <div className="font-display font-bold mt-0.5 text-gradient-primary">{formatINR(m.prize_pool / 100)}</div>
                    </div>
                  </div>

                  {/* Buttons Section */}
                  <div className="flex gap-2 mt-auto pt-2">
                    <Link to="/match/$id" params={{ id: m.id }} className="flex-1 block">
                      <Button className="w-full gap-2 font-semibold card-lift">
                        <Swords className="size-4" /> Go to Lobby
                      </Button>
                    </Link>
                    
                    {canCancel && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleCancelMatch(m.id)}
                        className="px-3 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all duration-300 card-lift"
                        title="Cancel Challenge"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}