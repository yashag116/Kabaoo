import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Swords, Coins, AlertTriangle, Ban, CheckCircle2, Loader2, Database } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Kabaoo" },
      { name: "description", content: "Admin dashboard for managing users, challenges, transactions, and disputes." },
    ],
  }),
  component: AdminPage,
});

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChallenges: 0,
    revenue: 0,
    disputes: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [disputedMatches, setDisputedMatches] = useState<any[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        // Fetch profiles, matches, AND the new participants table
        const [profilesRes, matchesRes, participantsRes] = await Promise.all([
          supabase.from("profiles").select("*"),
          supabase.from("matches").select("*"),
          supabase.from("participants").select("*")
        ]);

        const allProfiles = profilesRes.data || [];
        const allMatches = matchesRes.data || [];
        const allParticipants = participantsRes.data || [];

        // 1. Calculate Top Dashboard Stats
        const activeMatches = allMatches.filter(m => m.status === "waiting" || m.status === "in_progress");
        const completedMatches = allMatches.filter(m => m.status === "completed");
        const disputes = allMatches.filter(m => m.status === "disputed");

        // Platform Revenue (5% of all completed prize pools)
        const totalPrizePoolsPaise = completedMatches.reduce((acc, m) => acc + m.prize_pool, 0);
        const theoreticalRevenue = (totalPrizePoolsPaise / 100) * 0.05;

        setStats({
          totalUsers: allProfiles.length,
          activeChallenges: activeMatches.length,
          revenue: theoreticalRevenue,
          disputes: disputes.length,
        });

        // 2. Map exact PnL and Win/Loss data from the participants table
        const userStatsMap: Record<string, { wins: number, losses: number, earnings: number }> = {};
        allProfiles.forEach(p => {
          userStatsMap[p.id] = { wins: 0, losses: 0, earnings: 0 };
        });

        const completedMatchIds = new Set(completedMatches.map(m => m.id));
        const completedMatchMap = new Map(completedMatches.map(m => [m.id, m]));

        allParticipants.forEach(part => {
          if (completedMatchIds.has(part.match_id) && userStatsMap[part.user_id]) {
            const match = completedMatchMap.get(part.match_id)!;
            const entryFee = match.entry_fee / 100;
            const payout = (part.payout_amount || 0) / 100;

            // Placement 1 is a win. Any other recorded placement is a loss.
            if (part.placement === 1) {
              userStatsMap[part.user_id].wins += 1;
            } else if (part.placement && part.placement > 1) {
              userStatsMap[part.user_id].losses += 1;
            }

            // Net earnings = Payout received minus the entry fee paid
            userStatsMap[part.user_id].earnings += (payout - entryFee);
          }
        });

        // 3. Combine stats with the user profile for the table
        const enrichedUsers = allProfiles.map(p => ({
          ...p,
          wins: userStatsMap[p.id]?.wins || 0,
          losses: userStatsMap[p.id]?.losses || 0,
          earnings: userStatsMap[p.id]?.earnings || 0,
        })).sort((a, b) => b.earnings - a.earnings); // Sort by top earners

        setUsers(enrichedUsers);
        setDisputedMatches(disputes);

      } catch (err) {
        console.error("Admin Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">Decrypting Admin Secure Vault...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold flex items-center gap-2">
            <Database className="size-4" /> Admin God-Mode
          </div>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold">Platform Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Operations, integrity, and revenue synced directly with Supabase.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Registered Users" value={stats.totalUsers.toLocaleString()} icon={Users} accent />
          <StatCard label="Active / Waiting Lobbies" value={stats.activeChallenges} icon={Swords} />
          <StatCard label="Platform Revenue (5%)" value={formatINR(stats.revenue)} icon={Coins} />
          <StatCard label="Matches in Dispute" value={stats.disputes} icon={AlertTriangle} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-card shadow-[var(--shadow-card)] opacity-70">
            <div className="p-5 border-b border-border">
              <h2 className="font-display text-lg font-bold">Pending Withdrawals</h2>
              <p className="text-xs text-muted-foreground">Requires a 'transactions' database table</p>
            </div>
            <div className="p-8 text-center">
              <Coins className="size-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-semibold">Withdrawal System Pending</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Once we build the 'transactions' table in Supabase, player withdrawal requests will appear here for you to manually approve and pay out.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="p-5 border-b border-border">
              <h2 className="font-display text-lg font-bold">Open Disputes</h2>
              <p className="text-xs text-muted-foreground">Matches that require admin intervention</p>
            </div>
            <div className="divide-y divide-border">
              {disputedMatches.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="size-10 text-success/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold">No active disputes</p>
                  <p className="text-xs text-muted-foreground mt-1">All matches have concluded smoothly.</p>
                </div>
              ) : (
                disputedMatches.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-muted-foreground">{c.id.split('-')[0]}</div>
                      <div className="font-semibold truncate">Match #{c.id.substring(0, 8)}</div>
                      <div className="text-xs text-muted-foreground">Pot: {formatINR(c.prize_pool / 100)}</div>
                    </div>
                    <Button size="sm" variant="outline" className="font-semibold border-warning text-warning hover:bg-warning/10 hover:text-warning">
                      Review Log
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="p-5 border-b border-border">
            <h2 className="font-display text-xl font-bold">Live Users Database</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground bg-surface/50">
                  <th className="text-left p-4">Player / Riot ID</th>
                  <th className="text-left p-4">Current Balance</th>
                  <th className="text-left p-4">Wins / Losses</th>
                  <th className="text-left p-4">Net Earnings</th>
                  <th className="text-left p-4">Account Status</th>
                  <th className="text-right p-4">Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-accent/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.display_name}`} alt="" className="size-8 rounded-md bg-surface-elevated border border-border" />
                        <div>
                          <div className="font-bold">{p.riot_id}#{p.tagline}</div>
                          <div className="text-xs text-muted-foreground">{p.display_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-foreground">
                      {formatINR(p.balance / 100)}
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">
                      {p.wins} / {p.losses}
                    </td>
                    <td className={cn("p-4 font-mono font-bold", p.earnings > 0 ? "text-success" : p.earnings < 0 ? "text-destructive" : "text-muted-foreground")}>
                      {p.earnings > 0 ? `+${formatINR(p.earnings)}` : formatINR(p.earnings)}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-md border border-success/40 bg-success/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-success">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="outline" className="gap-1 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <Ban className="size-3.5" /> Ban
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}