import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { getFoodByBarcode } from '@/src/lib/foodApi';
import type { Food } from '@/src/types';
import { WebButton } from './WebButton';
import { WebCard } from './WebCard';
import { WEB_TOKENS } from './tokens';

interface BarcodeLookupSheetProps {
  onSelect: (food: Food) => void;
  onClose: () => void;
}

export function BarcodeLookupSheet({ onSelect, onClose }: BarcodeLookupSheetProps) {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [food, setFood] = useState<Food | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = async () => {
    if (!barcode.trim()) return;
    setLoading(true);
    setError(false);
    setFood(null);
    setNotFound(false);
    try {
      const result = await getFoodByBarcode(barcode.trim());
      if (result) {
        setFood(result);
      } else {
        setNotFound(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Look Up Barcode</Text>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close barcode lookup">
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>Enter the barcode number from the product packaging.</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 3017620422003"
          placeholderTextColor={WEB_TOKENS.colors.textMuted}
          value={barcode}
          onChangeText={setBarcode}
          keyboardType="numeric"
          autoFocus
          accessibilityLabel="Barcode number"
        />

        <WebButton
          label="Look Up"
          variant="primary"
          onPress={handleLookup}
          disabled={!barcode.trim() || loading}
        />

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color={WEB_TOKENS.colors.primary} />
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Could not look up barcode. Try again.</Text>
          </View>
        )}

        {notFound && (
          <View style={styles.centered}>
            <Text style={styles.stateText}>Not found</Text>
          </View>
        )}

        {food && (
          <WebCard style={styles.resultCard}>
            <Text style={styles.foodName}>{food.name}</Text>
            {food.brand && <Text style={styles.foodBrand}>{food.brand}</Text>}
            <Text style={styles.foodCal}>{Math.round(food.calories_per_serving)} cal per serving</Text>
            <View style={styles.macros}>
              <Text style={styles.macro}>Protein: {food.protein_g}g</Text>
              <Text style={styles.macro}>Carbs: {food.carbs_g}g</Text>
              <Text style={styles.macro}>Fat: {food.fat_g}g</Text>
            </View>
            <View style={styles.addBtnWrap}>
              <WebButton label="Add Food" variant="primary" onPress={() => onSelect(food)} />
            </View>
          </WebCard>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: WEB_TOKENS.spacing.lg,
  },
  sheet: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRadius: WEB_TOKENS.radii.lg,
    padding: WEB_TOKENS.spacing.lg,
    width: '100%',
    maxWidth: 400,
    gap: WEB_TOKENS.spacing.md,
    ...WEB_TOKENS.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
  },
  closeBtn: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.textMuted,
    padding: WEB_TOKENS.spacing.xs,
  },
  hint: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  input: {
    ...WEB_TOKENS.typography.body,
    backgroundColor: WEB_TOKENS.colors.page,
    borderColor: WEB_TOKENS.colors.border,
    borderRadius: WEB_TOKENS.radii.sm,
    borderWidth: 2,
    color: WEB_TOKENS.colors.text,
    minHeight: 48,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: WEB_TOKENS.spacing.sm,
  },
  stateText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  errorText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.error,
  },
  resultCard: {
    gap: WEB_TOKENS.spacing.xs,
  },
  foodName: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
  },
  foodBrand: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  foodCal: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primary,
  },
  macros: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    flexWrap: 'wrap',
  },
  macro: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  addBtnWrap: {
    marginTop: WEB_TOKENS.spacing.sm,
  },
});
