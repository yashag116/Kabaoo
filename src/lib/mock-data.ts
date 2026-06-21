export type MatchResult = "win" | "loss" | "pending";
export type ChallengeStatus = "open" | "matched" | "in_progress" | "completed";
export type TxnStatus = "completed" | "pending" | "failed";
export type TxnType = "deposit" | "withdraw" | "entry" | "winning";

export interface Player {
  id: string;
  username: string;
  riotId: string;
  tagline: string;
  rank: string;
  avatar: string;
  wins: number;
  losses: number;
  earnings: number;
}

export interface Challenge {
  id: string;
  code: string;
  creator: Player;
  opponent?: Player;
  stake: number;
  prizePool: number;
  status: ChallengeStatus;
  type: "public" | "friend";
  description?: string;
  createdAt: string;
}

export interface MatchRecord {
  id: string;
  opponent: string;
  stake: number;
  result: MatchResult;
  date: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TxnType;
  status: TxnStatus;
  date: string;
  note?: string;
}

const RANKS = [
  "Iron 3", "Bronze 2", "Silver 1", "Gold 3", "Platinum 2",
  "Diamond 1", "Ascendant 2", "Immortal 1", "Radiant",
];

const NAMES = [
  "PhantomAce", "NeonStrike", "Zephyr", "Vyper", "Cipher",
  "Reyna99", "JettBlade", "OmenLord", "KillJoyQT", "Sage_main",
  "ChamberShot", "BreachKing", "FadeAway", "Skyeward", "RazeUp",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makePlayer(i: number): Player {
  const wins = 20 + ((i * 13) % 180);
  const losses = 10 + ((i * 7) % 120);
  return {
    id: `u_${i}`,
    username: NAMES[i % NAMES.length] + (i > NAMES.length - 1 ? i : ""),
    riotId: NAMES[i % NAMES.length],
    tagline: String(1000 + i * 37).slice(-4),
    rank: RANKS[(i * 3) % RANKS.length],
    avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${NAMES[i % NAMES.length]}${i}`,
    wins,
    losses,
    earnings: wins * (50 + (i % 7) * 25),
  };
}

export const PLAYERS: Player[] = Array.from({ length: 30 }, (_, i) => makePlayer(i));

export const CURRENT_USER: Player = {
  id: "u_me",
  username: "ClutchKing",
  riotId: "ClutchKing",
  tagline: "1337",
  rank: "Diamond 2",
  avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ClutchKing",
  wins: 47,
  losses: 23,
  earnings: 18450,
};

export const WALLET_BALANCE = 4250;

export const RECENT_MATCHES: MatchRecord[] = Array.from({ length: 12 }, (_, i) => ({
  id: `m_${i}`,
  opponent: PLAYERS[i].username,
  stake: [100, 250, 500, 1000, 2000][i % 5],
  result: (["win", "loss", "win", "win", "loss", "pending"] as MatchResult[])[i % 6],
  date: new Date(Date.now() - i * 86400000 * 1.3).toISOString(),
}));

export const TRANSACTIONS: Transaction[] = [
  { id: "t1", amount: 1000, type: "deposit", status: "completed", date: new Date(Date.now() - 86400000).toISOString() },
  { id: "t2", amount: 500, type: "entry", status: "completed", date: new Date(Date.now() - 2 * 86400000).toISOString(), note: "Match vs PhantomAce" },
  { id: "t3", amount: 950, type: "winning", status: "completed", date: new Date(Date.now() - 2 * 86400000).toISOString(), note: "Won match" },
  { id: "t4", amount: 2000, type: "withdraw", status: "pending", date: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "t5", amount: 250, type: "entry", status: "completed", date: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "t6", amount: 5000, type: "deposit", status: "completed", date: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: "t7", amount: 1500, type: "withdraw", status: "failed", date: new Date(Date.now() - 8 * 86400000).toISOString() },
];

export const PUBLIC_CHALLENGES: Challenge[] = PLAYERS.slice(0, 10).map((p, i) => ({
  id: `c_${i}`,
  code: `CLUTCH-${(1000 + i * 73).toString(36).toUpperCase()}`,
  creator: p,
  stake: [100, 250, 500, 1000, 2000, 5000][i % 6],
  prizePool: [180, 450, 900, 1800, 3600, 9000][i % 6],
  status: "open",
  type: "public",
  description: ["First to 13", "Bo3 deathmatch", "Pistol only", "Best of 1"][i % 4],
  createdAt: new Date(Date.now() - i * 600000).toISOString(),
}));

export const LEADERBOARD = [CURRENT_USER, ...PLAYERS]
  .map((p) => ({
    ...p,
    winRate: Math.round((p.wins / Math.max(1, p.wins + p.losses)) * 100),
  }))
  .sort((a, b) => b.earnings - a.earnings);

export const PLATFORM_STATS = {
  totalPlayers: 28473,
  prizeMoney: 12_840_000,
  matchesCompleted: 94221,
  activeChallenges: 312,
};

export const EARNINGS_SERIES = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  earnings: 400 + Math.round(Math.sin(i / 1.7) * 800 + i * 220 + Math.random() * 300),
}));

export function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
