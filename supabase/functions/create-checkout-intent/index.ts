import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Invalid session" }, 401);

    const body = await req.json();
    const { reference, method, items, customer } = body;

    if (!reference || !method || !Array.isArray(items) || items.length === 0) {
      return json({ error: "Malformed checkout request" }, 400);
    }

    const { error: insertErr } = await userClient.from("checkout_intents").insert({
      reference,
      user_id: userData.user.id,
      method,
      items,
      customer,
    });

    if (insertErr) return json({ error: "Failed to create checkout intent" }, 500);
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: "Unexpected server error" }, 500);
  }
});
