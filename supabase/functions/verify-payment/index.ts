import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createOrderFromIntent } from "../_shared/order.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://deslu-eatery.netlify.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Invalid session" }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { reference } = body as { reference: string };
    if (!reference) return json({ error: "Missing reference" }, 400);

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackSecret}` } },
    );
    const verifyData = await verifyRes.json();

    if (
      !verifyRes.ok ||
      !verifyData.status ||
      verifyData.data?.status !== "success" ||
      verifyData.data?.currency !== "NGN"
    ) {
      return json({ error: "Payment could not be verified" }, 402);
    }

    const result = await createOrderFromIntent(admin, reference, verifyData.data.amount);
    if ("error" in result) return json({ error: result.error }, result.status);
    return json({ orderId: result.orderId });
  } catch (e) {
    console.error(e);
    return json({ error: "Unexpected server error" }, 500);
  }
});
