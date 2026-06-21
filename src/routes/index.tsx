import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Swords, Trophy, Users, ScanLine, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_STATS } from "@/lib/mock-data";
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

const SLICES = [
  "/slice-1.jpg",
  "/slice-2.jpg",
  "/slice-3.jpg",
  "/slice-4.jpg",
  "/slice-5.jpg",
];

function Landing() {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111] overflow-x-hidden selection:bg-[#FF4655] selection:text-white font-sans">
      
      {/* HERO SECTION 
      */}
      <section className="relative w-full flex flex-col justify-between pt-6">

        {/* Tech Grid Background (restored from previous design) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000A_1px,transparent_1px),linear-gradient(to_bottom,#0000000A_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Subtle Faded Character Background */}
        <div className="absolute right-0 top-0 w-2/3 h-full bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-15 [mask-image:linear-gradient(to_left,black_40%,transparent)] pointer-events-none grayscale mix-blend-multiply" />

        {/* Vertical side text (restored from previous design) */}
        <div className="absolute left-2 lg:left-6 top-[40%] -translate-y-1/2 -rotate-90 origin-left text-[11px] font-bold tracking-[0.4em] text-[#FF4655] whitespace-nowrap z-0">
          ► COMPETE. CLIMB. CONQUER.
        </div>

        {/* Small isolated red square accents */}
        <div className="absolute top-32 left-[15%] w-2 h-2 bg-[#FF4655]" />
        <div className="absolute top-[50%] left-[45%] w-2 h-2 bg-[#FF4655]" />
        <div className="absolute top-[80%] right-[10%] w-2 h-2 bg-[#FF4655]" />

        {/* Top Navigation — fixed glass header */}
        <header
          className={cn(
            "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
            scrolled
              ? "bg-white/70 backdrop-blur-xl border-b border-black/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12)]"
              : "bg-white/30 backdrop-blur-md border-b border-white/20"
          )}
        >
          <div className="relative w-full max-w-[1500px] mx-auto px-6 lg:px-12 h-20 lg:h-24 flex items-center justify-between">
            {/* Hairline accent that only shows once scrolled, echoes the red square motif */}
            <div className={cn("absolute left-0 top-0 h-[2px] bg-[#FF4655] transition-all duration-500", scrolled ? "w-full" : "w-0")} />

            <Link to="/" className="flex items-center">
              <img src="/Kabaoo.png" alt="Kabaoo" className="h-12 md:h-14 lg:h-16 object-contain transition-all duration-300" />
            </Link>

            <nav className="hidden md:flex items-center gap-12 text-[11px] font-bold tracking-widest uppercase text-[#111]">
              <a href="#how" className="relative group hover:text-[#FF4655] transition-colors">
                How it works
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#FF4655] transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#features" className="relative group hover:text-[#FF4655] transition-colors">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#FF4655] transition-all duration-300 group-hover:w-full" />
              </a>
              <Link to="/leaderboard" className="relative group hover:text-[#FF4655] transition-colors">
                Leaderboard
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#FF4655] transition-all duration-300 group-hover:w-full" />
              </Link>
            </nav>

            <div className="flex items-center">
              {user ? (
                <Link to="/dashboard">
                  <Button className="rounded-none bg-[#FF4655] hover:bg-[#e03e4b] text-white font-bold uppercase tracking-wider px-8 h-12 text-xs" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                    Go to Dashboard <ArrowRight className="size-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button className="rounded-none bg-[#FF4655] hover:bg-[#e03e4b] text-white font-bold uppercase tracking-wider px-8 h-12 text-xs shadow-none active:translate-y-px transition-transform" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                    Get Started <ArrowRight className="size-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Spacer so hero content doesn't jump under the fixed header */}
        <div className="h-20 lg:h-24" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between mt-16">
          
          {/* Left Text Block */}
          {/* pl-10 lg:pl-16 added so text never overlaps the vertical side text */}
          <div className="w-full lg:w-[50%] pb-16 pl-10 lg:pl-16">
            <div className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#FF4655] mb-10 rounded-none shadow-sm">
              <Trophy className="size-3" />
              {PLATFORM_STATS.activeChallenges} tournaments open for registration
            </div>
            
            <h1 className="text-[3.5rem] sm:text-[5rem] xl:text-[6rem] font-display font-black tracking-tighter text-[#111] uppercase m-0 p-0 leading-none drop-shadow-sm">
              <span className="block mb-3">Competitive</span>
              <span className="block mb-3">Esports</span>
              <span className="block text-[#FF4655]">Tournaments</span>
            </h1>
            
            <p className="mt-8 text-sm md:text-base text-gray-600 max-w-md font-medium leading-relaxed">
              Host your own custom tournaments instantly or challenge open player lobbies. Verified results, transparent prize pools, and skill-based competition.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link to="/challenges/create">
                <Button size="lg" className="bg-[#FF4655] text-white hover:bg-[#e03e4b] h-14 px-10 text-xs font-bold uppercase tracking-widest rounded-none shadow-none active:translate-y-px transition-transform" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                  <Swords className="size-4 mr-2" /> Host Tournament
                </Button>
              </Link>
              <Link to="/challenges/public">
                <Button size="lg" variant="outline" className="h-14 px-10 text-xs font-bold uppercase tracking-widest rounded-none border border-black/20 text-[#111] hover:bg-[#111] hover:text-white hover:border-[#111] transition-all bg-transparent">
                  Find Opponent <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image Slices - CHAMFERED SHAPE */}
          <div className="w-full lg:w-[50%] flex justify-end h-[450px] xl:h-[550px] mb-12 lg:mb-0">
            <div className="flex gap-2 lg:gap-3 h-full">
              {SLICES.map((src, i) => (
                <div
                  key={i}
                  className="w-[70px] sm:w-[90px] xl:w-[110px] h-full relative overflow-hidden group hover:w-[170px] xl:hover:w-[210px] transition-all duration-500 ease-out bg-black/5"
                  // Chamfers top-left and bottom-right corners; angled cuts on the other two corners lean the slice right
                  style={{ clipPath: 'polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)' }}
                >
                  <img
                    src={src}
                    alt={`Hero Slice ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover object-center grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                  />
                  {/* Subtle inner border to crisp up the cut edges */}
                  <div className="absolute inset-0 border-[1.5px] border-black/10 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar - Trapezoid Cuts */}
        <div className="relative w-full z-20 px-4 sm:px-10 mt-8 mb-16 drop-shadow-xl">
          <div className="max-w-[1300px] mx-auto relative h-[120px]">
            <div 
              className="absolute inset-0 bg-[#FF4655]" 
              style={{ clipPath: 'polygon(30px 0%, calc(100% - 30px) 0%, 100% 100%, 0% 100%)' }} 
            />
            <div 
              className="absolute inset-[3px_0_0_0] bg-[#111] flex items-center justify-between px-6 sm:px-16" 
              style={{ clipPath: 'polygon(28px 0%, calc(100% - 28px) 0%, 100% 100%, 0% 100%)' }}
            >
              <div className="flex items-center gap-4 text-white">
                <Users className="size-8 text-[#FF4655]" />
                <div>
                  <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{PLATFORM_STATS.totalPlayers.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">Verified Competitors</div>
                </div>
              </div>

              <div className="hidden md:block w-px h-16 bg-white/10" />

              <div className="hidden sm:flex items-center gap-4 text-white">
                <ScanLine className="size-8 text-[#FF4655]" />
                <div>
                  <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{PLATFORM_STATS.matchesCompleted.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">Matches Concluded</div>
                </div>
              </div>

              <div className="hidden lg:block w-px h-16 bg-white/10" />

              <div className="hidden lg:flex items-center gap-4 text-white">
                <Trophy className="size-8 text-[#FF4655]" />
                <div>
                  <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{PLATFORM_STATS.activeChallenges}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">Active Tournaments</div>
                </div>
              </div>

              <div className="hidden xl:block w-px h-16 bg-white/10" />

              <div className="flex items-center gap-4 text-white">
                <Wallet className="size-8 text-[#FF4655]" />
                <div>
                  <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight">₹1,28,40,000</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">Prize Pools Distributed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how" className="relative bg-white py-32 border-y border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          
          <div className="flex flex-col mb-16">
            <div className="flex items-center gap-3">
               <div className="w-8 h-1 bg-[#FF4655]" />
               <div className="text-[10px] uppercase tracking-[0.2em] text-[#FF4655] font-bold">Process</div>
            </div>
            <h2 className="mt-4 text-5xl font-display font-black text-[#111] uppercase tracking-tighter">Four steps to the podium</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-black/10 bg-[#F8F9FA]">
            {STEPS.map((s, index) => (
              <div key={s.n} className="bg-white p-10 border border-black/10 hover:border-[#FF4655] transition-all duration-500 ease-out relative group min-h-[300px] flex flex-col justify-end hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] hover:z-20">
                <div className="absolute top-4 left-6 font-display text-[8rem] font-black text-[#111] opacity-5 leading-none select-none pointer-events-none transition-all duration-500 ease-out group-hover:-translate-y-4">
                  {s.n}
                </div>
                <div className="absolute top-8 right-8 size-1.5 bg-transparent group-hover:bg-[#FF4655] transition-colors" />
                <div className="relative z-10">
                  <h3 className="font-display text-2xl font-bold uppercase text-[#111] leading-tight mb-4 tracking-tight">{s.t}</h3>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative bg-[#F8F9FA] py-32 border-b border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          
          <div className="flex flex-col mb-16">
            <div className="flex items-center gap-3">
               <div className="w-8 h-1 bg-[#FF4655]" />
               <div className="text-[10px] uppercase tracking-[0.2em] text-[#FF4655] font-bold">Features</div>
            </div>
            <h2 className="mt-4 text-5xl font-display font-black text-[#111] uppercase tracking-tighter">Built for competitors</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-black/10 p-10 hover:border-[#FF4655] transition-all duration-500 ease-out relative group shadow-sm hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)]">
              <div className="absolute top-8 right-8 flex items-center justify-center opacity-20 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:-translate-y-1">
                <div className="size-12 rounded-none border-[1px] border-[#111] flex items-center justify-center">
                  <div className="size-6 rounded-none border-[1px] border-[#111] flex items-center justify-center">
                    <div className="size-1.5 bg-[#FF4655]" />
                  </div>
                </div>
              </div>
              <h3 className="font-display text-2xl font-bold uppercase text-[#111] leading-tight mb-4 mt-16 tracking-tight">Instant Matchmaking</h3>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">Find an opponent in seconds, not minutes. Our API instantly pairs active lobbies.</p>
            </div>

            <div className="bg-white border border-black/10 p-10 hover:border-[#FF4655] transition-all duration-500 ease-out relative group shadow-sm hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)]">
              <div className="absolute top-8 right-8 flex flex-col gap-1.5 opacity-20 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:-translate-y-1">
                 <div className="w-12 h-3 border border-[#111]" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
                 <div className="w-12 h-3 border border-[#111]" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
                 <div className="w-12 h-3 bg-[#FF4655]" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
              </div>
              <h3 className="font-display text-2xl font-bold uppercase text-[#111] leading-tight mb-4 mt-16 tracking-tight">Skill-Based Fair Play</h3>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">Transparent prize pools, fair matchmaking, and verified results for every participant.</p>
            </div>

            <div className="bg-white border border-black/10 p-10 hover:border-[#FF4655] transition-all duration-500 ease-out relative group shadow-sm hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)]">
              <div className="absolute top-8 right-8 w-12 h-12 opacity-20 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-[2px] border-l-[2px] border-[#111]" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[2px] border-r-[2px] border-[#111]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 bg-[#FF4655]" />
              </div>
              <h3 className="font-display text-2xl font-bold uppercase text-[#111] leading-tight mb-4 mt-16 tracking-tight">Secure Vault</h3>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">Bank-grade encryption holds all entry fees safely. Withdraw to UPI or bank in minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM BAR CTA */}
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
          <div className="flex items-center gap-6 pl-10">
            <div className="text-right sm:text-left">
              <span className="font-bold uppercase tracking-wider text-sm">Ready to compete?</span>
              <span className="text-gray-400 text-xs ml-2 hidden xl:inline">Join tournaments. Prove your skill. Win big.</span>
            </div>
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
