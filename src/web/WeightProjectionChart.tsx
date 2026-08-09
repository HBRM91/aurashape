import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import type { WeightProjectionPoint } from '@/src/lib/goalProjection';
import { useIsDark } from '@/src/stores/theme';
import { getWebTokens } from './tokens';

interface ActualWeightPoint {
  date: string;
  weightKg: number;
}

interface WeightProjectionChartProps {
  projection: WeightProjectionPoint[];
  actualEntries: ActualWeightPoint[];
  targetKg: number;
  unitLabel?: string;
}

export function WeightProjectionChart({ projection, actualEntries, targetKg, unitLabel = 'kg' }: WeightProjectionChartProps) {
  const tokens = getWebTokens(useIsDark());
  const allDates = [...projection.map((point) => point.date), ...actualEntries.map((point) => point.date)].sort();
  const weights = [...projection.map((point) => point.weightKg), ...actualEntries.map((point) => point.weightKg), targetKg];
  if (!allDates.length || !weights.length) return null;

  const width = 640;
  const height = 220;
  const pad = 24;
  const minWeight = Math.min(...weights) - 1;
  const maxWeight = Math.max(...weights) + 1;
  const dateIndex = (date: string) => Math.max(0, allDates.indexOf(date));
  const x = (date: string) => pad + (dateIndex(date) / Math.max(1, allDates.length - 1)) * (width - pad * 2);
  const y = (weight: number) => height - pad - ((weight - minWeight) / Math.max(1, maxWeight - minWeight)) * (height - pad * 2);
  const projectionPoints = projection.map((point) => `${x(point.date)},${y(point.weightKg)}`).join(' ');
  const actualPoints = [...actualEntries].sort((a, b) => a.date.localeCompare(b.date)).map((point) => `${x(point.date)},${y(point.weightKg)}`).join(' ');

  return (
    <View accessibilityLabel={`Weight projection. Target ${targetKg} ${unitLabel}. ${actualEntries.length} actual entries and ${projection.length} projected points.`} accessibilityRole="image">
      <View style={styles.legend}>
        <Text style={[styles.title, { color: tokens.colors.text }]}>Weight evolution</Text>
        <Text style={[styles.target, { color: tokens.colors.primary }]}>Target {targetKg.toFixed(1)} {unitLabel}</Text>
      </View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1={pad} y1={y(targetKg)} x2={width - pad} y2={y(targetKg)} stroke={tokens.colors.primary} strokeDasharray="5 5" strokeWidth="1.5" />
        {projectionPoints ? <Polyline points={projectionPoints} fill="none" stroke={tokens.colors.primary} strokeDasharray="7 5" strokeWidth="3" /> : null}
        {actualPoints ? <Polyline points={actualPoints} fill="none" stroke={tokens.colors.text} strokeWidth="3" /> : null}
        {[...actualEntries].sort((a, b) => a.date.localeCompare(b.date)).map((point) => <Circle key={`${point.date}-${point.weightKg}`} cx={x(point.date)} cy={y(point.weightKg)} r="4" fill={tokens.colors.text} />)}
      </Svg>
      <View style={styles.legend}>
        <Text style={[styles.caption, { color: tokens.colors.textMuted }]}>Solid: actual</Text>
        <Text style={[styles.caption, { color: tokens.colors.textMuted }]}>Dashed: projection</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800' },
  target: { fontSize: 13, fontWeight: '700' },
  caption: { fontSize: 12 },
});
