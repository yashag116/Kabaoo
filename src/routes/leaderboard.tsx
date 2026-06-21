import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Trophy, Medal, Crown, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard · Kabaoo" },
      { name: "description", content: "Top Valorant players ranked by tournament prizes, wins, and win rate." },
    ],
  }),
  component: LeaderboardPage,
});

const TABS = ["Prize Money", "Wins", "Win Rate"] as const;

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  rank: string;
  wins: number;
  losses: number;
  winRate: number;
  prizeMoney: number;
}

function LeaderboardPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("Prize Money");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const [profilesRes, matchesRes] = await Promise.all([
          supabase.from("profiles").select("id, display_name, riot_id, tagline"),
          supabase.from("matches").select("creator_id, opponent_id, winner_id, prize_pool").eq("status", "completed")
        ]);

        const profiles = profilesRes.data || [];
        const matches = matchesRes.data || [];

        // STRICT COMPLIANCE: No P&L math. Only tracking total wins, losses, and gross prize pools won.
        const statsMap: Record<string, { wins: number, losses: number, prizeMoney: number }> = {};
        
        profiles.forEach(p => {
          statsMap[p.id] = { wins: 0, losses: 0, prizeMoney: 0 };
        });

        matches.forEach(m => {
          const prize = m.prize_pool / 100;

          if (statsMap[m.creator_id]) {
            if (m.winner_id === m.creator_id) {
              statsMap[m.creator_id].wins += 1;
              statsMap[m.creator_id].prizeMoney += prize; // Never subtracts. Accumulates total prizes won.
            } else {
              statsMap[m.creator_id].losses += 1;
            }
          }

          if (m.opponent_id && statsMap[m.opponent_id]) {
            if (m.winner_id === m.opponent_id) {
              statsMap[m.opponent_id].wins += 1;
              statsMap[m.opponent_id].prizeMoney += prize;
            } else {
              statsMap[m.opponent_id].losses += 1;
            }
          }
        });

        const leaderboardData: LeaderboardEntry[] = profiles.map(p => {
          const s = statsMap[p.id];
          const totalGames = s.wins + s.losses;
          const winRate = totalGames > 0 ? Math.round((s.wins / totalGames) * 100) : 0;
          
          return {
            id: p.id,
            username: `${p.riot_id}#${p.tagline}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.display_name}`,
            rank: "Verified Competitor",
            wins: s.wins,
            losses: s.losses,
            winRate,
            prizeMoney: s.prizeMoney
          };
        });

        setEntries(leaderboardData);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...entries];
    if (tab === "Wins") arr.sort((a, b) => b.wins - a.wins);
    else if (tab === "Win Rate") {
      arr.sort((a, b) => {
        if (b.winRate === a.winRate) return (b.wins + b.losses) - (a.wins + a.losses);
        return b.winRate - a.winRate;
      });
    }
    else arr.sort((a, b) => b.prizeMoney - a.prizeMoney);
    
    return arr.slice(0, 20);
  }, [tab, entries]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">Compiling Global Rankings...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground text-sm mt-1">The most decorated competitors on the platform.</p>
        </div>

        {/* Podium (Top 3) */}
        {sorted.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            {[1, 0, 2].map((idx, i) => {
              const p = sorted[idx];
              if (!p) return null;
              const isFirst = idx === 0;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "relative overflow-hidden rounded-lg border bg-card p-4 md:p-6 text-center shadow-[var(--shadow-card)]",
                    isFirst ? "border-primary/50 md:scale-105 z-10" : "border-border",
                  )}
                  style={{ marginTop: i === 1 ? 0 : "1rem" }}
                >
                  {isFirst && <Crown className="size-6 md:size-8 text-primary mx-auto mb-2" />}
                  <img
                    src={p.avatar}
                    alt=""
                    className={cn("size-14 md:size-20 rounded-full mx-auto border-2", isFirst ? "border-primary" : "border-border")}
                  />
                  <div className="mt-3 font-display font-bold truncate">{p.username}</div>
                  <div className="text-xs text-muted-foreground">{p.rank}</div>
                  
                  <div className={cn("mt-2 font-mono font-bold", p.prizeMoney > 0 ? "text-primary" : "text-muted-foreground")}>
                    {tab === "Prize Money" && formatINR(p.prizeMoney)}
                    {tab === "Wins" && `${p.wins} W`}
                    {tab === "Win Rate" && `${p.winRate}%`}
                  </div>

                  <div className={cn(
                    "absolute top-3 left-3 size-7 rounded-full grid place-items-center text-xs font-display font-bold",
                    isFirst ? "bg-primary text-primary-foreground" : "bg-surface-elevated border border-border",
                  )}>
                    {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <div className="inline-flex items-center gap-1 rounded-md border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded text-sm font-semibold transition-colors",
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Global Rankings Table */}
        <div className="rounded-lg border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground bg-surface/50 border-b border-border">
                  <th className="text-left p-4 w-16">Rank</th>
                  <th className="text-left p-4">Player</th>
                  <th className={cn("text-left p-4 transition-colors", tab === "Wins" && "text-primary bg-primary/5")}>Wins</th>
                  <th className="text-left p-4">Losses</th>
                  <th className={cn("text-left p-4 transition-colors", tab === "Win Rate" && "text-primary bg-primary/5")}>Win Rate</th>
                  <th className={cn("text-right p-4 transition-colors", tab === "Prize Money" && "text-primary bg-primary/5")}>Total Prizes Won</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No ranked players found. Play some matches!
                    </td>
                  </tr>
                ) : (
                  sorted.map((p, i) => (
                    <tr key={p.id} className={cn(
                      "border-b border-border/50 hover:bg-surface/50 transition-colors",
                      p.id === currentUser?.id && "bg-primary/5 hover:bg-primary/10",
                    )}>
                      <td className="p-4 font-display font-bold">
                        <span className="flex items-center gap-1">
                          {i === 0 && <Trophy className="size-4 text-primary" />}
                          {i === 1 && <Medal className="size-4 text-muted-foreground" />}
                          {i === 2 && <Medal className="size-4 text-warning" />}
                          #{i + 1}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={p.avatar} alt="" className="size-8 rounded-md bg-surface-elevated" />
                          <div>
                            <div className="font-semibold">{p.username}{p.id === currentUser?.id && " (you)"}</div>
                            <div className="text-xs text-muted-foreground">{p.rank}</div>
                          </div>
                        </div>
                      </td>
                      <td className={cn("p-4 font-mono transition-colors", tab === "Wins" && "bg-primary/5 font-bold text-foreground")}>{p.wins}</td>
                      <td className="p-4 font-mono text-muted-foreground">{p.losses}</td>
                      <td className={cn("p-4 font-mono transition-colors", tab === "Win Rate" && "bg-primary/5 font-bold text-foreground")}>{p.winRate}%</td>
                      <td className={cn(
                        "p-4 font-mono font-bold text-right transition-colors", 
                        tab === "Prize Money" && "bg-primary/5",
                        p.prizeMoney > 0 ? "text-primary" : "text-muted-foreground"
                      )}>
                        {formatINR(p.prizeMoney)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}