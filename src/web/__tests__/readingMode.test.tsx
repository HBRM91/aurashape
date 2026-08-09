import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ReadingMode } from '../ReadingMode';
import { analyzeReading } from '@/src/lib/aiClient';

jest.mock('@/src/lib/aiClient', () => ({
  analyzeReading: jest.fn(),
}));

const mockAddExplanation = jest.fn();

jest.mock('@/src/stores/reading', () => ({
  useReadingStore: (selector: (state: { addExplanation: jest.Mock }) => unknown) =>
    selector({ addExplanation: mockAddExplanation }),
}));

const mockedAnalyzeReading = analyzeReading as jest.Mock;

const reading = {
  title: 'Protein and satiety',
  summary: 'Protein may support satiety, with individual variation.',
  claims: [{
    text: 'Protein may support satiety.',
    evidenceGrade: 'moderate',
    citations: [{
      authors: 'Author A',
      journal: 'Nutrition Journal',
      year: 2024,
      title: 'Protein and satiety',
    }],
  }],
  evidenceGrade: 'moderate',
  citations: [{
    authors: 'Author A',
    journal: 'Nutrition Journal',
    year: 2024,
    title: 'Protein and satiety',
  }],
  practicalActions: ['Include a protein source with meals.'],
  limitations: ['Results vary between people.'],
  disclaimer: 'This is not medical advice.',
};

describe('ReadingMode', () => {
  beforeEach(() => {
    mockedAnalyzeReading.mockReset();
    mockAddExplanation.mockReset();
  });

  it('loads and displays the cited AI explanation', async () => {
    mockedAnalyzeReading.mockResolvedValue(reading);

    const { getByText } = await render(
      <ReadingMode articleId="article-1" claim="Protein supports satiety" onClose={jest.fn()} />,
    );

    await waitFor(() => expect(getByText('Protein may support satiety, with individual variation.')).toBeTruthy());
    expect(getByText('Evidence: Moderate')).toBeTruthy();
    expect(getByText(/Protein and satiety/)).toBeTruthy();
    expect(mockedAnalyzeReading).toHaveBeenCalledWith({
      articleId: 'article-1',
      claim: 'Protein supports satiety',
    });
  });

  it('offers retry after an unavailable explanation', async () => {
    mockedAnalyzeReading
      .mockRejectedValueOnce(new Error('AI unavailable'))
      .mockResolvedValueOnce(reading);

    const { getByRole, getByText } = await render(
      <ReadingMode articleId="article-1" claim="Protein supports satiety" onClose={jest.fn()} />,
    );

    await waitFor(() => expect(getByText('AI explanation unavailable.')).toBeTruthy());
    await fireEvent.press(getByRole('button', { name: 'Retry explanation' }));

    await waitFor(() => expect(getByText('Protein may support satiety, with individual variation.')).toBeTruthy());
    expect(mockedAnalyzeReading).toHaveBeenCalledTimes(2);
  });

  it('saves the loaded explanation instead of placeholder content', async () => {
    mockedAnalyzeReading.mockResolvedValue(reading);

    const { getByRole, getByText } = await render(
      <ReadingMode articleId="article-1" claim="Protein supports satiety" onClose={jest.fn()} />,
    );

    await waitFor(() => expect(getByText('Protein may support satiety, with individual variation.')).toBeTruthy());
    await fireEvent.press(getByRole('button', { name: 'Save explanation' }));

    expect(mockAddExplanation).toHaveBeenCalledWith(expect.objectContaining({
      articleId: 'article-1',
      claim: 'Protein supports satiety',
      summary: reading.summary,
      evidenceGrade: reading.evidenceGrade,
    }));
  });
});
