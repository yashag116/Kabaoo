import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { verifyRiotAccount } from "@/lib/riot";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Kabaoo" },
      { name: "description", content: "Sign in or create your Kabaoo account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [username, setUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [riotId, setRiotId] = useState("");
  const [tagline, setTagline] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    setLoginLoading(false);

    if (error) {
      setLoginError(error.message);
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  // REGISTER
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    setRegLoading(true);

   const riotCheck = await verifyRiotAccount({ data: { riotId, tagline } });
    
    if (!riotCheck.success) {
      setRegError(riotCheck.error || "Invalid Riot Account.");
      setRegLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: {
          display_name: username,
          riot_id: riotId,
          tagline: tagline,
          riot_puuid: riotCheck.puuid, 
        },
      },
    });

    setRegLoading(false);

    if (error) {
      setRegError(error.message);
      return;
    }

    setUsername("");
    setRegEmail("");
    setRegPassword("");
    setRiotId("");
    setTagline("");

    setRegSuccess("Account created successfully! You can now log in.");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden md:flex flex-col justify-between p-12 border-r border-border overflow-hidden">
        <div className="absolute inset-0 [background:var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        {/* MASSIVE DESKTOP LOGO */}
        <Link to="/" className="relative flex items-center">
          <img src="/Kabaoo.png" alt="Kabaoo" className="h-16 lg:h-20 object-contain" />
        </Link>

        <div className="relative">
          <div className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">
            Skill-based · Real money
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight">
            Every kill counts. <br />
            Every match pays.
          </h1>
          <p className="mt-4 text-muted-foreground max-w-md">
            Join Valorant players turning their aim into income.
          </p>
        </div>
        <div className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kabaoo · Play responsibly. 18+
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          
          {/* MASSIVE MOBILE LOGO */}
          <Link to="/" className="md:hidden flex items-center mb-10">
            <img src="/Kabaoo.png" alt="Kabaoo" className="h-12 md:h-14 object-contain" />
          </Link>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <h2 className="font-display text-2xl font-bold">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">Log in to claim your next match.</p>
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@clutch.gg"
                    required
                    className="mt-1.5"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    className="mt-1.5"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                {loginError && (
                  <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                    {loginError}
                  </div>
                )}
                <Button type="submit" className="w-full font-semibold" disabled={loginLoading}>
                  {loginLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
              <Divider />
              <SocialButtons />
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <h2 className="font-display text-2xl font-bold">Create your account</h2>
              <p className="text-sm text-muted-foreground mt-1">Link your Riot ID and start earning.</p>
              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    required
                    className="mt-1.5"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="r-email">Email</Label>
                  <Input
                    id="r-email"
                    type="email"
                    required
                    className="mt-1.5"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="r-password">Password</Label>
                  <Input
                    id="r-password"
                    type="password"
                    required
                    className="mt-1.5"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="riot">Riot ID</Label>
                    <Input
                      id="riot"
                      placeholder="ClutchKing"
                      required
                      className="mt-1.5"
                      value={riotId}
                      onChange={(e) => setRiotId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tag">Tagline</Label>
                    <Input
                      id="tag"
                      placeholder="1337"
                      required
                      className="mt-1.5"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                    />
                  </div>
                </div>
                {regError && (
                  <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                    {regError}
                  </div>
                )}
                {regSuccess && (
                  <div className="text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-md px-3 py-2">
                    {regSuccess}
                  </div>
                )}
                <Button type="submit" className="w-full font-semibold" disabled={regLoading}>
                  {regLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
              <Divider />
              <SocialButtons />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">or continue with</span>
      </div>
    </div>
  );
}

function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" type="button" className="font-semibold">Google</Button>
      <Button variant="outline" type="button" className="font-semibold">Discord</Button>
    </div>
  );
}