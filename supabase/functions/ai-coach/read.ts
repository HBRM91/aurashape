import { requestStructured, type MessageContent } from '../_shared/openai.ts';
import { requireSafeContent } from '../_shared/aiSafety.ts';

type EvidenceGrade = 'strong' | 'moderate' | 'weak' | 'insufficient';

interface ReadingCitation {
  authors: string;
  journal: string;
  year: number;
  title: string;
}

interface ReadingClaim {
  text: string;
  evidenceGrade: EvidenceGrade;
  citations: ReadingCitation[];
}

export interface ReadingSummary {
  title: string;
  summary: string;
  claims: ReadingClaim[];
  evidenceGrade: 'strong' | 'moderate' | 'weak';
  citations: ReadingCitation[];
  practicalActions: string[];
  limitations: string[];
  disclaimer: string;
}

interface ReadingInput {
  articleId?: string;
  claim?: string;
  text?: string;
  question?: string;
}

const SYSTEM_PROMPT = `You are Aurashape's evidence-aware health reading assistant. Return only valid JSON.
Analyze the supplied claim using cautious language. Do not diagnose, prescribe, recommend medication changes,
or provide eating-disorder guidance. Use this exact shape:
{"title":"string","summary":"string","claims":[{"text":"string","evidenceGrade":"strong|moderate|weak|insufficient","citations":[{"authors":"string","journal":"string","year":2024,"title":"string"}]}],"evidenceGrade":"strong|moderate|weak","citations":[{"authors":"string","journal":"string","year":2024,"title":"string"}],"practicalActions":["string"],"limitations":["string"],"disclaimer":"This is not medical advice."}
Every claim must include at least one citation. Never invent certainty; state limitations when evidence is mixed or missing.`;

function buildContent(input: ReadingInput): MessageContent {
  return [
    { type: 'text', text: `Article ID: ${input.articleId || 'unknown'}` },
    { type: 'text', text: `Claim: ${input.claim || 'No specific claim supplied'}` },
    ...(input.text ? [{ type: 'text' as const, text: `Article text: ${input.text.slice(0, 12_000)}` }] : []),
    ...(input.question ? [{ type: 'text' as const, text: `Reader question: ${input.question.slice(0, 2_000)}` }] : []),
  ];
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function parseCitation(value: unknown): ReadingCitation | null {
  if (!value || typeof value !== 'object') return null;
  const citation = value as Record<string, unknown>;
  if (
    typeof citation.authors !== 'string' ||
    typeof citation.journal !== 'string' ||
    typeof citation.title !== 'string' ||
    typeof citation.year !== 'number' ||
    !Number.isInteger(citation.year) ||
    citation.year < 1900 ||
    citation.year > new Date().getFullYear() + 1
  ) return null;
  return {
    authors: citation.authors.trim(),
    journal: citation.journal.trim(),
    title: citation.title.trim(),
    year: citation.year,
  };
}

function parseClaims(value: unknown): ReadingClaim[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const claim = item as Record<string, unknown>;
    const citations = Array.isArray(claim.citations)
      ? claim.citations.map(parseCitation).filter((citation): citation is ReadingCitation => citation !== null)
      : [];
    const evidenceGrade = claim.evidenceGrade;
    if (
      typeof claim.text !== 'string' ||
      !claim.text.trim() ||
      !['strong', 'moderate', 'weak', 'insufficient'].includes(String(evidenceGrade)) ||
      citations.length === 0
    ) return [];
    return [{
      text: claim.text.trim(),
      evidenceGrade: evidenceGrade as EvidenceGrade,
      citations,
    }];
  });
}

export async function analyzeReading(input: ReadingInput): Promise<ReadingSummary> {
  if (!input.articleId) throw new Error('articleId is required');
  if (!input.claim?.trim() && !input.text?.trim()) throw new Error('claim or text is required');

  const raw = await requestStructured<Record<string, unknown>>({
    role: 'system',
    content: [
      { type: 'text', text: SYSTEM_PROMPT },
      ...((buildContent(input) as Array<{ type: 'text'; text: string }>)),
    ],
  });
  const claims = parseClaims(raw.claims);
  if (Array.isArray(raw.claims) && raw.claims.length > 0 && claims.length !== raw.claims.length) {
    throw new Error('AI reading response contained an uncited or invalid claim');
  }

  const citations = Array.isArray(raw.citations)
    ? raw.citations.map(parseCitation).filter((citation): citation is ReadingCitation => citation !== null)
    : [];
  const evidenceGrade = raw.evidenceGrade === 'strong' || raw.evidenceGrade === 'moderate' || raw.evidenceGrade === 'weak'
    ? raw.evidenceGrade
    : 'weak';
  const result: ReadingSummary = {
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : input.claim || 'Health reading',
    summary: typeof raw.summary === 'string' ? raw.summary.trim() : '',
    claims,
    evidenceGrade,
    citations,
    practicalActions: stringArray(raw.practicalActions),
    limitations: stringArray(raw.limitations),
    disclaimer: typeof raw.disclaimer === 'string' && raw.disclaimer.trim()
      ? raw.disclaimer.trim()
      : 'This is not medical advice.',
  };

  if (!result.summary || result.claims.length === 0 || result.citations.length === 0) {
    throw new Error('AI reading response was incomplete');
  }
  requireSafeContent([
    result.title,
    result.summary,
    ...result.claims.map((claim) => claim.text),
    ...result.practicalActions,
    ...result.limitations,
  ]);
  return result;
}
