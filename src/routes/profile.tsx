import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Target, Percent, Coins, Loader2, History, TrendingUp, Shield } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · Kabaoo" },
      { name: "description", content: "Your Kabaoo profile, stats, and full match history." },
    ],
  }),
  component: ProfilePage,
});

interface UserProfile {
  id: string;
  display_name: string;
  riot_id: string;
  tagline: string;
  balance: number;
}

interface EnrichedMatch {
  id: string;
  matchType: string;
  stake: number;
  prizePool: number;
  result: "WIN" | "LOSS";
  date: string;
  rawEarnings: number;
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<EnrichedMatch[]>([]);
  
  const [stats, setStats] = useState({ wins: 0, losses: 0, winRate: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFullProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate({ to: "/auth" });
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (!profileData) {
          setLoading(false);
          return;
        }
        setProfile(profileData);

        const { data: myParticipantRows } = await supabase
          .from("participants")
          .select("match_id, placement, payout_amount")
          .eq("user_id", user.id);

        if (!myParticipantRows || myParticipantRows.length === 0) {
          setStats({ wins: 0, losses: 0, winRate: 0, totalEarned: 0 });
          setHistory([]);
          setLoading(false);
          return;
        }

        const matchIds = myParticipantRows.map(p => p.match_id);

        const { data: matchRecords, error: matchError } = await supabase
          .from("matches")
          .select("*")
          .in("id", matchIds)
          .eq("status", "completed")
          .order("created_at", { ascending: true });

        if (matchError || !matchRecords || matchRecords.length === 0) {
          setStats({ wins: 0, losses: 0, winRate: 0, totalEarned: 0 });
          setHistory([]);
          setLoading(false);
          return;
        }

        let runningWins = 0;
        let runningLosses = 0;
        let totalNetEarned = 0;
        
        const calculatedHistory: EnrichedMatch[] = matchRecords.map((m) => {
          const myPerformance = myParticipantRows.find(p => p.match_id === m.id);
          
          const playerWon = myPerformance?.placement === 1;
          if (playerWon) runningWins++;
          else runningLosses++;

          const numericStake = m.entry_fee / 100;
          const payout = (myPerformance?.payout_amount || 0) / 100; 
          const netEarningsValue = payout - numericStake;
          
          totalNetEarned += netEarningsValue;

          return {
            id: m.id,
            matchType: `${m.game_mode} (${m.tournament_format})`,
            stake: numericStake,
            prizePool: m.prize_pool / 100,
            result: playerWon ? "WIN" : "LOSS",
            date: new Date(m.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            rawEarnings: netEarningsValue
          };
        });

        const absoluteMatchesCount = runningWins + runningLosses;
        const computedWinPercent = absoluteMatchesCount > 0 ? Math.round((runningWins / absoluteMatchesCount) * 100) : 0;

        setStats({ wins: runningWins, losses: runningLosses, winRate: computedWinPercent, totalEarned: totalNetEarned });
        setHistory([...calculatedHistory].reverse());
        setLoading(false);
      } catch (err) {
        console.error("Profile load issue:", err);
        setLoading(false);
      }
    }
    loadFullProfile();
  }, [navigate]);

  if (loading || !profile) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">Compiling Data...</p>
        </div>
      </AppShell>
    );
  }

  const chartData = [...history].reverse().slice(-15);
  const maxWin = Math.max(0, ...chartData.map(d => d.rawEarnings));
  const maxLoss = Math.min(0, ...chartData.map(d => d.rawEarnings));
  
  const range = (maxWin - maxLoss) || 1; 
  const zeroLinePercent = (maxWin / range) * 100;

  return (
    <AppShell>
      <div className="space-y-8">
        
        <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          <div className="absolute -top-20 -right-10 size-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`}
              alt="Avatar"
              className="size-24 md:size-28 rounded-lg border-2 border-primary/40 bg-surface-elevated shadow-lg"
            />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold flex items-center gap-2">
                <Shield className="size-3.5" /> Verified Competitor
              </div>
              <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold">{profile.display_name}</h1>
              <div className="mt-2 font-mono text-sm text-muted-foreground">
                {profile.riot_id}#{profile.tagline}
              </div>
            </div>
            <div className="md:text-right border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
               <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Net PnL</div>
               <div className={cn("font-mono text-2xl font-bold", stats.totalEarned >= 0 ? "text-success" : "text-destructive")}>
                 {stats.totalEarned >= 0 ? "+" : ""}{formatINR(stats.totalEarned)}
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Wins" value={stats.wins} icon={Trophy} accent />
          <StatCard label="Losses" value={stats.losses} icon={Target} />
          <StatCard label="Win Rate" value={`${stats.winRate}%`} icon={Percent} />
          <StatCard label="Available Escrow" value={formatINR(profile.balance / 100)} icon={Coins} />
        </div>

        <div className="rounded-lg border border-border card-accent bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Performance Analytics</h2>
              <p className="text-xs text-muted-foreground mt-1">Net entry vs. payout over the last 15 matches.</p>
            </div>
            <TrendingUp className="size-5 text-muted-foreground" />
          </div>
          
          <div className="p-6 bg-surface/30">
            {chartData.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center border border-dashed border-border rounded bg-surface/30">
                <History className="size-6 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Awaiting match data. Complete a tournament to generate analytics.</p>
              </div>
            ) : (
              <div className="relative h-56 w-full flex items-end justify-center gap-2 md:gap-4 mt-4">
                
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-t border-border w-full h-0" />
                  <div className="border-t border-border w-full h-0" />
                  <div className="border-t border-border w-full h-0" />
                  <div className="border-t border-border w-full h-0" />
                </div>

                {/* The Zero Baseline */}
                <div 
                  className="absolute w-full border-t border-muted-foreground/40 z-10 flex items-center"
                  style={{ top: `${zeroLinePercent}%` }}
                >
                  <span className="absolute -left-1 -top-2.5 text-[10px] font-mono text-muted-foreground bg-surface/80 px-1">₹0</span>
                </div>

                {/* Fixed Linear Bars */}
                {chartData.map((item, index) => {
                  const isProfit = item.rawEarnings >= 0;
                  const heightPercent = (Math.abs(item.rawEarnings) / range) * 100;
                  
                  return (
                    <div key={item.id || index} className="relative flex-1 flex flex-col items-center h-full group z-20">
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-elevated border border-border shadow-lg rounded px-2 py-1 pointer-events-none z-30 whitespace-nowrap flex flex-col items-center">
                        <span className={cn("text-xs font-mono font-bold", isProfit ? "text-success" : "text-destructive")}>
                          {isProfit ? "+" : ""}{formatINR(item.rawEarnings)}
                        </span>
                        <span className="text-[9px] text-muted-foreground">{item.date}</span>
                      </div>

                      {/* Constrained widths + hover magnetism */}
                      {isProfit ? (
                        <div 
                          className="absolute w-3/4 max-w-[48px] bg-success/80 rounded-t-md border-x border-t border-success shadow-[0_0_8px_rgba(34,197,94,0.2)] transition-all duration-300 group-hover:bg-success group-hover:scale-105 group-hover:-translate-y-1"
                          style={{
                            bottom: `${100 - zeroLinePercent}%`,
                            height: `${Math.max(heightPercent, 2)}%` 
                          }}
                        />
                      ) : (
                        <div 
                          className="absolute w-3/4 max-w-[48px] bg-destructive/80 rounded-b-md border-x border-b border-destructive shadow-[0_0_8px_rgba(255,70,85,0.2)] transition-all duration-300 group-hover:bg-destructive group-hover:scale-105 group-hover:translate-y-1"
                          style={{
                            top: `${zeroLinePercent}%`,
                            height: `${Math.max(heightPercent, 2)}%` 
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="p-5 border-b border-border">
            <h2 className="font-display text-xl font-bold">Match History</h2>
          </div>
          
          {history.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No contest performance entries found in match logs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground bg-surface/50 border-b border-border">
                    <th className="text-left p-4">Format</th>
                    <th className="text-left p-4">Entry Stake</th>
                    <th className="text-left p-4">Result Status</th>
                    <th className="text-right p-4">Net Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((m) => (
                    <tr key={m.id} className="border-b last:border-0 border-border/60 hover:bg-surface/50 transition-all duration-300 hover:pl-2">
                      <td className="p-4 transition-all">
                        <div className="font-semibold text-foreground">{m.matchType}</div>
                        <div className="text-xs text-muted-foreground">{m.date}</div>
                      </td>
                      <td className="p-4 font-mono font-medium text-muted-foreground">{formatINR(m.stake)}</td>
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          m.result === "WIN" 
                            ? "bg-success/10 text-success border-success/30 shadow-[0_0_8px_rgba(34,197,94,0.1)]" 
                            : "bg-destructive/10 text-destructive border-destructive/30"
                        )}>
                          {m.result}
                        </span>
                      </td>
                      <td className={cn(
                        "p-4 text-right font-mono font-bold text-base",
                        m.rawEarnings >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {m.rawEarnings >= 0 ? "+" : ""}{formatINR(m.rawEarnings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      </div>
    </AppShell>
  );
}