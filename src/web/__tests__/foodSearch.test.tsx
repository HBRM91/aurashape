import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { FoodSearchSheet } from '../FoodSearchSheet';
import { useDiaryStore } from '@/src/stores/diary';
import { searchFoods } from '@/src/lib/foodApi';
import type { Food } from '@/src/types';

jest.mock('@/src/lib/foodApi', () => ({
  searchFoods: jest.fn(),
}));

const mockedSearchFoods = searchFoods as jest.Mock;

const food: Food = {
  id: 'food-1',
  name: 'Greek Yogurt',
  brand: 'Aurashape Kitchen',
  serving_name: '170g cup',
  serving_size_g: 170,
  calories_per_serving: 120,
  protein_g: 17,
  carbs_g: 8,
  fat_g: 2,
  fiber_g: 0,
  is_verified: true,
  is_aurabiosens: false,
  source: 'test',
};

beforeEach(() => {
  mockedSearchFoods.mockReset();
  useDiaryStore.setState({
    recentFoods: [food],
    favoriteFoods: [],
  });
});

describe('FoodSearchSheet', () => {
  it('shows recent foods and lets the user favorite one', async () => {
    const { getByText, getByRole } = await render(
      <FoodSearchSheet onSelect={jest.fn()} onClose={jest.fn()} />,
    );

    expect(getByText('Recent')).toBeTruthy();
    expect(getByText('Greek Yogurt')).toBeTruthy();

    await fireEvent.press(getByRole('button', { name: 'Favorite Greek Yogurt' }));

    expect(useDiaryStore.getState().favoriteFoods).toEqual([food]);
  });

  it('shows an empty search state even when favorites exist', async () => {
    mockedSearchFoods.mockResolvedValue([]);
    useDiaryStore.setState({ favoriteFoods: [food] });

    const { getByLabelText, getByText, queryByText } = await render(
      <FoodSearchSheet onSelect={jest.fn()} onClose={jest.fn()} />,
    );

    await fireEvent.changeText(getByLabelText('Search food'), 'zz');

    await waitFor(() => expect(getByText('No results found')).toBeTruthy());
    expect(queryByText('Greek Yogurt')).toBeNull();
  });

  it('lets the user retry a failed search', async () => {
    mockedSearchFoods
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([food]);

    const { getByLabelText, getByRole, getByText } = await render(
      <FoodSearchSheet onSelect={jest.fn()} onClose={jest.fn()} />,
    );

    await fireEvent.changeText(getByLabelText('Search food'), 'yogurt');
    await waitFor(() => expect(getByText('Could not search. Try again.')).toBeTruthy());

    await fireEvent.press(getByRole('button', { name: 'Retry search' }));

    await waitFor(() => expect(getByText('Greek Yogurt')).toBeTruthy());
    expect(mockedSearchFoods).toHaveBeenCalledTimes(2);
  });
});
