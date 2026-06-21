import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Swords,
  Zap,
  Wallet,
  ShieldCheck,
  Trophy,
  Users,
  ScanLine,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_STATS, formatINR } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kabaoo — Competitive Esports Tournaments" },
      {
        name: "description",
        content:
          "Compete in organized, skill-based esports tournaments. Professional prize pools, secure tournament vault, instant matchmaking.",
      },
      { property: "og:title", content: "Kabaoo — Competitive Esports Tournaments" },
      {
        property: "og:description",
        content:
          "Compete in organized, skill-based esports tournaments. Professional prize pools, secure tournament vault, instant matchmaking.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { n: "01", t: "Host or Join Bracket", d: "Select your entry tier or find an open tournament that matches your skill." },
  { n: "02", t: "Submit Entry Fee", d: "Registration fees are held securely in our tournament vault until the match concludes." },
  { n: "03", t: "Compete in Game", d: "Queue into your custom lobby and play. Our system tracks results automatically." },
  { n: "04", t: "Claim Your Victory", d: "The entire tournament prize pool is distributed straight to the winner's account. Withdraw anytime." },
];

const FEATURES = [
  { i: Zap, t: "Instant Matchmaking", d: "Find an opponent in seconds, not minutes." },
  { i: Users, t: "Private Matches", d: "Generate a secure code and invite your squad to compete for the prize pool." },
  { i: Wallet, t: "Secure Tournament Vault", d: "Bank-grade encryption holds all entry fees safely." },
  { i: ShieldCheck, t: "Fast Withdrawals", d: "Withdraw your prize pools to UPI or bank in minutes." },
  { i: ScanLine, t: "Automatic Result Verification", d: "Live API tracking — no disputes, no waiting." },
  { i: Globe2, t: "Global Leaderboards", d: "Climb the ranks. Earn bragging rights and bonuses." },
];

function Landing() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if the user is currently logged in
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 nav-glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-wider">
            <span className="grid place-items-center h-8 w-8 rounded-md bg-primary text-primary-foreground">
              <Zap className="size-4" />
            </span>
            KABAOO
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <Link to="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
          </nav>
          
          {/* Dynamic Login / Dashboard Button */}
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40 grid-fade" />
        <div className="absolute inset-0 [background:var(--gradient-hero)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-info)]/30 bg-[var(--color-info)]/10 px-3 py-1 text-xs font-medium text-[var(--color-info)] mb-6">
            <Trophy className="size-3" />
            {PLATFORM_STATS.activeChallenges} tournaments open for registration
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
            Competitive Esports <br />
            <span className="text-gradient-primary">Tournaments</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Host your own custom tournaments instantly or challenge open player lobbies. Verified results, transparent prize pools, and skill-based competition. Starting with Valorant, expanding to more titles soon.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/challenges/create">
              <Button size="lg" className="gap-2 font-semibold h-12 px-6 text-base shadow-[var(--shadow-glow)]">
                <Swords className="size-5" /> Host Tournament
              </Button>
            </Link>
            <Link to="/challenges/public">
              <Button size="lg" variant="outline" className="gap-2 font-semibold h-12 px-6 text-base">
                Find Opponent <ArrowRight className="size-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { l: "Verified Competitors", v: PLATFORM_STATS.totalPlayers.toLocaleString() },
            { l: "Matches Concluded", v: PLATFORM_STATS.matchesCompleted.toLocaleString() },
            { l: "Active Tournaments", v: PLATFORM_STATS.activeChallenges },
            { l: "Prize Pools Distributed", v: formatINR(PLATFORM_STATS.prizeMoney) },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient-primary">{s.v}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">How it works</div>
            <h2 className="mt-3 text-3xl md:text-5xl font-display font-bold">Four steps to the podium</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="relative rounded-lg border border-border card-accent bg-card p-6 shadow-[var(--shadow-card)] card-lift"
              >
                <div className="font-display text-5xl font-bold text-primary/30">{s.n}</div>
                <div className="mt-2 font-display text-lg font-bold">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-surface/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Features</div>
            <h2 className="mt-3 text-3xl md:text-5xl font-display font-bold">Built for competitors</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.t}
                className="rounded-lg border border-border card-accent bg-card p-6 card-lift group"
              >
                <div className="grid place-items-center size-11 rounded-md bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <f.i className="size-5" />
                </div>
                <div className="mt-4 font-display text-lg font-bold">{f.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Trophy className="size-12 text-primary mx-auto" />
          <h2 className="mt-4 text-3xl md:text-5xl font-display font-bold">
            Ready to clutch up?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Join thousands of players already competing in premium brackets.
          </p>
          
          {/* Dynamic Bottom CTA Button */}
          {user ? (
            <Link to="/dashboard" className="inline-block mt-8">
              <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-[var(--shadow-glow)]">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/auth" className="inline-block mt-8">
              <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-[var(--shadow-glow)]">
                Create Your Account
              </Button>
            </Link>
          )}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-display font-bold tracking-wider">
            <Zap className="size-4 text-primary" /> KABAOO
          </div>
          <div>© {new Date().getFullYear()} Kabaoo. Play responsibly. 18+.</div>
        </div>
      </footer>
    </div>
  );
}