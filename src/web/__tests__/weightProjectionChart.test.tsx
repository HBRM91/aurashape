import { render } from '@testing-library/react-native';
import { WeightProjectionChart } from '../WeightProjectionChart';

describe('WeightProjectionChart', () => {
  it('renders an accessible summary for actual and projected data', async () => {
    const { getByLabelText, getByText } = await render(<WeightProjectionChart projection={[{ date: '2026-08-10', weightKg: 80, projected: true }]} actualEntries={[{ date: '2026-08-09', weightKg: 81 }]} targetKg={76} />);
    expect(getByLabelText(/Weight projection/)).toBeTruthy();
    expect(getByText('Weight evolution')).toBeTruthy();
  });
});
