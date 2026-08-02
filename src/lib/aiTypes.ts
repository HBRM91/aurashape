export interface FoodItem {
  name: string;
  estimatedCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface FoodAnalysisResult {
  items: FoodItem[];
  estimatedTotalCalories: number;
  macros: { protein: number; carbs: number; fat: number };
  confidence: 'high' | 'medium' | 'low';
  assumptions: string[];
  warnings: string[];
}

export interface ReadingClaim {
  text: string;
  evidenceGrade: 'strong' | 'moderate' | 'weak' | 'insufficient';
  citations: Array<{ authors: string; journal: string; year: number; title: string }>;
}

export interface ReadingSummary {
  title: string;
  summary: string;
  claims: ReadingClaim[];
  evidenceGrade: 'strong' | 'moderate' | 'weak';
  citations: Array<{ authors: string; journal: string; year: number; title: string }>;
  practicalActions: string[];
  limitations: string[];
  disclaimer: string;
}

export interface AICoachRecommendation {
  category: 'nutrition' | 'fasting' | 'workout' | 'recovery' | 'hydration';
  recommendation: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface WeeklyCoaching {
  recommendations: AICoachRecommendation[];
  generatedAt: string;
  disclaimer: string;
}
