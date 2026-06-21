import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Swords, Users, Globe2, AlertCircle, Trophy, Medal } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/challenges/create")({
  head: () => ({
    meta: [{ title: "Host Tournament · Kabaoo" }],
  }),
  component: CreateChallenge,
});

const TOURNAMENT_FORMATS = [
  { id: "1v1", name: "1v1 Duel", players: 2, type: "winner-takes-all", desc: "Winner takes 100%" },
  { id: "2v2", name: "2v2 Tag Team", players: 4, type: "team", desc: "Winning team splits pot (50% each)" },
  { id: "5v5", name: "5v5 Standard", players: 10, type: "team", desc: "Winning team splits pot (20% each)" },
  { id: "ffa", name: "10-Player Deathmatch", players: 10, type: "tiered", desc: "1st: 60% · 2nd: 30% · 3rd: 10%" }
];

const GAME_MODES = [
  "Standard (First to 13)",
  "Swiftplay (First to 5)",
  "Deathmatch",
  "Team Deathmatch",
  "Escalation"
];

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

function CreateChallenge() {
  const navigate = useNavigate();
  const [fee, setFee] = useState<number | "">(500);
  const [format, setFormat] = useState(TOURNAMENT_FORMATS[0]);
  const [gameMode, setGameMode] = useState(GAME_MODES[0]);
  const [description, setDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const currentFee = typeof fee === "number" ? fee : 0;
  const prizePool = currentFee * format.players;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentFee <= 0) return;
    
    setLoading(true);
    setErrorMsg("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to create a tournament.");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      const feeInPaise = currentFee * 100;

      if (!profile || profile.balance < feeInPaise) {
        throw new Error(`Insufficient funds for this entry fee. You need at least ${formatINR(currentFee)}.`);
      }

      const prizePoolInPaise = prizePool * 100;
      
      // 1. Create the match itself
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
          creator_id: user.id,
          type: "public",
          tournament_format: format.id,
          max_players: format.players,
          current_players: 1,
          game_mode: gameMode,
          entry_fee: feeInPaise,
          prize_pool: prizePoolInPaise,
          description: description || null,
          status: "waiting" 
        })
        .select("id")
        .single();

      if (matchError || !match) {
        throw new Error("Failed to secure tournament lobby. Please try again.");
      }

      // 2. Deduct the host's own entry fee immediately
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ balance: profile.balance - feeInPaise })
        .eq("id", user.id);

      if (balanceError) {
        throw new Error("Failed to process your entry fee.");
      }

      // 3. Add the host as the first participant
      const { error: participantError } = await supabase
        .from("participants")
        .insert({
          match_id: match.id,
          user_id: user.id,
          team_number: 1,
          paid: true,
        });

      if (participantError) {
        throw new Error("Failed to register you in the tournament.");
      }

      navigate({ to: "/match/$id", params: { id: match.id } });

    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected server error occurred.");
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Host Tournament</h1>
          <p className="text-muted-foreground text-sm mt-1">Set the bracket format. Secure your entry fee. Open the lobby.</p>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-card)] space-y-8 flex flex-col">
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Label>Match Privacy</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button type="button" className="rounded-lg border border-primary bg-primary/10 p-3 text-left transition-all duration-300 cursor-default shadow-[var(--shadow-glow)] card-lift">
                  <Globe2 className="size-4 text-primary mb-1" />
                  <div className="font-display font-bold text-sm">Public Bracket</div>
                </button>
                <button type="button" onClick={() => navigate({ to: "/challenges/friend" })} className="rounded-lg border border-border p-3 text-left transition-all duration-300 hover:border-primary/40 group card-lift">
                  <Users className="size-4 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                  <div className="font-display font-bold text-sm">Private Code</div>
                </button>
              </div>
            </div>

            <div>
              <Label className="block mb-2">Game & Rule Mode</Label>
              <select 
                value={gameMode} 
                onChange={(e) => setGameMode(e.target.value)}
                className="w-full h-12 rounded-md border border-border bg-surface px-3 text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
              >
                {GAME_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
              </select>
            </div>
          </div>

          <div className="h-px w-full bg-border/50" />

          <div>
            <Label className="text-base font-bold font-display">Bracket Format</Label>
            <p className="text-xs text-muted-foreground mb-3 mt-1">Select how many players will compete and how the prize pool is distributed.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOURNAMENT_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={cn(
                    "rounded-md border p-4 text-left transition-all duration-300 flex flex-col gap-1 card-lift",
                    format.id === f.id
                      ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)] scale-[1.02]"
                      : "border-border hover:border-primary/40 hover:bg-accent/30",
                  )}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={cn("font-display font-bold transition-colors", format.id === f.id ? "text-primary" : "text-foreground")}>{f.name}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-background border border-border">{f.players} Players</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="fee" className="text-base font-bold font-display block mb-3">Individual Entry Fee (₹)</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[100, 250, 500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFee(amt)}
                  className={cn(
                    "rounded-md border py-2 text-sm font-mono font-semibold transition-all duration-300 card-lift",
                    fee === amt ? "border-primary bg-primary/10 text-primary scale-[1.02]" : "border-border hover:border-primary/40 hover:bg-accent/30",
                  )}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <Input
              id="fee"
              type="number"
              placeholder="Custom entry fee"
              value={fee}
              onChange={(e) => setFee(e.target.value ? Number(e.target.value) : "")}
              className="mt-3 font-mono max-w-xs transition-all focus-visible:border-primary"
            />
          </div>

          <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 shadow-[var(--shadow-glow)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Total Gross Prize Pool</div>
                <div className="font-display text-4xl font-bold text-gradient-primary">{formatINR(prizePool)}</div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">{format.players} players × {formatINR(currentFee)} entry fee</div>
              </div>

              <div className="bg-background/60 backdrop-blur rounded border border-primary/20 p-4 min-w-[200px]">
                <div className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Payout Distribution</div>
                
                {format.type === "winner-takes-all" && (
                  <div className="flex justify-between text-sm font-bold">
                    <span className="flex items-center gap-1"><Trophy className="size-3 text-warning"/> 1st Place</span>
                    <span>{formatINR(prizePool)}</span>
                  </div>
                )}

                {format.type === "team" && (
                  <div className="flex justify-between text-sm font-bold">
                    <span className="flex items-center gap-1"><Users className="size-3 text-warning"/> Winning Team</span>
                    <span>{formatINR(prizePool)} <span className="text-[10px] text-muted-foreground font-normal border border-border px-1 rounded">Split equally</span></span>
                  </div>
                )}

                {format.type === "tiered" && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="flex items-center gap-1"><Trophy className="size-3 text-warning"/> 1st (60%)</span>
                      <span className="text-success">{formatINR(prizePool * 0.6)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1"><Medal className="size-3"/> 2nd (30%)</span>
                      <span>{formatINR(prizePool * 0.3)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1"><Medal className="size-3"/> 3rd (10%)</span>
                      <span>{formatINR(prizePool * 0.1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="desc">Tournament Rules (Optional)</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Map is Ascent, Vandal/Phantom only. Official rules apply."
              className="mt-1.5 transition-all focus-visible:border-primary"
              rows={2}
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              size="lg" 
              disabled={loading}
              className="w-full gap-2 font-semibold shadow-[var(--shadow-glow)] h-12 text-lg card-lift transition-all duration-300"
            >
              <Swords className="size-5" /> 
              {loading ? "Securing Escrow & Opening Lobby..." : "Submit Entry Fee & Open Bracket"}
            </Button>

            {errorMsg && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary font-semibold text-center">
                <AlertCircle className="size-4 shrink-0" />
                {errorMsg}
              </div>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}