import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { Food, MealSlot } from '@/src/types';
import { WebButton } from './WebButton';
import { WebCard } from './WebCard';
import { WEB_TOKENS } from './tokens';

interface QuickAddSheetProps {
  food: Food;
  onConfirm: (mealSlot: MealSlot, servings: number) => void;
  onClose: () => void;
}

const SLOTS: { slot: MealSlot; label: string }[] = [
  { slot: 'breakfast', label: 'Breakfast' },
  { slot: 'lunch', label: 'Lunch' },
  { slot: 'dinner', label: 'Dinner' },
  { slot: 'snack', label: 'Snack' },
];

const SERVING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export function QuickAddSheet({ food, onConfirm, onClose }: QuickAddSheetProps) {
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('breakfast');
  const [stepIndex, setStepIndex] = useState(1);

  const servings = SERVING_STEPS[stepIndex] ?? 1;
  const totalCals = Math.round(food.calories_per_serving * servings);
  const totalProtein = Math.round(food.protein_g * servings * 10) / 10;
  const totalCarbs = Math.round(food.carbs_g * servings * 10) / 10;
  const totalFat = Math.round(food.fat_g * servings * 10) / 10;

  const handleMinus = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handlePlus = () => {
    if (stepIndex < SERVING_STEPS.length - 1) setStepIndex(stepIndex + 1);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Add to Diary</Text>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Cancel add">
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <WebCard style={styles.foodCard}>
          <Text style={styles.foodName}>{food.name}</Text>
          {food.brand && <Text style={styles.foodBrand}>{food.brand}</Text>}
          <Text style={styles.foodServing}>{food.serving_name}</Text>
        </WebCard>

        <View style={styles.nutritionRow}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{totalCals}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{totalProtein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{totalCarbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{totalFat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Meal</Text>
        <View style={styles.chipRow}>
          {SLOTS.map(({ slot, label }) => (
            <TouchableOpacity
              key={slot}
              style={[styles.chip, selectedSlot === slot && styles.chipActive]}
              onPress={() => setSelectedSlot(slot)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${label}`}
              accessibilityState={{ selected: selectedSlot === slot }}
            >
              <Text style={[styles.chipText, selectedSlot === slot && styles.chipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Servings</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={[styles.stepperBtn, stepIndex === 0 && styles.stepperBtnDisabled]}
            onPress={handleMinus}
            disabled={stepIndex === 0}
            accessibilityRole="button"
            accessibilityLabel="Decrease servings"
          >
            <Text style={[styles.stepperText, stepIndex === 0 && styles.stepperTextDisabled]}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{servings}x</Text>
          <TouchableOpacity
            style={[styles.stepperBtn, stepIndex >= SERVING_STEPS.length - 1 && styles.stepperBtnDisabled]}
            onPress={handlePlus}
            disabled={stepIndex >= SERVING_STEPS.length - 1}
            accessibilityRole="button"
            accessibilityLabel="Increase servings"
          >
            <Text style={[styles.stepperText, stepIndex >= SERVING_STEPS.length - 1 && styles.stepperTextDisabled]}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <WebButton label="Add to Diary" variant="primary" onPress={() => onConfirm(selectedSlot, servings)} />
          <WebButton label="Cancel" variant="ghost" onPress={onClose} />
        </View>
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
    gap: WEB_TOKENS.spacing.md,
    width: '100%',
    maxWidth: 400,
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
  foodCard: {
    gap: 2,
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
  foodServing: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.primary,
  },
  nutritionLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  sectionLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.xs,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  chipText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 12,
  },
  chipTextActive: {
    color: WEB_TOKENS.colors.surface,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: WEB_TOKENS.spacing.md,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WEB_TOKENS.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperText: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.primaryStrong,
  },
  stepperTextDisabled: {
    color: WEB_TOKENS.colors.textMuted,
  },
  stepperValue: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.text,
    minWidth: 50,
    textAlign: 'center',
  },
  actions: {
    gap: WEB_TOKENS.spacing.sm,
    marginTop: WEB_TOKENS.spacing.sm,
  },
});
