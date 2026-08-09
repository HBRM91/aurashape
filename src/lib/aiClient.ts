import { supabase } from './supabase';
import type { FoodAnalysisResult, ReadingSummary, WeeklyCoaching } from './aiTypes';
import { isLocalOnly } from './privacyMode';

const LOCAL_ONLY_AI_ERROR = 'Personalized AI is disabled in local-only mode.';

export interface FoodAnalysisInput {
  description?: string;
  imageBase64?: string;
}

function isFoodAnalysisResult(value: unknown): value is FoodAnalysisResult {
  if (!value || typeof value !== 'object') return false;

  const result = value as Partial<FoodAnalysisResult>;
  const isNonNegativeNumber = (number: unknown): number is number => (
    typeof number === 'number' && Number.isFinite(number) && number >= 0
  );

  return (
    Array.isArray(result.items) &&
    result.items.length > 0 &&
    isNonNegativeNumber(result.estimatedTotalCalories) &&
    isNonNegativeNumber(result.macros?.protein) &&
    isNonNegativeNumber(result.macros.carbs) &&
    isNonNegativeNumber(result.macros.fat) &&
    (result.confidence === 'high' || result.confidence === 'medium' || result.confidence === 'low') &&
    Array.isArray(result.assumptions) &&
    Array.isArray(result.warnings) &&
    result.items.every((item) => (
      typeof item.name === 'string' &&
      item.name.trim().length > 0 &&
       isNonNegativeNumber(item.estimatedCalories) &&
       isNonNegativeNumber(item.proteinG) &&
       isNonNegativeNumber(item.carbsG) &&
       isNonNegativeNumber(item.fatG) &&
      (item.confidence === 'high' || item.confidence === 'medium' || item.confidence === 'low')
    ))
  );
}

export async function analyzeFood(input: FoodAnalysisInput): Promise<FoodAnalysisResult> {
  if (isLocalOnly()) throw new Error(LOCAL_ONLY_AI_ERROR);
  if (!input.description?.trim() && !input.imageBase64) {
    throw new Error('Food description or image is required');
  }

  const { data, error } = await supabase.functions.invoke('ai-coach', {
    body: {
      action: 'analyze_food',
      ...(input.description?.trim() ? { description: input.description.trim() } : {}),
      ...(input.imageBase64 ? { imageBase64: input.imageBase64 } : {}),
    },
  });

  if (error) throw error;

  const payload = data && typeof data === 'object' && 'data' in data
    ? (data as { data?: unknown }).data
    : data;

  if (!isFoodAnalysisResult(payload)) {
    throw new Error('AI returned an invalid food analysis');
  }

  return payload;
}

function isReadingSummary(value: unknown): value is ReadingSummary {
  if (!value || typeof value !== 'object') return false;
  const summary = value as Partial<ReadingSummary>;
  const isCitation = (citation: unknown): boolean => {
    if (!citation || typeof citation !== 'object') return false;
    const item = citation as Record<string, unknown>;
    return (
      typeof item.authors === 'string' &&
      typeof item.journal === 'string' &&
      typeof item.title === 'string' &&
      typeof item.year === 'number' &&
      Number.isInteger(item.year)
    );
  };
  return (
    typeof summary.title === 'string' &&
    summary.title.length > 0 &&
    typeof summary.summary === 'string' &&
    summary.summary.length > 0 &&
    Array.isArray(summary.claims) &&
    summary.claims.length > 0 &&
    summary.claims.every((claim) => (
      typeof claim.text === 'string' &&
      ['strong', 'moderate', 'weak', 'insufficient'].includes(claim.evidenceGrade) &&
      Array.isArray(claim.citations) &&
      claim.citations.length > 0 &&
      claim.citations.every(isCitation)
    )) &&
    Array.isArray(summary.citations) &&
    summary.citations.length > 0 &&
    summary.citations.every(isCitation) &&
    Array.isArray(summary.practicalActions) &&
    Array.isArray(summary.limitations) &&
    typeof summary.disclaimer === 'string' &&
    summary.disclaimer.length > 0
  );
}

function isWeeklyCoaching(value: unknown): value is WeeklyCoaching {
  if (!value || typeof value !== 'object') return false;
  const coaching = value as Partial<WeeklyCoaching>;
  return (
    Array.isArray(coaching.recommendations) &&
    coaching.recommendations.length > 0 &&
    coaching.recommendations.every((recommendation) => (
      typeof recommendation.category === 'string' &&
      typeof recommendation.recommendation === 'string' &&
      typeof recommendation.reason === 'string' &&
      typeof recommendation.confidence === 'string'
    )) &&
    typeof coaching.generatedAt === 'string' &&
    typeof coaching.disclaimer === 'string' &&
    coaching.disclaimer.length > 0
  );
}

async function invokeAI<T>(body: Record<string, unknown>, isValid: (value: unknown) => value is T): Promise<T> {
  if (isLocalOnly()) throw new Error(LOCAL_ONLY_AI_ERROR);
  const { data, error } = await supabase.functions.invoke('ai-coach', { body });
  if (error) throw error;

  const payload = data && typeof data === 'object' && 'data' in data
    ? (data as { data?: unknown }).data
    : data;
  if (!isValid(payload)) throw new Error('AI returned an invalid response');
  return payload;
}

export interface ReadingAnalysisInput {
  articleId: string;
  claim: string;
  text?: string;
}

export function analyzeReading(input: ReadingAnalysisInput): Promise<ReadingSummary> {
  return invokeAI({ action: 'read_deeper', ...input }, isReadingSummary);
}

export function generateCoaching(context: Record<string, unknown>): Promise<WeeklyCoaching> {
  return invokeAI({ action: 'coach_weekly', context }, isWeeklyCoaching);
}
