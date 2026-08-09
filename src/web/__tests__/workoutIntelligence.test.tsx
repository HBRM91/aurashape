import { act, fireEvent, render } from '@testing-library/react-native';
import { RestTimer } from '../RestTimer';
import { getExerciseProgress } from '../WorkoutProgressChart';
import { deriveWorkoutAdaptations } from '@/src/stores/workoutPlan';
import type { WorkoutHistoryEntry } from '@/src/stores/workout';
import { EXERCISES } from '@/src/lib/exercises';

const exercise = EXERCISES.find((item) => item.id === 'bw-pushups')!;

function historyEntry(id: string, date: string, rpe: number, reps = 12): WorkoutHistoryEntry {
  return {
    id,
    startTime: `${date}T10:00:00.000Z`,
    endTime: `${date}T11:00:00.000Z`,
    completed: true,
    durationMinutes: 60,
    totalVolume: reps * 3,
    exercises: [{
      exercise,
      sets: [1, 2, 3].map((setNumber) => ({ set_number: setNumber, weight_kg: 1, reps, rpe })),
    }],
  };
}

describe('workout intelligence', () => {
  it('counts down and reports when the rest timer completes', async () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();
    const { getByText } = await render(
      <RestTimer initialSeconds={2} onComplete={onComplete} />,
    );

    await fireEvent.press(getByText('Start'));
    await act(async () => { jest.advanceTimersByTime(2_000); });

    expect(getByText('Done')).toBeTruthy();
    expect(onComplete).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('returns exercise volume points in chronological order', () => {
    const points = getExerciseProgress([
      historyEntry('new', '2026-08-04', 7, 14),
      historyEntry('old', '2026-08-01', 7, 10),
    ], exercise.id);

    expect(points).toEqual([
      { date: '2026-08-01', volume: 30 },
      { date: '2026-08-04', volume: 42 },
    ]);
  });

  it('suggests progression only after consistent comfortable sessions', () => {
    const adaptations = deriveWorkoutAdaptations([
      historyEntry('a', '2026-08-01', 6),
      historyEntry('b', '2026-08-02', 7),
      historyEntry('c', '2026-08-03', 7),
    ]);

    expect(adaptations).toEqual([
      expect.objectContaining({ exerciseId: exercise.id, direction: 'increase' }),
    ]);
  });

  it('suggests a decrease after repeated high-effort sessions', () => {
    const adaptations = deriveWorkoutAdaptations([
      historyEntry('a', '2026-08-01', 10),
      historyEntry('b', '2026-08-02', 9),
    ]);

    expect(adaptations).toEqual([
      expect.objectContaining({ exerciseId: exercise.id, direction: 'decrease' }),
    ]);
  });
});
