import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/supabase";
import { Loader2, ShieldAlert, UserPlus, Swords, AlertCircle, CheckCircle2, Crown, Trophy, Medal, Copy, Users, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/match/$id")({
  component: MatchLobby,
});

const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

function MatchLobby() {
  const { id } = Route.useParams();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const loadMatch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", id)
        .single();

      if (matchError || !matchData) {
        setActionError("Match not found or has been cancelled.");
        setLoading(false);
        return;
      }
      setMatch(matchData);

      const { data: participantsData } = await supabase
        .from("participants")
        .select("*, profile:profiles(id, riot_id, tagline, display_name)")
        .eq("match_id", id)
        .order("joined_at", { ascending: true });

      setParticipants(participantsData || []);
      setLoading(false);
    } catch (err) {
      setActionError("Error loading match data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatch();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPartyCode = () => {
    if (!match?.party_code) return;
    navigator.clipboard.writeText(match.party_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleJoinMatch = async () => {
    if (!currentUser || actionLoading) return;

    setActionLoading(true);
    setActionError("");

    try {
      const { error } = await supabase.rpc('join_match', {
        target_match_id: match.id
      });

      if (error) throw new Error(error.message);

      setToastMsg(`Registration confirmed! ${formatINR(match.entry_fee / 100)} entry fee submitted.`);
      setTimeout(() => window.location.reload(), 1500);

    } catch (err: any) {
      setActionError(err.message || "A server error occurred while registering.");
      setActionLoading(false);
    }
  };

  const handleDeclarePlacement = async (userId: string, placement: number, name: string) => {
    if (!confirm(`Declare ${name} as #${placement}? This will affect prize distribution.`)) return;

    setActionLoading(true);
    setActionError("");

    try {
      const { data, error } = await supabase.functions.invoke('referee', {
        body: { match_id: match.id, developer_override_placement: { user_id: userId, placement } }
      });

      if (error || !data.success) throw new Error(data?.message || "Referee rejected the request.");

      setToastMsg(`Placement recorded: ${name} is #${placement}.`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setActionError(err.message || "Error resolving placement.");
      setActionLoading(false);
    }
  };

  const finalizeMatch = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const { data, error } = await supabase.functions.invoke('referee', {
        body: { match_id: match.id, finalize: true }
      });
      if (error || !data.success) throw new Error(data?.message || "Failed to finalize match.");
      setToastMsg("Tournament concluded! Prizes distributed.");
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setActionError(err.message || "Error finalizing match.");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">Loading Tournament Lobby...</p>
        </div>
      </AppShell>
    );
  }

  if (match?.status === "cancelled") {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center flex-col gap-4 text-center">
          <ShieldAlert className="size-12 text-destructive opacity-80" />
          <h2 className="font-display text-2xl font-bold">Bracket Cancelled</h2>
          <p className="text-muted-foreground">This lobby is no longer active.</p>
        </div>
      </AppShell>
    );
  }

  const isJoined = participants.some((p) => p.user_id === currentUser?.id);
  const myTeam = participants.find((p) => p.user_id === currentUser?.id)?.team_number;
  const isFull = match && participants.length >= match.max_players;
  
  const isTeamFormat = match?.tournament_format === '2v2' || match?.tournament_format === '5v5';
  const isDuelFormat = match?.tournament_format === '1v1';
  const isFFAFormat = match?.tournament_format === 'ffa';

  const team1 = participants.filter(p => p.team_number === 1);
  const team2 = participants.filter(p => p.team_number === 2);
  const teamSize = match ? match.max_players / 2 : 0;
  
  const isTeam1Full = team1.length >= teamSize;
  const isTeam2Full = team2.length >= teamSize;
  const placedParticipants = participants.filter((p) => p.placement);

  const isMatchReady = isDuelFormat 
    ? participants.length === 2 
    : isFFAFormat 
      ? isFull 
      : isTeam1Full && isTeam2Full;

  const renderActionPanel = () => {
    if (match.status === 'completed' || (isTeam1Full && isTeam2Full)) return null;

    return (
      <div className="mt-6 rounded-lg border border-primary/50 bg-card p-8 text-center shadow-[var(--shadow-glow)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 transition-all duration-300 hover:border-primary/80">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/10 blur-3xl" />
        
        <div className="relative">
          {!isTeam1Full && (
            <>
              <Users className="size-10 text-primary mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
              <h2 className="font-display text-2xl font-bold mb-2">Host Squad is Building</h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                {myTeam === 1 
                  ? "Invite your teammates to fill the roster. The bracket will not go public until your squad is full." 
                  : "This squad is currently looking for teammates to fill their roster."}
              </p>
              {myTeam === 1 ? (
                <Button onClick={handleCopy} variant="outline" className="gap-2 bg-background/50 backdrop-blur card-lift">
                  {copied ? <CheckCircle2 className="size-4 text-success" /> : <Copy className="size-4" />}
                  {copied ? "Invite Link Copied!" : "Copy Squad Invite Link"}
                </Button>
              ) : !isJoined && (
                <Button onClick={handleJoinMatch} disabled={actionLoading} size="lg" className="gap-2 font-bold shadow-[var(--shadow-glow)] card-lift">
                  {actionLoading ? <Loader2 className="size-5 animate-spin" /> : `Pay & Join Host Squad (${formatINR(match.entry_fee / 100)})`}
                </Button>
              )}
            </>
          )}

          {isTeam1Full && team2.length === 0 && (
            <>
              <Swords className="size-10 text-primary mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
              <h2 className="font-display text-2xl font-bold mb-2">Squad Ready for Battle</h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                {myTeam === 1 
                  ? "Your squad is fully locked in. Waiting for an opposing squad to accept the challenge..." 
                  : "Gather your squad and accept this challenge to battle for the prize pool."}
              </p>
              {myTeam !== 1 && !isJoined && (
                <Button onClick={handleJoinMatch} disabled={actionLoading} size="lg" className="gap-2 font-bold shadow-[var(--shadow-glow)] card-lift">
                  {actionLoading ? <Loader2 className="size-5 animate-spin" /> : `Accept Challenge & Build Squad (${formatINR(match.entry_fee / 100)})`}
                </Button>
              )}
            </>
          )}

          {isTeam1Full && team2.length > 0 && !isTeam2Full && (
            <>
              <Users className="size-10 text-primary mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
              <h2 className="font-display text-2xl font-bold mb-2">Challenger Squad is Building</h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                {myTeam === 2 
                  ? "Challenge accepted! Invite your teammates to fill your roster so the match can begin." 
                  : myTeam === 1 
                    ? "A challenger has appeared! They are currently inviting their teammates to fill out their roster."
                    : "This squad is finalizing their roster to face the hosts."}
              </p>
              {myTeam === 2 ? (
                <Button onClick={handleCopy} variant="outline" className="gap-2 bg-background/50 backdrop-blur card-lift">
                  {copied ? <CheckCircle2 className="size-4 text-success" /> : <Copy className="size-4" />}
                  {copied ? "Invite Link Copied!" : "Copy Challenger Invite Link"}
                </Button>
              ) : !isJoined && (
                <Button onClick={handleJoinMatch} disabled={actionLoading} size="lg" className="gap-2 font-bold shadow-[var(--shadow-glow)] card-lift">
                  {actionLoading ? <Loader2 className="size-5 animate-spin" /> : `Pay & Join Challenger Squad (${formatINR(match.entry_fee / 100)})`}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 relative">

        <div className="flex items-center text-xs font-mono uppercase tracking-widest text-muted-foreground gap-2">
          <span>{match.type === "friend" ? "Private Bracket" : "Public Bracket"}</span>
          <span>·</span>
          <span className="text-primary">{match.game_mode} ({match.tournament_format})</span>
          <span>·</span>
          <span>{participants.length}/{match.max_players} players</span>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 shadow-[var(--shadow-card)] relative overflow-hidden transition-all duration-300 hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          {match.status === 'completed' && (
            <div className="absolute top-0 inset-x-0 bg-success/20 border-b border-success/30 py-2 text-center text-success font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 z-10 shadow-[0_4px_12px_rgba(34,197,94,0.1)]">
              <Crown className="size-4" /> Tournament Concluded
            </div>
          )}

          {/* 1. TEAM FORMAT RENDER (2v2, 5v5) */}
          {isTeamFormat && (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 relative ${match.status === 'completed' ? 'pt-8' : ''}`}>
              {[1, 2].map((teamNum) => {
                const teamPlayers = participants.filter((p) => p.team_number === teamNum);
                const emptySlots = teamSize - teamPlayers.length;
                
                return (
                  <div key={teamNum} className="rounded-lg border border-border/50 bg-surface/30 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-surface/50">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-center">
                      {teamNum === 1 ? "Host Squad" : "Challenger Squad"}
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                      {teamPlayers.map((p) => (
                        <div key={p.id} className="flex flex-col items-center gap-1.5 group transition-all duration-300 hover:-translate-y-1">
                          <div className={`size-14 rounded-lg border-2 bg-surface flex items-center justify-center shadow-[var(--shadow-glow)] transition-colors duration-300 ${p.placement === 1 ? 'border-success' : 'border-primary/50 group-hover:border-primary'}`}>
                            <div className="font-display text-lg font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                              {p.profile?.riot_id?.charAt(0).toUpperCase() || "P"}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-display text-xs font-bold truncate max-w-[70px] transition-colors duration-300 group-hover:text-primary">{p.profile?.riot_id}</div>
                            {p.placement === 1 && <div className="text-success font-bold text-[10px] mt-0.5 flex justify-center items-center gap-0.5"><Trophy className="size-2.5"/> Won</div>}
                          </div>
                        </div>
                      ))}
                      {Array.from({ length: Math.max(0, emptySlots) }).map((_, i) => (
                        <div key={`empty-${teamNum}-${i}`} className="flex flex-col items-center gap-1.5 group transition-all duration-300 hover:-translate-y-1">
                          <div className="size-14 rounded-lg border-2 border-dashed border-border bg-surface/50 flex items-center justify-center transition-colors duration-300 group-hover:border-primary/50 group-hover:bg-primary/5">
                            <UserPlus className="size-5 text-muted-foreground/50 transition-colors duration-300 group-hover:text-primary/70" />
                          </div>
                          <div className="text-[10px] text-muted-foreground text-center transition-colors duration-300 group-hover:text-foreground">Open</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. 1V1 DUEL FORMAT RENDER */}
          {isDuelFormat && (
            <div className={`relative flex items-center justify-center gap-8 md:gap-16 py-8 ${match.status === 'completed' ? 'pt-12' : ''}`}>
              
              {/* Player 1 (Host) */}
              <div className="flex flex-col items-center gap-3 group transition-all duration-300 hover:-translate-y-1 z-10">
                <div className={`size-20 md:size-24 rounded-2xl border-2 bg-surface flex items-center justify-center shadow-[var(--shadow-glow)] transition-colors duration-300 ${participants[0]?.placement === 1 ? 'border-success' : 'border-primary/50 group-hover:border-primary'}`}>
                  <div className="font-display text-3xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                    {participants[0]?.profile?.riot_id?.charAt(0).toUpperCase() || "P"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-display text-base font-bold truncate max-w-[120px] transition-colors duration-300 group-hover:text-primary">
                    {participants[0]?.profile?.riot_id}
                  </div>
                  {participants[0]?.placement === 1 && <div className="text-success font-bold text-xs mt-1 flex justify-center items-center gap-1"><Trophy className="size-3"/> Winner</div>}
                </div>
              </div>

              {/* VS Badge */}
              <div className="flex flex-col items-center justify-center z-0">
                 <div className="size-12 rounded-full border border-border/50 bg-surface-elevated/80 backdrop-blur flex items-center justify-center text-muted-foreground font-display font-bold italic shadow-inner">
                   VS
                 </div>
              </div>

              {/* Player 2 (Challenger or Open Slot) */}
              {participants[1] ? (
                <div className="flex flex-col items-center gap-3 group transition-all duration-300 hover:-translate-y-1 z-10">
                  <div className={`size-20 md:size-24 rounded-2xl border-2 bg-surface flex items-center justify-center shadow-[var(--shadow-glow)] transition-colors duration-300 ${participants[1].placement === 1 ? 'border-success' : 'border-primary/50 group-hover:border-primary'}`}>
                    <div className="font-display text-3xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                      {participants[1].profile?.riot_id?.charAt(0).toUpperCase() || "P"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-base font-bold truncate max-w-[120px] transition-colors duration-300 group-hover:text-primary">
                      {participants[1].profile?.riot_id}
                    </div>
                    {participants[1].placement === 1 && <div className="text-success font-bold text-xs mt-1 flex justify-center items-center gap-1"><Trophy className="size-3"/> Winner</div>}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 group transition-all duration-300 hover:-translate-y-1 z-10 cursor-default">
                  <div className="size-20 md:size-24 rounded-2xl border-2 border-dashed border-border bg-surface/50 flex items-center justify-center transition-colors duration-300 group-hover:border-primary/50 group-hover:bg-primary/5">
                    <UserPlus className="size-8 text-muted-foreground/50 transition-colors duration-300 group-hover:text-primary/70" />
                  </div>
                  <div className="text-center">
                    <div className="font-display text-base font-bold text-muted-foreground transition-colors duration-300 group-hover:text-foreground">Open slot</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. FFA FORMAT RENDER (Deathmatch) */}
          {isFFAFormat && (
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative ${match.status === 'completed' ? 'pt-8' : ''}`}>
              {participants.map((p) => {
                const placement = p.placement;
                const borderColor = placement === 1 ? 'border-success' : placement === 2 ? 'border-warning' : placement === 3 ? 'border-amber-600' : 'border-primary/50';
                return (
                  <div key={p.id} className="flex flex-col items-center gap-2 group transition-all duration-300 hover:-translate-y-1">
                    <div className={`size-16 rounded-xl border-2 bg-surface flex items-center justify-center shadow-[var(--shadow-glow)] transition-colors duration-300 ${borderColor} group-hover:border-primary`}>
                      <div className="font-display text-xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                        {p.profile?.riot_id?.charAt(0).toUpperCase() || "P"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-display text-sm font-bold truncate max-w-[100px] transition-colors duration-300 group-hover:text-primary">{p.profile?.riot_id}</div>
                      {placement === 1 && <div className="text-success font-bold text-xs mt-1 flex justify-center items-center gap-1"><Trophy className="size-3"/> 1st</div>}
                      {placement === 2 && <div className="text-warning font-bold text-xs mt-1 flex justify-center items-center gap-1"><Medal className="size-3"/> 2nd</div>}
                      {placement === 3 && <div className="text-amber-600 font-bold text-xs mt-1 flex justify-center items-center gap-1"><Medal className="size-3"/> 3rd</div>}
                    </div>
                  </div>
                );
              })}

              {!isFull && Array.from({ length: match.max_players - participants.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex flex-col items-center gap-2 group transition-all duration-300 hover:-translate-y-1">
                  <div className="size-16 rounded-xl border-2 border-dashed border-border bg-surface/50 flex items-center justify-center transition-colors duration-300 group-hover:border-primary/50 group-hover:bg-primary/5">
                    <UserPlus className="size-6 text-muted-foreground/50 transition-colors duration-300 group-hover:text-primary/70" />
                  </div>
                  <div className="text-center">
                    <div className="font-display text-sm font-bold text-muted-foreground transition-colors duration-300 group-hover:text-foreground">Open slot</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Join Button for Non-Team Formats */}
          {!isTeamFormat && !isJoined && !isFull && match.status === "waiting" && (
            <div className="mt-8 flex justify-center">
              <Button onClick={handleJoinMatch} disabled={actionLoading} size="lg" className="font-bold shadow-[var(--shadow-glow)] card-lift transition-all duration-300">
                {actionLoading ? "Securing Entry..." : `Submit Entry Fee (${formatINR(match.entry_fee / 100)})`}
              </Button>
            </div>
          )}

          {/* PARTY CODE REVEAL — once everyone required has joined and paid */}
          {isMatchReady && isJoined && match.party_code && match.status !== 'completed' && (
            <div className="mt-8 rounded-lg border-2 border-primary bg-primary/10 p-6 text-center shadow-[var(--shadow-glow)] animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
                <KeyRound className="size-3.5" /> Valorant Party Code
              </div>
              <div className="font-display text-4xl font-bold tracking-widest text-foreground select-all">
                {match.party_code}
              </div>
              <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto mb-4">
                All players are confirmed and entry fees secured. Join the host's party using this code to begin your match.
              </p>
              <Button onClick={handleCopyPartyCode} variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur card-lift">
                {codeCopied ? <CheckCircle2 className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                {codeCopied ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          )}

          {/* DEVELOPER TOOLS WITH DYNAMIC BUTTONS */}
          {isFull && match.status !== 'completed' && (currentUser?.email === "admin@kabaoo.com" || currentUser?.id === match.creator_id) && (
            <div className="mt-8 p-4 rounded-lg border border-[#eab308]/30 bg-[#eab308]/10 text-center animate-in fade-in slide-in-from-bottom-4 transition-all duration-300 hover:border-[#eab308]/50">
              <p className="text-xs text-[#eab308] mb-3 uppercase tracking-widest font-bold">🛠️ Developer Override: Assign Placements</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {participants.map((p) => {
                  const places = match.tournament_format === 'ffa' ? [1, 2, 3] : [1];
                  return (
                    <div key={p.id} className="flex gap-1 items-center border border-border rounded-md p-1 bg-background/50">
                      <span className="text-xs px-2 font-semibold">{p.profile?.riot_id}</span>
                      {places.map((place) => (
                        <Button
                          key={place}
                          size="sm"
                          variant="outline"
                          disabled={actionLoading}
                          onClick={() => handleDeclarePlacement(p.user_id, place, p.profile?.riot_id)}
                          className="h-7 px-2 text-xs border-[#eab308]/50 hover:bg-[#eab308] hover:text-[#422006] transition-all duration-300"
                        >
                          {match.tournament_format === 'ffa' ? `#${place}` : "Crown Winner"}
                        </Button>
                      ))}
                    </div>
                  );
                })}
              </div>
              {placedParticipants.length > 0 && (
                <Button onClick={finalizeMatch} disabled={actionLoading} className="mt-4 font-bold bg-[#eab308] text-[#422006] hover:bg-[#eab308]/80 card-lift transition-all duration-300">
                  <CheckCircle2 className="size-4 mr-2" /> Force Conclude & Distribute Prizes
                </Button>
              )}
            </div>
          )}

          {actionError && (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary font-semibold text-center">
              <AlertCircle className="size-4 shrink-0" />
              {actionError}
            </div>
          )}
        </div>

        {isTeamFormat && renderActionPanel()}

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-surface p-5 opacity-80 card-lift transition-all duration-300 hover:border-primary/30">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              Entry Fee (Per Player)
            </div>
            <div className="mt-2 font-mono text-3xl font-bold text-foreground">
              {formatINR(match.entry_fee / 100)}
            </div>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/10 p-5 shadow-[var(--shadow-glow)] card-lift transition-all duration-300 hover:border-primary/50">
            <div className="text-xs uppercase tracking-wider text-primary font-semibold flex items-center gap-2">
              Total Prize Pool
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-gradient-primary">
              {formatINR(match.prize_pool / 100)}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)] card-lift transition-all duration-300 hover:border-primary/30">
          <h3 className="font-display text-lg font-bold mb-6">Tournament Status</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,70,85,0.8)]" />
              <div className="text-sm font-semibold text-foreground">
                {isTeamFormat && !isTeam1Full ? `Building Host Squad · ${team1.length}/${teamSize} filled` : `Lobby open · ${participants.length}/${match.max_players} joined`}
              </div>
            </div>

            <div className={`flex items-center gap-3 transition-opacity duration-300 ${!isFull ? 'opacity-40 grayscale' : ''}`}>
              <div className={`size-2.5 rounded-full transition-colors duration-300 ${isFull ? 'bg-primary shadow-[0_0_8px_rgba(255,70,85,0.8)]' : 'bg-border'}`} />
              <div className={`text-sm transition-colors duration-300 ${isFull ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>Bracket full · All entry fees secured</div>
            </div>

            <div className={`flex items-center gap-3 transition-opacity duration-300 ${match.status !== 'in_progress' && match.status !== 'completed' ? 'opacity-40 grayscale' : ''}`}>
              <div className={`size-2.5 rounded-full transition-colors duration-300 ${match.status === 'in_progress' || match.status === 'completed' ? 'bg-primary shadow-[0_0_8px_rgba(255,70,85,0.8)]' : 'bg-border'}`} />
              <div className={`text-sm transition-colors duration-300 ${match.status === 'in_progress' || match.status === 'completed' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>Match in progress · Riot API tracking live</div>
            </div>

            <div className={`flex items-center gap-3 transition-opacity duration-300 ${match.status !== 'completed' ? 'opacity-40 grayscale' : ''}`}>
              <div className={`size-2.5 rounded-full transition-colors duration-300 ${match.status === 'completed' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-border'}`} />
              <div className={`text-sm transition-colors duration-300 ${match.status === 'completed' ? 'font-semibold text-success' : 'text-muted-foreground'}`}>Results verified · Prizes distributed</div>
            </div>
          </div>
        </div>

      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-3 shadow-[0_0_15px_rgba(34,197,94,0.2)] backdrop-blur-md">
            <CheckCircle2 className="size-5 text-success" />
            <p className="text-sm font-semibold text-success">{toastMsg}</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}