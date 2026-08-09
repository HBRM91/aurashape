import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { FoodCapture } from '../FoodCapture';
import { analyzeFood } from '@/src/lib/aiClient';

jest.mock('@/src/lib/aiClient', () => ({
  analyzeFood: jest.fn(),
}));

jest.mock('@/src/stores/diary', () => ({
  useDiaryStore: (selector: (state: { addEntry: jest.Mock }) => unknown) =>
    selector({ addEntry: jest.fn() }),
}));

const mockedAnalyzeFood = analyzeFood as jest.Mock;

describe('FoodCapture', () => {
  beforeEach(() => {
    mockedAnalyzeFood.mockReset();
    mockedAnalyzeFood.mockResolvedValue({
      items: [{
        name: 'Oatmeal',
        estimatedCalories: 240,
        proteinG: 8,
        carbsG: 42,
        fatG: 5,
        confidence: 'medium',
      }],
      estimatedTotalCalories: 240,
      macros: { protein: 8, carbs: 42, fat: 5 },
      confidence: 'medium',
      assumptions: ['One cup cooked'],
      warnings: [],
    });
  });

  it('uses the server AI analysis instead of a local food guess', async () => {
    const { getByLabelText, getByRole, getByText } = await render(
      <FoodCapture onClose={jest.fn()} />,
    );

    await fireEvent.changeText(getByLabelText('Food Description'), 'oatmeal');
    await fireEvent.press(getByRole('button', { name: 'Analyze' }));

    await waitFor(() => expect(getByText('Oatmeal')).toBeTruthy());
    expect(mockedAnalyzeFood).toHaveBeenCalledWith({ description: 'oatmeal' });
  });
});
