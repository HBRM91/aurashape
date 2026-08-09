import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WEB_TOKENS } from './tokens';

interface RestTimerProps {
  initialSeconds?: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

export function formatRestTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function playCompletionBeep(): void {
  if (typeof Audio === 'undefined') return;
  const audio = new Audio('data:audio/wav;base64,UklGRlYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTIAAAAAAP8AAP//AAD//wAA');
  void audio.play().catch(() => undefined);
}

export function RestTimer({ initialSeconds = 60, autoStart = false, onComplete }: RestTimerProps) {
  const [duration, setDuration] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setRunning(false);
          playCompletionBeep();
          onComplete?.();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, onComplete]);

  const chooseDuration = (seconds: number) => {
    setDuration(seconds);
    setRemaining(seconds);
    setRunning(false);
  };

  const reset = () => {
    setRemaining(duration);
    setRunning(false);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>Rest Timer</Text>
        <Text style={styles.time}>{remaining === 0 ? 'Done' : formatRestTime(remaining)}</Text>
      </View>
      <View style={styles.presets}>
        {[30, 60, 90, 120].map((seconds) => (
          <TouchableOpacity
            key={seconds}
            accessibilityRole="button"
            accessibilityLabel={`${seconds} second rest`}
            onPress={() => chooseDuration(seconds)}
            style={[styles.preset, duration === seconds ? styles.presetActive : undefined]}
          >
            <Text style={[styles.presetText, duration === seconds ? styles.presetTextActive : undefined]}>
              {seconds}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={running ? 'Pause rest timer' : 'Start rest timer'}
          onPress={() => setRunning((active) => !active)}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryText}>{running ? 'Pause' : remaining === 0 ? 'Start again' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Reset rest timer" onPress={reset} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: WEB_TOKENS.colors.surfaceMuted, borderRadius: WEB_TOKENS.radii.md, padding: WEB_TOKENS.spacing.md },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.text },
  time: { ...WEB_TOKENS.typography.heading, color: WEB_TOKENS.colors.primary, fontSize: 24, lineHeight: 32 },
  presets: { flexDirection: 'row', gap: WEB_TOKENS.spacing.xs, marginTop: WEB_TOKENS.spacing.sm },
  preset: { borderColor: WEB_TOKENS.colors.border, borderRadius: WEB_TOKENS.radii.pill, borderWidth: 1, paddingHorizontal: WEB_TOKENS.spacing.sm, paddingVertical: 4 },
  presetActive: { backgroundColor: WEB_TOKENS.colors.primary, borderColor: WEB_TOKENS.colors.primary },
  presetText: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.textMuted, fontSize: 12 },
  presetTextActive: { color: WEB_TOKENS.colors.surface },
  actions: { flexDirection: 'row', gap: WEB_TOKENS.spacing.sm, marginTop: WEB_TOKENS.spacing.md },
  primaryButton: { backgroundColor: WEB_TOKENS.colors.primary, borderRadius: WEB_TOKENS.radii.pill, flex: 1, paddingVertical: WEB_TOKENS.spacing.sm },
  primaryText: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.surface, textAlign: 'center' },
  resetButton: { borderColor: WEB_TOKENS.colors.border, borderRadius: WEB_TOKENS.radii.pill, borderWidth: 1, paddingHorizontal: WEB_TOKENS.spacing.md, paddingVertical: WEB_TOKENS.spacing.sm },
  resetText: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.primaryStrong },
});
