import { generateCoaching } from '@/src/lib/aiClient';
import { useCoachStore } from '@/src/stores/coach';

jest.mock('@/src/lib/aiClient', () => ({
  generateCoaching: jest.fn(),
}));

const mockedGenerateCoaching = generateCoaching as jest.Mock;

describe('coach store', () => {
  beforeEach(() => {
    mockedGenerateCoaching.mockReset();
    useCoachStore.setState({ weeklyPlan: [], aiEnabled: true, aiHistory: [] });
  });

  it('generates recommendations from local health context', async () => {
    mockedGenerateCoaching.mockResolvedValue({
      recommendations: [{
        category: 'hydration',
        recommendation: 'Add one glass of water with lunch.',
        reason: 'Your recent intake is below your target.',
        confidence: 'medium',
      }],
      generatedAt: '2026-08-04T00:00:00.000Z',
      disclaimer: 'This is not medical advice.',
    });

    await useCoachStore.getState().generateWeeklyPlan();

    expect(mockedGenerateCoaching).toHaveBeenCalledWith(expect.objectContaining({
      periodDays: 7,
      waterTargetMl: 2000,
      averageCalories: 0,
      workoutsCompleted: 0,
      fastingSessions: 0,
    }));
    expect(useCoachStore.getState().weeklyPlan).toEqual([
      expect.objectContaining({
        category: 'hydration',
        recommendation: 'Add one glass of water with lunch.',
        reason: 'Your recent intake is below your target.',
        applied: false,
      }),
    ]);
  });

  it('does not call AI when coaching is disabled', async () => {
    useCoachStore.getState().setAIEnabled(false);

    await useCoachStore.getState().generateWeeklyPlan();

    expect(mockedGenerateCoaching).not.toHaveBeenCalled();
    expect(useCoachStore.getState().weeklyPlan).toEqual([]);
  });
});
