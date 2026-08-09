import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getAuthenticatedUserId } from '../_shared/auth.ts';
import { analyzeFood } from './food.ts';
import { analyzeReading } from './read.ts';
import { requestStructured } from '../_shared/openai.ts';
import { requireSafeContent } from '../_shared/aiSafety.ts';

const callsByUser = new Map<string, { day: string; count: number }>();
const COACHING_CATEGORIES = ['nutrition', 'fasting', 'workout', 'recovery', 'hydration'] as const;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function allowCall(userId: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const current = callsByUser.get(userId);
  if (!current || current.day !== day) {
    callsByUser.set(userId, { day, count: 1 });
    return true;
  }
  if (current.count >= 20) return false;
  current.count += 1;
  return true;
}

async function generateWeeklyCoaching(context: Record<string, unknown>) {
  const raw = await requestStructured<Record<string, unknown>>({
    role: 'system',
    content: [
      {
        type: 'text',
        text: `You are Aurashape's conservative wellness coach. Return only valid JSON with this shape:
{"recommendations":[{"category":"nutrition|fasting|workout|recovery|hydration","recommendation":"string","reason":"string","confidence":"high|medium|low"}],"generatedAt":"ISO date","disclaimer":"This is not medical advice."}
Use only the supplied metrics. Do not diagnose, prescribe, recommend medication changes, or encourage restrictive or disordered eating. Return at most five actionable recommendations and explain the metric behind each one.`,
      },
      { type: 'text', text: `Weekly metrics: ${JSON.stringify(context).slice(0, 12_000)}` },
    ],
  });
  const rawRecommendations = Array.isArray(raw.recommendations) ? raw.recommendations : [];
  const recommendations = rawRecommendations.flatMap((value) => {
    if (!value || typeof value !== 'object') return [];
    const recommendation = value as Record<string, unknown>;
    if (
      typeof recommendation.category !== 'string' ||
      !COACHING_CATEGORIES.includes(recommendation.category as typeof COACHING_CATEGORIES[number]) ||
      typeof recommendation.recommendation !== 'string' ||
      typeof recommendation.reason !== 'string'
    ) return [];
    return [{
      category: recommendation.category,
      recommendation: recommendation.recommendation.trim(),
      reason: recommendation.reason.trim(),
      confidence: recommendation.confidence === 'high' || recommendation.confidence === 'medium' ? recommendation.confidence : 'low',
    }];
  });
  if (recommendations.length === 0) throw new Error('AI coaching response was incomplete');
  requireSafeContent(recommendations.flatMap((recommendation) => [recommendation.recommendation, recommendation.reason]));
  return {
    recommendations,
    generatedAt: typeof raw.generatedAt === 'string' ? raw.generatedAt : new Date().toISOString(),
    disclaimer: typeof raw.disclaimer === 'string' && raw.disclaimer.trim()
      ? raw.disclaimer.trim()
      : 'This is not medical advice.',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return json({ error: 'Unauthorized' }, 401);

    const { action, ...params } = await req.json();
    if (!allowCall(userId)) return json({ error: 'AI daily limit reached. Try again tomorrow.' }, 429);
    if (action === 'analyze_food') return json({ data: await analyzeFood(params) });
    if (action === 'read_deeper') return json({ data: await analyzeReading(params) });
    if (action === 'coach_weekly') return json({ data: await generateWeeklyCoaching(params.context || {}) });
    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    const status = message === 'AI provider is not configured' ? 503 : 500;
    return json({ error: message }, status);
  }
});
