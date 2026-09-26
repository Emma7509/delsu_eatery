import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createOrderFromIntent } from "../_shared/order.ts";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifySignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): Promise<boolean> {
  if (!signature) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const computedHex = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computedHex === signature;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY")!;
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const valid = await verifySignature(rawBody, signature, paystackSecret);
    if (!valid) return json({ error: "Invalid signature" }, 401);

    const payload = JSON.parse(rawBody);
    if (payload.event !== "charge.success") return json({ received: true });

    const data = payload.data;
    if (data.currency !== "NGN" || data.status !== "success") return json({ received: true });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const result = await createOrderFromIntent(admin, data.reference, data.amount);
    if ("error" in result) console.error("Webhook order creation failed:", result.error);

    return json({ received: true });
  } catch (e) {
    console.error(e);
    return json({ received: true });
  }
});
