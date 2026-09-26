declare global {
  interface Window {
    PaystackPop: any;
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadPaystackScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export function payWithPaystack(opts: {
  email: string;
  amountNaira: number;
  reference: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}) {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const handler = window.PaystackPop.setup({
    key,
    email: opts.email,
    amount: Math.round(opts.amountNaira * 100),
    ref: opts.reference,
    currency: "NGN",
    callback: (response: any) => opts.onSuccess(response.reference),
    onClose: opts.onClose,
  });
  handler.openIframe();
}
