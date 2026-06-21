import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search, Swords, Filter, Loader2, User } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/challenges/public")({
  head: () => ({
    meta: [
      { title: "Find Match · Kabaoo" },
      { name: "description", content: "Browse live public Valorant challenges and join one that fits your skill and stake." },
    ],
  }),
  // INSTANT AUTH GUARD: Runs before the page even loads
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/auth" });
    }
  },
  component: PublicLobby,
});

const STAKE_FILTERS = ["All", "≤ ₹500", "₹500–₹2K", "₹2K+"];

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

function PublicLobby() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveMatches() {
      try {
        const { data: matchesData, error } = await supabase
          .from("matches")
          .select("*")
          .eq("type", "public")
          .eq("status", "waiting")
          .order("created_at", { ascending: false });

        if (error || !matchesData) {
          setLoading(false);
          return;
        }

        const visibleMatches = matchesData.filter(match => {
          if (match.tournament_format === 'ffa') {
            return match.current_players >= 1 && match.current_players < match.max_players;
          } else {
            return match.current_players === (match.max_players / 2);
          }
        });

        if (visibleMatches.length === 0) {
          setMatches([]);
          setLoading(false);
          return;
        }

        const creatorIds = [...new Set(visibleMatches.map(m => m.creator_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, riot_id, tagline")
          .in("id", creatorIds);

        const profilesMap = (profilesData || []).reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        const enrichedMatches = visibleMatches.map(m => ({
          ...m,
          creator: profilesMap[m.creator_id] || { riot_id: "Unknown", tagline: "" }
        }));

        setMatches(enrichedMatches);
      } catch (err) {
        console.error("Failed to load lobby", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveMatches();
  }, []);

  const filtered = useMemo(() => {
    return matches.filter((c) => {
      const matchQ = c.creator.riot_id.toLowerCase().includes(q.toLowerCase());
      
      const feeInRupees = c.entry_fee / 100;
      
      const matchF =
        filter === "All" ||
        (filter === "≤ ₹500" && feeInRupees <= 500) ||
        (filter === "₹500–₹2K" && feeInRupees > 500 && feeInRupees <= 2000) ||
        (filter === "₹2K+" && feeInRupees > 2000);
        
      return matchQ && matchF;
    });
  }, [q, filter, matches]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Find a Match</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {loading ? "Loading live lobby..." : `${filtered.length} active challenges · Join one or create your own`}
            </p>
          </div>
          <Link to="/challenges/create">
            <Button className="gap-2 font-semibold shadow-[var(--shadow-glow)] card-lift">
              <Swords className="size-4" /> Create Challenge
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by Riot ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 transition-all focus-visible:border-primary"
            />
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-1 overflow-x-auto">
            <Filter className="size-3.5 text-muted-foreground ml-2 shrink-0" />
            {STAKE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-semibold transition-all duration-300 whitespace-nowrap",
                  filter === f ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <div className="text-sm font-mono uppercase tracking-widest">Scanning network...</div>
          </div>
        )}

        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:border-primary/40 transition-all duration-300 card-lift"
              >
                <div className="absolute -top-12 -right-12 size-32 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-center gap-3">
                  <div className="size-12 rounded-md bg-surface-elevated border border-border flex items-center justify-center font-display text-xl font-bold text-muted-foreground">
                    {c.creator.riot_id.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-bold truncate group-hover:text-primary transition-colors duration-300">{c.creator.riot_id}#{c.creator.tagline}</div>
                    <div className="text-xs text-muted-foreground font-semibold text-primary">{c.game_mode} ({c.tournament_format})</div>
                  </div>
                </div>
                
                <div className="relative mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-border bg-surface p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Entry</div>
                    <div className="mt-0.5 font-mono font-bold text-foreground">{formatINR(c.entry_fee / 100)}</div>
                  </div>
                  <div className="rounded-md border border-primary/30 bg-primary/10 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">Total Prize</div>
                    <div className="mt-0.5 font-mono font-bold text-primary">{formatINR(c.prize_pool / 100)}</div>
                  </div>
                </div>
                
                {c.description && (
                  <div className="relative mt-3 text-xs text-muted-foreground truncate">"{c.description}"</div>
                )}
                
                <Link to="/match/$id" params={{ id: c.id }} className="relative block mt-4">
                  <Button className="w-full font-semibold shadow-[var(--shadow-glow)] card-lift">View Bracket</Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/50">
            <User className="size-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-foreground">No matches found</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">There are currently no active public brackets matching your filters.</p>
            <Link to="/challenges/create">
              <Button variant="outline" className="font-semibold card-lift">Host the first bracket</Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}