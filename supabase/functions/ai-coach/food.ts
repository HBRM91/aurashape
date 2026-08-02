import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { description } = await req.json();
    if (!description) return new Response(JSON.stringify({ error: "description required" }), { status: 400, headers: {...corsHeaders, "Content-Type": "application/json"} });
    
    // In production: call AI vision/text model here
    const items = description.toLowerCase().includes("chicken") ? [
      { name: "Grilled chicken breast", estimatedCalories: 280, proteinG: 52, carbsG: 0, fatG: 6, confidence: "high" },
    ] : description.toLowerCase().includes("salad") ? [
      { name: "Mixed green salad", estimatedCalories: 120, proteinG: 4, carbsG: 16, fatG: 6, confidence: "medium" },
    ] : [
      { name: description.length > 30 ? description.substring(0, 30) + "..." : description, estimatedCalories: 350, proteinG: 18, carbsG: 35, fatG: 12, confidence: "low" },
    ];
    
    return new Response(JSON.stringify({
      items, estimatedTotalCalories: items.reduce((s, i) => s + i.estimatedCalories, 0),
      macros: { protein: items.reduce((s, i) => s + i.proteinG, 0), carbs: items.reduce((s, i) => s + i.carbsG, 0), fat: items.reduce((s, i) => s + i.fatG, 0) },
      confidence: items[0]?.confidence || "low",
      assumptions: ["AI analysis is experimental", "Verify serving sizes manually"],
      warnings: ["This is not a substitute for nutrition labels"]
    }), { headers: {...corsHeaders, "Content-Type": "application/json"} });
  } catch { return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: {...corsHeaders, "Content-Type": "application/json"} }); }
});
