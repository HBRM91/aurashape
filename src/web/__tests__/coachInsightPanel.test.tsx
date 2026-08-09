import { fireEvent, render } from '@testing-library/react-native';
import { CoachInsightPanel } from '../CoachInsightPanel';

const recommendation = {
  id: 'coach-1',
  category: 'hydration' as const,
  recommendation: 'Add one glass of water with lunch.',
  reason: 'Your recent intake is below your target.',
  action: 'Drink one extra glass with lunch.',
  createdAt: '2026-08-04T00:00:00.000Z',
  applied: false,
};

describe('CoachInsightPanel', () => {
  it('reveals the reason and supports apply or dismiss actions', async () => {
    const onApply = jest.fn();
    const onDismiss = jest.fn();
    const { getByRole, getByText, queryByText } = await render(
      <CoachInsightPanel recommendation={recommendation} onApply={onApply} onDismiss={onDismiss} />,
    );

    expect(getByText(recommendation.recommendation)).toBeTruthy();
    expect(queryByText(recommendation.reason)).toBeNull();

    await fireEvent.press(getByRole('button', { name: 'Why this?' }));
    expect(getByText(recommendation.reason)).toBeTruthy();

    await fireEvent.press(getByRole('button', { name: 'Apply recommendation' }));
    await fireEvent.press(getByRole('button', { name: 'Dismiss recommendation' }));
    expect(onApply).toHaveBeenCalledWith(recommendation.id);
    expect(onDismiss).toHaveBeenCalledWith(recommendation.id);
  });
});
