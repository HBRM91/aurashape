import { fireEvent, render } from '@testing-library/react-native';
import { MealPlanner } from '../MealPlanner';
import { buildGroceryList } from '../GroceryList';
import { useRecipeStore } from '@/src/stores/recipes';
import { useDiaryStore } from '@/src/stores/diary';

const startDate = '2026-08-04';

beforeEach(() => {
  useRecipeStore.setState({ savedRecipes: [], mealPlan: {} });
  useDiaryStore.setState({ selectedDate: startDate, entries: [], recentFoods: [], favoriteFoods: [] });
});

describe('meal planning', () => {
  it('aggregates ingredients from planned recipes into grocery groups', () => {
    const groceries = buildGroceryList({
      [startDate]: { breakfast: 'r-protein-oats', lunch: 'r-chicken-bowl' },
    });

    expect(groceries.produce).toEqual(expect.arrayContaining([
      'Mixed berries 80g',
      'Cucumber 80g',
    ]));
    expect(groceries.pantry).toEqual(expect.arrayContaining(['Chia seeds 15g']));
    expect(groceries.protein).toEqual(expect.arrayContaining([
      'Whey protein (vanilla) 30g',
      'Chicken breast 150g',
    ]));
  });

  it('assigns a recipe to a meal slot', async () => {
    const { getByRole, getByText } = await render(<MealPlanner startDate={startDate} />);

    await fireEvent.press(getByRole('button', { name: 'Plan breakfast for Tue, Aug 4' }));
    await fireEvent.press(getByText('High-Protein Overnight Oats'));

    expect(useRecipeStore.getState().getMealPlan(startDate).breakfast).toBe('r-protein-oats');
  });

  it('auto-fills empty slots and logs a planned meal to the diary', async () => {
    const { getByRole, getByText, getAllByRole } = await render(<MealPlanner startDate={startDate} />);

    await fireEvent.press(getByRole('button', { name: 'Auto-fill week' }));
    expect(Object.keys(useRecipeStore.getState().mealPlan)).toHaveLength(7);

    await fireEvent.press(getAllByRole('button', { name: /Log .* to diary/ })[0]);
    expect(useDiaryStore.getState().entries).toHaveLength(1);
    expect(getByText('Logged')).toBeTruthy();
  });
});
