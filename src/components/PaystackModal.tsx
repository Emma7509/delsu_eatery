import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CheckCircle2, CreditCard } from "lucide-react";
import { formatNaira } from "@/utils/format";

type Step = "card" | "pin" | "otp" | "processing" | "success";

export function PaystackModal({
  open,
  onClose,
  email,
  amount,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  amount: number;
  onSuccess: (reference: string) => void;
}) {
  const [step, setStep] = useState<Step>("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");

  const reset = () => {
    setStep("card");
    setCard({ number: "", expiry: "", cvv: "" });
    setPin("");
    setOtp("");
  };

  const close = () => {
    if (step === "processing") return;
    reset();
    onClose();
  };

  const formatNum = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const submitCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (card.number.replace(/\s/g, "").length < 12 || card.expiry.length < 5 || card.cvv.length < 3) return;
    setStep("pin");
  };

  const submitPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;
    setStep("otp");
  };

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        const ref = "PSK_" + Math.random().toString(36).slice(2, 12).toUpperCase();
        reset();
        onSuccess(ref);
      }, 1100);
    }, 1600);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        <div className="bg-[#011b33] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#0ba4db] grid place-items-center font-bold text-sm">P</div>
            <div>
              <DialogTitle className="text-sm font-semibold text-white">Paystack Checkout</DialogTitle>
              <p className="text-[11px] text-white/70 truncate max-w-[200px]">{email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-white/70">Pay</p>
            <p className="font-bold">{formatNaira(amount)}</p>
          </div>
        </div>

        <div className="p-6 space-y-5 bg-background">
          {step === "card" && (
            <form onSubmit={submitCard} className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CreditCard className="h-4 w-4" /> Enter your card details
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Card number</Label>
                <Input
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatNum(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Expiry (MM/YY)</Label>
                  <Input inputMode="numeric" placeholder="12/29" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExp(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">CVV</Label>
                  <Input inputMode="numeric" placeholder="123" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })} />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-md bg-[#0ba4db] hover:bg-[#0a93c4] text-white font-semibold">
                Pay {formatNaira(amount)}
              </Button>
            </form>
          )}

          {step === "pin" && (
            <form onSubmit={submitPin} className="space-y-4">
              <p className="text-sm">Please enter your 4-digit card PIN to authorize the payment.</p>
              <Input
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="text-center tracking-[0.5em] text-xl"
              />
              <Button type="submit" className="w-full h-11 rounded-md bg-[#0ba4db] hover:bg-[#0a93c4] text-white font-semibold">Continue</Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={submitOtp} className="space-y-4">
              <p className="text-sm">An OTP has been sent to your phone. Enter it to complete payment.</p>
              <Input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter OTP"
                className="text-center tracking-[0.4em] text-lg"
              />
              <Button type="submit" className="w-full h-11 rounded-md bg-[#0ba4db] hover:bg-[#0a93c4] text-white font-semibold">Authorize Payment</Button>
            </form>
          )}

          {step === "processing" && (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="h-10 w-10 text-[#0ba4db] animate-spin mx-auto" />
              <p className="text-sm font-medium">Processing your payment...</p>
              <p className="text-xs text-muted-foreground">Please don't close this window</p>
            </div>
          )}

          {step === "success" && (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <p className="text-base font-semibold">Payment successful!</p>
              <p className="text-xs text-muted-foreground">Redirecting...</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-2 border-t border-border">
            <Lock className="h-3 w-3" /> Secured by Paystack · This is a simulated checkout
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
