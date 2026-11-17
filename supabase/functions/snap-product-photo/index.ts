// Snap: turn a plain product photo into a styled studio shot with the Lovable AI Gateway.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { editImage, GatewayError } from "npm:@lovable.dev/ai-gateway";
import { z } from "npm:zod@3";

const STYLES: Record<string, string> = {
  studio: "a clean seamless studio backdrop with soft, even lighting and a gentle shadow under the product",
  lifestyle: "a tasteful real-life lifestyle setting that suits the product, natural daylight, shallow depth of field",
  flatlay: "an overhead flat-lay arrangement on a textured surface with a few complementary props",
  luxury: "an elegant luxury display with marble, soft highlights and a premium editorial feel",
  market: "a charming outdoor pop-up market booth table, warm afternoon light",
};

const Body = z.object({
  orgId: z.string().uuid(),
  imageBase64: z.string().min(100).max(14_000_000),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]),
  style: z.enum(["studio", "lifestyle", "flatlay", "luxury", "market"]),
  useBrandColors: z.boolean().default(true),
  notes: z.string().max(300).optional(),
  shape: z.enum(["square", "portrait", "landscape"]).default("square"),
});

const SIZES = { square: "1024x1024", portrait: "1024x1536", landscape: "1536x1024" } as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const auth = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return json({ error: "Please sign in." }, 401);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, 400);
  const p = parsed.data;

  const { data: member } = await supabase.rpc("is_org_member", { _org_id: p.orgId });
  if (!member) return json({ error: "You don't have access to this business." }, 403);

  let palette = "";
  if (p.useBrandColors) {
    const { data: kit } = await supabase.from("brand_kits").select("primary_color,accent_color,surface_color").eq("org_id", p.orgId).maybeSingle();
    if (kit) palette = ` Use the brand palette ${kit.primary_color}, ${kit.accent_color} and ${kit.surface_color} subtly in the background and props.`;
  }

  const prompt =
    `Professional e-commerce product photograph. Keep the product itself exactly as it is — same shape, colors, labels, text and logos; do not redraw or alter it. ` +
    `Place it in ${STYLES[p.style]}.${palette}` +
    (p.notes ? ` Extra direction: ${p.notes}.` : "") +
    ` Photorealistic, sharp focus on the product, no added text or watermarks.`;

  try {
    const bytes = Uint8Array.from(atob(p.imageBase64), (c) => c.charCodeAt(0));
    const result = await editImage({
      model: "openai/gpt-image-2.5-sunburst",
      image: new Blob([bytes], { type: p.mimeType }),
      prompt,
      size: SIZES[p.shape],
      quality: "medium",
      output_format: "png",
    });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) return json({ error: "No image came back. Please try again." }, 502);
    return json({ imageBase64: b64 });
  } catch (e) {
    if (e instanceof GatewayError) {
      console.error("snap gateway error", e.code, e.httpStatus, e.ids);
      if (e.httpStatus === 402) return json({ error: "AI credits are used up. Please add credits to keep creating photos." }, 402);
      if (e.httpStatus === 429) return json({ error: "Too many photos at once — please wait a minute and try again." }, 429);
      return json({ error: "The photo couldn't be created. Please try a different picture or style." }, 502);
    }
    console.error("snap error", e);
    return json({ error: "Something went wrong creating your photo." }, 500);
  }
});
