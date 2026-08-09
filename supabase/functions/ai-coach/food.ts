import { requestStructured, type MessageContent } from '../_shared/openai.ts';
import {
  confidenceOrLow,
  numberOrZero,
  requireSafeContent,
} from '../_shared/aiSafety.ts';

interface FoodAnalysisItem {
  name: string;
  estimatedCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface FoodAnalysisResult {
  items: FoodAnalysisItem[];
  estimatedTotalCalories: number;
  macros: { protein: number; carbs: number; fat: number };
  confidence: 'high' | 'medium' | 'low';
  assumptions: string[];
  warnings: string[];
}

interface FoodAnalysisInput {
  description?: string;
  imageBase64?: string;
}

const SYSTEM_PROMPT = `You are Aurashape's nutrition estimation assistant. Return only valid JSON.
Estimate food items conservatively from the provided description or image. Do not give medical advice,
diagnoses, medication guidance, eating-disorder guidance, or claims of certainty. Nutrition estimates are
not verified nutrition labels. Always include assumptions and warnings. Use this exact shape:
{"items":[{"name":"string","estimatedCalories":0,"proteinG":0,"carbsG":0,"fatG":0,"confidence":"high|medium|low"}],"estimatedTotalCalories":0,"macros":{"protein":0,"carbs":0,"fat":0},"confidence":"high|medium|low","assumptions":["string"],"warnings":["string"]}`;

function buildContent(input: FoodAnalysisInput): MessageContent {
  const description = input.description?.trim();
  if (input.imageBase64) {
    return [
      {
        type: 'text',
        text: `${description ? `Additional description: ${description}\n` : ''}Analyze the food shown in this image. Estimate each visible item and portion conservatively.`,
      },
      { type: 'image_url', image_url: { url: input.imageBase64, detail: 'low' } },
    ];
  }
  return description || '';
}

export async function analyzeFood(input: FoodAnalysisInput): Promise<FoodAnalysisResult> {
  if (!input.description?.trim() && !input.imageBase64) {
    throw new Error('description or imageBase64 is required');
  }
  if (input.imageBase64 && input.imageBase64.length > 8_000_000) {
    throw new Error('image is too large');
  }

  const raw = await requestStructured<Record<string, unknown>>({
    role: 'system',
    content: [
      { type: 'text', text: SYSTEM_PROMPT },
      { type: 'text', text: 'User input follows.' },
      ...(Array.isArray(buildContent(input)) ? buildContent(input) : [{ type: 'text', text: buildContent(input) }]),
    ],
  });

  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items = rawItems.map((value) => {
    const item = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    return {
      name: typeof item.name === 'string' ? item.name.trim() : '',
      estimatedCalories: numberOrZero(item.estimatedCalories),
      proteinG: numberOrZero(item.proteinG),
      carbsG: numberOrZero(item.carbsG),
      fatG: numberOrZero(item.fatG),
      confidence: confidenceOrLow(item.confidence),
    } satisfies FoodAnalysisItem;
  }).filter((item) => item.name.length > 0);

  if (items.length === 0) throw new Error('AI returned no identifiable food items');

  const rawMacros = raw.macros && typeof raw.macros === 'object'
    ? raw.macros as Record<string, unknown>
    : {};
  const assumptions = Array.isArray(raw.assumptions)
    ? raw.assumptions.filter((value): value is string => typeof value === 'string')
    : [];
  const warnings = Array.isArray(raw.warnings)
    ? raw.warnings.filter((value): value is string => typeof value === 'string')
    : ['Verify estimates against the product label when available.'];
  const result: FoodAnalysisResult = {
    items,
    estimatedTotalCalories: numberOrZero(raw.estimatedTotalCalories) || items.reduce((sum, item) => sum + item.estimatedCalories, 0),
    macros: {
      protein: numberOrZero(rawMacros.protein) || items.reduce((sum, item) => sum + item.proteinG, 0),
      carbs: numberOrZero(rawMacros.carbs) || items.reduce((sum, item) => sum + item.carbsG, 0),
      fat: numberOrZero(rawMacros.fat) || items.reduce((sum, item) => sum + item.fatG, 0),
    },
    confidence: confidenceOrLow(raw.confidence),
    assumptions,
    warnings,
  };

  requireSafeContent([
    ...items.map((item) => item.name),
    ...assumptions,
    ...warnings,
  ]);
  return result;
}
