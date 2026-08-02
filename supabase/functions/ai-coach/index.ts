import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();
    const userId = req.headers.get("x-user-id");
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    switch (action) {
      case "analyze_food":
        return new Response(JSON.stringify({
          items: [{ name: params.description || "Unknown food", estimatedCalories: 300, proteinG: 20, carbsG: 30, fatG: 10, confidence: "low" }],
          estimatedTotalCalories: 300, macros: { protein: 20, carbs: 30, fat: 10 },
          confidence: "low", assumptions: ["Estimate based on description only"], warnings: ["AI food analysis is not yet configured"]
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      case "read_deeper":
        return new Response(JSON.stringify({
          title: params.title || "Analysis pending",
          summary: "AI reading mode is not yet configured. Please check back soon.", evidenceGrade: "insufficient",
          claims: [], citations: [], practicalActions: [], limitations: ["AI reading is not yet configured"],
          disclaimer: "This is not medical advice. AI features are experimental."
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
