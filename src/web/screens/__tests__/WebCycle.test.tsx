import { fireEvent, render } from '@testing-library/react-native';

const addEntry = jest.fn();
const setCycleLength = jest.fn();
const setPeriodLength = jest.fn();

jest.mock('@/src/stores/cycle', () => ({
  useCycleStore: () => ({
    entries: [],
    currentCycleLength: 28,
    currentPeriodLength: 5,
    addEntry,
    removeEntry: jest.fn(),
    setCycleLength,
    setPeriodLength,
    getPrediction: () => null,
  }),
}));

import { WebCycle } from '../WebCycle';

describe('WebCycle', () => {
  it('renders an empty state and lets a user open the entry form', async () => {
    const { getByText, getAllByRole } = await render(<WebCycle />);

    expect(getByText('Cycle Tracker')).toBeTruthy();
    expect(getByText('No cycle entries yet')).toBeTruthy();
    await fireEvent.press(getAllByRole('button', { name: 'Log cycle entry' })[0]);
    expect(getByText('Log a cycle entry')).toBeTruthy();
  });
});
