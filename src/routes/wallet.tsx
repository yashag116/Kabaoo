import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpRight, History, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [{ title: "Tournament Wallet · Kabaoo" }],
  }),
  component: WalletPage,
});

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const MOCK_ACTIVITY = [
  { id: 1, type: "claim", amount: -1000, desc: "Prize Claim (₹950 transferred, 5% fee)", date: "Today" },
  { id: 2, type: "prize", amount: 1000, desc: "Tournament Prize: Winner", date: "Today" },
  { id: 3, type: "entry", amount: -500, desc: "Bracket Entry Fee Secured", date: "Yesterday" },
  { id: 4, type: "deposit", amount: 2000, desc: "Tournament Funds Added", date: "Yesterday" },
];

function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    async function loadWallet() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", user.id)
          .single();

        if (profile) {
          setBalance(profile.balance / 100);
        }
      } catch (err) {
        console.error("Wallet load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWallet();
  }, []);

  const handleAction = async (e: React.FormEvent, actionType: "deposit" | "claim") => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) return;
    if (actionType === "claim" && numAmount > balance) return;

    setActionLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const currentBalancePaise = balance * 100;
      const amountInPaise = numAmount * 100;
      const newBalancePaise = actionType === "deposit" 
        ? currentBalancePaise + amountInPaise 
        : currentBalancePaise - amountInPaise;

      const { error } = await supabase
        .from("profiles")
        .update({ balance: newBalancePaise })
        .eq("id", user.id);

      if (error) throw error;

      setBalance(newBalancePaise / 100);

      if (actionType === "deposit") {
        setToastMsg(`Successfully added ${formatINR(numAmount)} to your tournament balance.`);
      } else {
        const fee = numAmount * 0.05;
        const net = numAmount - fee;
        setToastMsg(`Claim of ${formatINR(numAmount)} initiated. You will receive ${formatINR(net)} after the 5% platform fee.`);
      }

    } catch (err) {
      console.error("Transaction Error:", err);
      alert("Failed to process transaction. Please try again.");
    } finally {
      setActionLoading(false);
      setAmount("");
      setTimeout(() => setToastMsg(""), 5000);
    }
  };

  const numAmount = Number(amount);
  const isValidClaim = amount && !isNaN(numAmount) && numAmount > 0 && numAmount <= balance;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Tournament Wallet</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your entry fee balance and claim your contest prizes.</p>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-card p-8 shadow-[var(--shadow-glow)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold flex items-center gap-2 mb-2">
                <ShieldCheck className="size-4" /> Available Funds
              </div>
              <div className="font-display text-5xl md:text-6xl font-bold text-foreground tracking-tight">
                {formatINR(balance)}
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Funds are held in secure escrow. 100% of tournament prizes are credited here automatically.
              </p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-surface/50 px-3 py-2 rounded border border-border">
                <CheckCircle2 className="size-4 text-success" /> Escrow Protected
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border card-accent bg-card shadow-[var(--shadow-card)] p-6">
          <Tabs defaultValue="deposit" className="w-full" onValueChange={() => setAmount("")}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="deposit" className="text-base font-semibold">Add Funds</TabsTrigger>
              <TabsTrigger value="claim" className="text-base font-semibold">Claim Prizes</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-6">
              <div>
                <Label className="text-base font-bold font-display mb-3 block">Fund Your Account</Label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt.toString())}
                      className={cn(
                        "rounded-md border py-2 text-sm font-mono font-semibold transition-all card-lift",
                        amount === amt.toString() ? "border-primary bg-primary/10 text-primary scale-[1.02]" : "border-border hover:border-primary/40 hover:bg-accent/30"
                      )}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
                <Label htmlFor="custom-deposit" className="text-xs text-muted-foreground">Custom Amount (₹)</Label>
                <Input
                  id="custom-deposit"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1.5 font-mono max-w-sm text-lg py-6 transition-all focus-visible:border-primary"
                />
              </div>

              <Button 
                onClick={(e) => handleAction(e, "deposit")} 
                size="lg" 
                className="w-full sm:w-auto gap-2 font-bold shadow-[var(--shadow-glow)] card-lift"
                disabled={actionLoading || !amount || Number(amount) <= 0}
              >
                {actionLoading ? <Loader2 className="size-5 animate-spin" /> : <ArrowDownToLine className="size-5" />}
                Proceed to Payment
              </Button>
            </TabsContent>

            <TabsContent value="claim" className="space-y-6">
              <div>
                <Label className="text-base font-bold font-display mb-3 block">Claim Tournament Prizes</Label>
                <p className="text-sm text-muted-foreground mb-4">Transfer your available prize pool winnings directly to your registered bank account or UPI.</p>
                <Label htmlFor="custom-claim" className="text-xs text-muted-foreground">Amount to Withdraw (₹)</Label>
                <Input
                  id="custom-claim"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1.5 font-mono max-w-sm text-lg py-6 transition-all focus-visible:border-primary"
                />
                <div className="flex items-center gap-2 mt-2">
                   <button onClick={() => setAmount(balance.toString())} className="text-xs font-semibold text-primary hover:underline">Claim Max Available</button>
                </div>
              </div>

              {isValidClaim && (
                <div className="max-w-sm rounded-lg border border-border bg-surface/50 p-4 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Withdrawal Amount</span>
                    <span className="font-mono">{formatINR(numAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground border-b border-border/50 pb-2">
                    <span>Platform Fee (5%)</span>
                    <span className="font-mono text-destructive">-{formatINR(numAmount * 0.05)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-1">
                    <span>You Receive</span>
                    <span className="font-mono text-success text-lg">{formatINR(numAmount * 0.95)}</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={(e) => handleAction(e, "claim")} 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto gap-2 font-bold card-lift"
                disabled={actionLoading || !isValidClaim}
              >
                {actionLoading ? <Loader2 className="size-5 animate-spin" /> : <ArrowUpRight className="size-5" />}
                Initiate Transfer
              </Button>
              
              {numAmount > balance && (
                <div className="flex items-center gap-2 mt-4 text-sm text-destructive font-semibold">
                  <AlertCircle className="size-4 shrink-0" /> Amount exceeds available tournament funds.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="rounded-lg border border-border card-accent bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            <h2 className="font-display text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border/50">
            {MOCK_ACTIVITY.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-surface/60 transition-all duration-300 hover:pl-6 border-l-2 border-transparent hover:border-primary group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "size-10 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110",
                    tx.amount > 0 ? "bg-success/10 border-success/30 text-success" : "bg-destructive/10 border-destructive/30 text-foreground"
                  )}>
                    {tx.amount > 0 ? <ArrowDownToLine className="size-5" /> : <ArrowUpRight className="size-5" />}
                  </div>
                  <div>
                    <div className="font-semibold transition-colors duration-300 group-hover:text-primary">{tx.desc}</div>
                    <div className="text-xs text-muted-foreground">{tx.date}</div>
                  </div>
                </div>
                <div className={cn(
                  "font-mono font-bold text-lg",
                  tx.amount > 0 ? "text-success" : "text-foreground"
                )}>
                  {tx.amount > 0 ? "+" : ""}{formatINR(tx.amount)}
                </div>
              </div>
            ))}
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