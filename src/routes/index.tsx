import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Swords, Trophy, Users, ScanLine, Wallet, Zap, ShieldCheck, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_STATS, formatINR } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kabaoo — Competitive Esports Tournaments" },
      {
        name: "description",
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

// High-quality placeholder images to prevent black boxes
const SLICES = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1564321522434-66f917537604?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?q=80&w=800&auto=format&fit=crop",
];

function Landing() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111] overflow-x-hidden selection:bg-[#FF4655] selection:text-white">
      
      {/* 
        HERO SECTION 
      */}
      <section className="relative w-full flex flex-col justify-between pt-6">
        
        {/* Tech Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000A_1px,transparent_1px),linear-gradient(to_bottom,#0000000A_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        {/* Subtle Faded Character Background */}
        <div className="absolute right-0 top-0 w-2/3 h-full bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-5 [mask-image:linear-gradient(to_left,black,transparent)] pointer-events-none grayscale" />

        {/* Floating Technical UI Elements */}
        {/* Pinned to the far left to avoid text overlap */}
        <div className="absolute left-2 lg:left-6 top-[40%] -translate-y-1/2 -rotate-90 origin-left text-[11px] font-bold tracking-[0.4em] text-[#FF4655] whitespace-nowrap z-0">
          ► COMPETE. CLIMB. CONQUER.
        </div>
        <div className="absolute top-32 left-[15%] w-2 h-2 bg-[#FF4655]" />
        <div className="absolute top-[60%] left-[45%] w-1.5 h-1.5 bg-black/20" />

        {/* Top Navigation */}
        <header className="relative z-50 w-full max-w-[1500px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between border-b border-black/10">
          <Link to="/" className="flex items-center">
            {/* Logo Size Fixed */}
            <img src="/Kabaoo.png" alt="Kabaoo" className="h-10 md:h-12 object-contain" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-12 text-[11px] font-bold tracking-widest uppercase text-black/70">
            <a href="#how" className="hover:text-[#FF4655] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[#FF4655] transition-colors">Features</a>
            <Link to="/leaderboard" className="hover:text-[#FF4655] transition-colors">Leaderboard</Link>
          </nav>
          
          <div className="flex items-center">
            {user ? (
              <Link to="/dashboard">
                <Button className="rounded-none bg-[#FF4655] hover:bg-[#e03e4b] text-white font-bold uppercase tracking-wider px-8 h-12 text-xs">
                  Go to Dashboard <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="rounded-none bg-[#FF4655] hover:bg-[#e03e4b] text-white font-bold uppercase tracking-wider px-8 h-12 text-xs shadow-[3px_3px_0px_rgba(0,0,0,0.1)] active:translate-y-[2px] active:shadow-none transition-all">
                  Get Started <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between mt-10 lg:mt-16">
          
          {/* Left Text Block */}
          {/* Added pl-12 lg:pl-16 to ensure it never overlaps the vertical side text */}
          <div className="w-full lg:w-[50%] pt-6 pb-16 pl-10 lg:pl-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4655] bg-transparent px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#FF4655] mb-8">
              <Trophy className="size-3" />
              {PLATFORM_STATS.activeChallenges} tournaments open for registration
            </div>
            
            {/* Fixed Overlapping: Explicit blocks & exact line-height (leading-none) */}
            <h1 className="text-[3.5rem] sm:text-[4.5rem] xl:text-[5.5rem] font-display font-black leading-[1.05] tracking-tight text-[#111] uppercase m-0 p-0">
              <span className="block">Competitive</span>
              <span className="block">Esports</span>
              <span className="block text-[#FF4655]">Tournaments</span>
            </h1>
            
            <p className="mt-8 text-sm md:text-base text-gray-600 max-w-md font-medium leading-relaxed">
              Host your own custom tournaments instantly or challenge open player lobbies. Verified results, transparent prize pools, and skill-based competition. Starting with Valorant, expanding to more titles soon.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/challenges/create">
                <Button size="lg" className="bg-[#FF4655] text-white hover:bg-[#e03e4b] h-14 px-10 text-xs font-bold uppercase tracking-widest rounded-none shadow-[4px_4px_0px_rgba(0,0,0,0.08)] active:translate-y-1 active:shadow-none transition-all">
                  <Swords className="size-4 mr-2" /> Host Tournament
                </Button>
              </Link>
              <Link to="/challenges/public">
                <Button size="lg" variant="outline" className="h-14 px-10 text-xs font-bold uppercase tracking-widest rounded-none border-2 border-[#111] text-[#111] hover:bg-[#111] hover:text-white transition-all bg-transparent">
                  Find Opponent <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image Slices (Fixed Parallel Slants & Black Bar Bug) */}
          <div className="w-full lg:w-[50%] flex justify-end h-[400px] sm:h-[450px] xl:h-[550px] mb-12 lg:mb-0">
            <div className="flex gap-2 h-full">
              {SLICES.map((src, i) => (
                <div
                  key={i}
                  className="w-[60px] sm:w-[80px] xl:w-[100px] h-full relative overflow-hidden group hover:w-[140px] xl:hover:w-[180px] transition-all duration-500 ease-in-out cursor-pointer bg-[#111]"
                  style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }}
                >
                  <img
                    src={src}
                    alt={`Agent ${i + 1}`}
                    // Width is 200% with negative margin to ensure image fills slanted container
                    className="absolute inset-0 w-[200%] h-full object-cover object-center grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 -ml-[50%]"
                  />
                  <div className="absolute inset-0 border-l border-white/20" style={{ transform: 'skewX(-15deg)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Trapezoid Stats Bar */}
        <div className="relative w-full z-20 px-4 sm:px-10 mt-8 mb-12">
          <div className="max-w-[1300px] mx-auto relative h-[100px] sm:h-[130px]">
            
            {/* The Red Outline Layer */}
            <div 
              className="absolute inset-0 bg-[#FF4655]" 
              style={{ clipPath: 'polygon(30px 0%, calc(100% - 30px) 0%, 100% 100%, 0% 100%)' }} 
            />
            
            {/* The Black Foreground Layer */}
            <div 
              className="absolute inset-[4px_0_0_0] bg-[#111] flex items-center justify-between px-6 sm:px-16" 
              style={{ clipPath: 'polygon(28px 0%, calc(100% - 28px) 0%, 100% 100%, 0% 100%)' }}
            >
              <div className="flex items-center gap-3 sm:gap-4 text-white">
                <Users className="size-6 sm:size-10 text-[#FF4655]" />
                <div>
                  <div className="font-display text-lg sm:text-3xl font-bold tracking-tight">{PLATFORM_STATS.totalPlayers.toLocaleString()}</div>
                  <div className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5 sm:mt-1">Verified Competitors</div>
                </div>
              </div>

              <div className="hidden md:block w-px h-12 bg-white/10" />

              <div className="hidden sm:flex items-center gap-4 text-white">
                <ScanLine className="size-8 sm:size-10 text-[#FF4655]" />
                <div>
                  <div className="font-display text-xl sm:text-3xl font-bold tracking-tight">{PLATFORM_STATS.matchesCompleted.toLocaleString()}</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">Matches Concluded</div>
                </div>
              </div>

              <div className="hidden lg:block w-px h-12 bg-white/10" />

              <div className="hidden lg:flex items-center gap-4 text-white">
                <Trophy className="size-8 sm:size-10 text-[#FF4655]" />
                <div>
                  <div className="font-display text-xl sm:text-3xl font-bold tracking-tight">{PLATFORM_STATS.activeChallenges}</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">Active Tournaments</div>
                </div>
              </div>

              <div className="hidden xl:block w-px h-12 bg-white/10" />

              <div className="flex items-center gap-3 sm:gap-4 text-white">
                <Wallet className="size-6 sm:size-10 text-[#FF4655]" />
                <div>
                  <div className="font-display text-lg sm:text-3xl font-bold tracking-tight">₹1,28,40,000</div>
                  <div className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5 sm:mt-1">Prize Pools Distributed</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 
        HOW IT WORKS SECTION 
      */}
      <section id="how" className="relative bg-white py-24 border-b border-black/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          
          <div className="flex flex-col items-center text-center mb-16">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#FF4655] font-bold">Process</div>
            <h2 className="mt-2 text-4xl md:text-5xl font-display font-black text-[#111] uppercase">Four steps to the podium</h2>
            <div className="w-12 h-1 bg-[#FF4655] mt-6" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-[#F8F9FA] p-8 border border-black/10 hover:border-[#FF4655] transition-colors relative group">
                <div className="font-mono text-5xl font-bold text-black/5 mb-6 group-hover:text-[#FF4655]/20 transition-colors">{s.n}</div>
                <h3 className="font-display text-xl font-bold uppercase text-[#111] leading-tight mb-3">{s.t}</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">{s.d}</p>
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="size-2 bg-[#FF4655]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        FEATURES SECTION
      */}
      <section id="features" className="relative bg-[#F8F9FA] py-24 border-b border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          
          <div className="flex flex-col items-center text-center mb-16">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#FF4655] font-bold">Features</div>
            <h2 className="mt-2 text-4xl md:text-5xl font-display font-black text-[#111] uppercase">Built for competitors</h2>
            <div className="w-12 h-1 bg-[#FF4655] mt-6" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.t} className="bg-white border border-black/10 p-8 hover:border-[#FF4655] hover:-translate-y-1 transition-all duration-300 group">
                <div className="size-12 bg-[#F8F9FA] border border-black/10 flex items-center justify-center mb-6 group-hover:bg-[#FF4655] group-hover:border-[#FF4655] transition-colors">
                  <f.i className="size-5 text-[#111] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-[#111] leading-tight mb-3">{f.t}</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        BOTTOM BAR CTA
      */}
      <div className="w-full bg-[#F8F9FA] flex flex-col md:flex-row items-center justify-between border-t border-black/10 relative overflow-hidden">
        
        {/* Left Edge Details */}
        <div className="flex items-center gap-4 px-6 lg:px-12 py-6">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-black/20" />
            <div className="w-1 h-4 bg-black/20" />
          </div>
          <div className="text-[11px] font-bold text-[#FF4655] tracking-widest uppercase">
            Coming Soon To More Titles
          </div>
          <div className="hidden sm:flex text-black/20 tracking-widest ml-4">
            / / / / / / /
          </div>
        </div>

        {/* Black Slanted CTA Box */}
        <div 
          className="relative bg-[#111] text-white w-full md:w-[60%] lg:w-[45%] flex items-center justify-end px-6 lg:px-12 py-5"
          style={{ clipPath: 'polygon(50px 0, 100% 0, 100% 100%, 0 100%)' }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 pl-10">
            <div className="text-right sm:text-left">
              <span className="font-bold uppercase tracking-wider text-sm">Ready to compete?</span>
              <span className="text-gray-400 text-xs ml-2 hidden xl:inline">Join tournaments. Prove your skill. Win big.</span>
            </div>
            
            {user ? (
              <Link to="/dashboard">
                <Button className="rounded-none bg-[#FF4655] hover:bg-[#e03e4b] text-white font-bold uppercase tracking-widest px-6 h-10 text-xs shadow-[3px_3px_0px_rgba(255,255,255,0.1)] active:translate-y-[2px] active:shadow-none transition-all">
                  Go to Dashboard <ArrowRight className="size-3.5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="rounded-none bg-[#FF4655] hover:bg-[#e03e4b] text-white font-bold uppercase tracking-widest px-6 h-10 text-xs shadow-[3px_3px_0px_rgba(255,255,255,0.1)] active:translate-y-[2px] active:shadow-none transition-all">
                  Get Started <ArrowRight className="size-3.5 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* Simple Footer */}
      <footer className="bg-white py-6 border-t border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center opacity-50">
            <img src="/Kabaoo.png" alt="Kabaoo" className="h-5 object-contain" />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            © {new Date().getFullYear()} Kabaoo. Play responsibly. 18+.
          </div>
        </div>
      </footer>

    </div>
  );
}