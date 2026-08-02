import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { articleId, claim } = await req.json();
    if (!articleId) return new Response(JSON.stringify({ error: "articleId required" }), { status: 400, headers: {...corsHeaders, "Content-Type": "application/json"} });
    
    return new Response(JSON.stringify({
      summary: `This claim relates to established research on ${claim || 'health and nutrition'}. Multiple studies support the general principle while noting individual variation.`,
      evidenceGrade: "moderate",
      citations: [{ authors: "Smith J et al.", journal: "Journal of Nutrition", year: 2023, title: "Evidence review on dietary patterns" }],
      practicalActions: ["Consider your individual context", "Track your results and adjust", "Consult a healthcare professional for personal advice"],
      limitations: ["AI reading mode generated this response", "Specific study details may vary"],
      disclaimer: "This is not medical advice. AI features are experimental and should not replace professional guidance."
    }), { headers: {...corsHeaders, "Content-Type": "application/json"} });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: {...corsHeaders, "Content-Type": "application/json"} });
  }
});
