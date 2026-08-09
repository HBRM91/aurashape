import { analyzeFood, analyzeReading, generateCoaching } from '../aiClient';
import { supabase } from '@/src/lib/supabase';
import type { FoodAnalysisResult } from '../aiTypes';
import type { ReadingSummary, WeeklyCoaching } from '../aiTypes';

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

const invoke = supabase.functions.invoke as jest.Mock;

const result: FoodAnalysisResult = {
  items: [
    {
      name: 'Chicken salad',
      estimatedCalories: 350,
      proteinG: 30,
      carbsG: 15,
      fatG: 18,
      confidence: 'medium',
    },
  ],
  estimatedTotalCalories: 350,
  macros: { protein: 30, carbs: 15, fat: 18 },
  confidence: 'medium',
  assumptions: ['Standard serving size'],
  warnings: [],
};

const reading: ReadingSummary = {
  title: 'Protein and satiety',
  summary: 'The evidence suggests protein can support satiety, with individual variation.',
  claims: [{
    text: 'Protein may support satiety.',
    evidenceGrade: 'moderate',
    citations: [{ authors: 'Author A', journal: 'Nutrition Journal', year: 2024, title: 'Protein and satiety' }],
  }],
  evidenceGrade: 'moderate',
  citations: [{ authors: 'Author A', journal: 'Nutrition Journal', year: 2024, title: 'Protein and satiety' }],
  practicalActions: ['Include a protein source with meals.'],
  limitations: ['Results vary between people.'],
  disclaimer: 'This is not medical advice.',
};

const coaching: WeeklyCoaching = {
  recommendations: [{
    category: 'hydration',
    recommendation: 'Add one glass of water with lunch.',
    reason: 'Your recent intake is below your target.',
    confidence: 'medium',
  }],
  generatedAt: '2026-08-02T00:00:00.000Z',
  disclaimer: 'This is not medical advice.',
};

describe('analyzeFood', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_DATA_MODE = 'cloud';
    invoke.mockReset();
  });

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_DATA_MODE;
  });

  it('invokes the server-side AI function with the food description', async () => {
    invoke.mockResolvedValue({ data: { data: result }, error: null });

    await expect(analyzeFood({ description: 'chicken salad' })).resolves.toEqual(result);

    expect(invoke).toHaveBeenCalledWith('ai-coach', {
      body: { action: 'analyze_food', description: 'chicken salad' },
    });
  });

  it('surfaces function errors to the caller', async () => {
    invoke.mockResolvedValue({ data: null, error: new Error('AI unavailable') });

    await expect(analyzeFood({ description: 'oatmeal' })).rejects.toThrow('AI unavailable');
  });

  it('rejects nutrition values that are negative', async () => {
    invoke.mockResolvedValue({
      data: {
        data: {
          ...result,
          items: [{ ...result.items[0], estimatedCalories: -10 }],
        },
      },
      error: null,
    });

    await expect(analyzeFood({ description: 'oatmeal' })).rejects.toThrow(
      'AI returned an invalid food analysis',
    );
  });

  it('requests a cited reading analysis', async () => {
    invoke.mockResolvedValue({ data: { data: reading }, error: null });

    await expect(analyzeReading({ articleId: 'article-1', claim: 'Protein supports satiety.' }))
      .resolves.toEqual(reading);

    expect(invoke).toHaveBeenCalledWith('ai-coach', {
      body: { action: 'read_deeper', articleId: 'article-1', claim: 'Protein supports satiety.' },
    });
  });

  it('rejects reading claims without citations', async () => {
    invoke.mockResolvedValue({
      data: {
        data: {
          ...reading,
          claims: [{ ...reading.claims[0], citations: [] }],
        },
      },
      error: null,
    });

    await expect(analyzeReading({ articleId: 'article-1', claim: 'Protein supports satiety.' }))
      .rejects.toThrow('AI returned an invalid response');
  });

  it('requests coaching from the supplied user context', async () => {
    invoke.mockResolvedValue({ data: { data: coaching }, error: null });
    const context = { averageCalories: 1800, waterTarget: 2000 };

    await expect(generateCoaching(context)).resolves.toEqual(coaching);

    expect(invoke).toHaveBeenCalledWith('ai-coach', {
      body: { action: 'coach_weekly', context },
    });
  });
});
