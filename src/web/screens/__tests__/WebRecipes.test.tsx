import { fireEvent, render } from '@testing-library/react-native';

const toggleSaved = jest.fn();
const addEntry = jest.fn();

jest.mock('@/src/stores/recipes', () => ({
  useRecipeStore: () => ({ savedRecipes: [], isSaved: () => false, toggleSaved }),
}));
jest.mock('@/src/stores/diary', () => ({
  useDiaryStore: (selector: (state: { addEntry: typeof addEntry }) => unknown) => selector({ addEntry }),
}));

import { WebRecipes } from '../WebRecipes';

describe('WebRecipes', () => {
  it('renders recipes and filters them by search', async () => {
    const { getByText, getByLabelText, queryByText } = await render(<WebRecipes />);

    expect(getByText('Recipes')).toBeTruthy();
    expect(getByText('Mediterranean Chicken Power Bowl')).toBeTruthy();
    await fireEvent.changeText(getByLabelText('Search recipes'), 'not-a-real-recipe');
    expect(queryByText('Mediterranean Chicken Power Bowl')).toBeNull();
  });
});
