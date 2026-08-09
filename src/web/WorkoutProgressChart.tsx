import { Circle, Line, Polyline, Svg } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';
import type { WorkoutHistoryEntry } from '@/src/stores/workout';
import { WEB_TOKENS } from './tokens';

export interface ExerciseProgressPoint {
  date: string;
  volume: number;
}

export function getExerciseProgress(history: WorkoutHistoryEntry[], exerciseId: string): ExerciseProgressPoint[] {
  return history
    .flatMap((entry) => {
      const exercise = entry.exercises.find((item) => item.exercise.id === exerciseId);
      if (!exercise) return [];
      return [{
        date: entry.startTime.slice(0, 10),
        volume: exercise.sets.reduce((sum, set) => sum + (set.weight_kg || 0) * set.reps, 0),
      }];
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12);
}

interface WorkoutProgressChartProps {
  history: WorkoutHistoryEntry[];
  exerciseId: string;
  exerciseName: string;
}

export function WorkoutProgressChart({ history, exerciseId, exerciseName }: WorkoutProgressChartProps) {
  const points = getExerciseProgress(history, exerciseId);
  if (points.length === 0) {
    return <Text style={styles.empty}>Complete this exercise to see progression.</Text>;
  }
  const width = 300;
  const height = 120;
  const padding = 18;
  const min = Math.min(...points.map((point) => point.volume));
  const max = Math.max(...points.map((point) => point.volume));
  const range = max - min || 1;
  const coords = points.map((point, index) => ({
    x: padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2),
    y: height - padding - ((point.volume - min) / range) * (height - padding * 2),
  }));

  return (
    <View>
      <Text style={styles.title}>{exerciseName} volume</Text>
      <Svg width={width} height={height}>
        <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={WEB_TOKENS.colors.border} />
        <Polyline points={coords.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke={WEB_TOKENS.colors.primary} strokeWidth={3} />
        {coords.map((point, index) => <Circle key={index} cx={point.x} cy={point.y} r={4} fill={WEB_TOKENS.colors.primary} />)}
      </Svg>
      <Text style={styles.caption}>{points[0].volume} kg → {points[points.length - 1].volume} kg across {points.length} sessions</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.text, marginBottom: WEB_TOKENS.spacing.sm },
  caption: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, fontSize: 12 },
  empty: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted },
});
