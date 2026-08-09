import { fireEvent, render } from '@testing-library/react-native';

const addSession = jest.fn();

jest.mock('@/src/stores/meditation', () => ({
  useMeditationStore: () => ({
    sessions: [],
    addSession,
    getWeeklyMinutes: () => 0,
    getStreak: () => 0,
    breathingPatterns: [],
  }),
}));

import { WebMeditation } from '../WebMeditation';

describe('WebMeditation', () => {
  it('renders the session workspace and starts a session', async () => {
    const { getByText, getByRole } = await render(<WebMeditation />);

    expect(getByText('Mindful')).toBeTruthy();
    expect(getByText('No sessions yet')).toBeTruthy();
    await fireEvent.press(getByRole('button', { name: 'Start mindful session' }));
    expect(getByRole('button', { name: 'Finish mindful session' })).toBeTruthy();
  });
});
