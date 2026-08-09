import { fireEvent, render } from '@testing-library/react-native';
import { LocalCoachCard } from '../LocalCoachCard';
import { LocalWeeklyReview } from '../LocalWeeklyReview';
import type { LocalCoachContext, LocalRecommendation } from '@/src/lib/localCoach';

const recommendation: LocalRecommendation = {
  id: 'hydration-2026-08-05',
  category: 'hydration',
  title: 'Close the hydration gap',
  action: 'Add one glass of water now.',
  reason: 'You logged 400 ml of your 2000 ml local target today.',
  confidence: 'high',
};

const context: LocalCoachContext = {
  date: '2026-08-05',
  calories: { consumed: 1800, target: 2000 },
  waterMl: { consumed: 1600, target: 2000 },
  diaryDaysLogged: 5,
  workoutsCompleted: 1,
  fastingSessionsCompleted: 1,
  recentWorkoutEffort: 'comfortable',
};

describe('local coach UI', () => {
  it('shows local provenance and supports dismissing a daily nudge', async () => {
    const onDismiss = jest.fn();
    const { getByText, getByRole } = await render(
      <LocalCoachCard recommendation={recommendation} onDismiss={onDismiss} onSnooze={jest.fn()} />,
    );

    expect(getByText(/Computed on this device/)).toBeTruthy();
    expect(getByText(recommendation.reason)).toBeTruthy();
    await fireEvent.press(getByRole('button', { name: 'Dismiss coaching suggestion' }));
    expect(onDismiss).toHaveBeenCalledWith(recommendation.id);
  });

  it('shows the weekly local review and supports deleting it', async () => {
    const onDelete = jest.fn();
    const { getByText, getByRole } = await render(
      <LocalWeeklyReview contexts={[context, context, context]} onDelete={onDelete} />,
    );

    expect(getByText('Weekly review')).toBeTruthy();
    expect(getByText('Computed on this device')).toBeTruthy();
    await fireEvent.press(getByRole('button', { name: 'Delete weekly review' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
