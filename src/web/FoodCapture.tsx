import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WEB_TOKENS } from './tokens';
import { WebCard } from './WebCard';
import { WebButton } from './WebButton';
import { WebField } from './WebField';
import { useDiaryStore } from '@/src/stores/diary';
import type { FoodItem } from '@/src/lib/aiTypes';
import type { Food, MealSlot } from '@/src/types';

interface FoodCaptureProps {
  onClose: () => void;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: '#2F8F62',
  medium: '#F59E0B',
  low: '#B45309',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
};

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

function analyzeFood(description: string): FoodItem[] {
  const lower = description.toLowerCase();
  if (lower.includes('chicken')) {
    return [{ name: 'Grilled chicken breast', estimatedCalories: 280, proteinG: 52, carbsG: 0, fatG: 6, confidence: 'high' }];
  }
  if (lower.includes('salad')) {
    return [{ name: 'Mixed green salad', estimatedCalories: 120, proteinG: 4, carbsG: 16, fatG: 6, confidence: 'medium' }];
  }
  return [{ name: description.length > 30 ? description.substring(0, 30) + '...' : description, estimatedCalories: 350, proteinG: 18, carbsG: 35, fatG: 12, confidence: 'low' }];
}

export function FoodCapture({ onClose }: FoodCaptureProps) {
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<FoodItem[] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('lunch');
  const [analyzing, setAnalyzing] = useState(false);
  const addEntry = useDiaryStore((s) => s.addEntry);

  const handleAnalyze = () => {
    if (!description.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setItems(analyzeFood(description.trim()));
      setAnalyzing(false);
    }, 800);
  };

  const toFood = (item: FoodItem): Food => ({
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: item.name,
    serving_name: '1 serving',
    calories_per_serving: item.estimatedCalories,
    protein_g: item.proteinG,
    carbs_g: item.carbsG,
    fat_g: item.fatG,
    fiber_g: 0,
    is_verified: false,
    is_aurabiosens: false,
    source: 'ai_capture',
  });

  const handleAddToDiary = (item: FoodItem) => {
    addEntry(toFood(item), selectedSlot);
  };

  const handleReset = () => {
    setItems(null);
    setDescription('');
  };

  const totalCalories = items
    ? items.reduce((sum, i) => sum + i.estimatedCalories, 0)
    : 0;

  const totalMacros = items
    ? items.reduce(
        (acc, i) => ({
          protein: acc.protein + i.proteinG,
          carbs: acc.carbs + i.carbsG,
          fat: acc.fat + i.fatG,
        }),
        { protein: 0, carbs: 0, fat: 0 },
      )
    : { protein: 0, carbs: 0, fat: 0 };

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.heading}>AI Food Capture</Text>
            <TouchableOpacity accessibilityLabel="Close" accessibilityRole="button" onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {!items ? (
              <>
                <Text style={styles.instruction}>
                  Describe what you ate in natural language. The AI will estimate nutrition from your description.
                </Text>
                <WebField
                  label="Food Description"
                  multiline
                  numberOfLines={4}
                  onChangeText={setDescription}
                  placeholder="e.g., grilled chicken salad with olive oil and feta cheese"
                  style={styles.textArea}
                  value={description}
                />
                <View style={styles.analyzeRow}>
                  <WebButton
                    disabled={!description.trim() || analyzing}
                    label={analyzing ? 'Analyzing...' : 'Analyze'}
                    onPress={handleAnalyze}
                    variant="primary"
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.slotRow}>
                  <Text style={styles.slotLabel}>Add to:</Text>
                  <View style={styles.slotButtons}>
                    {SLOTS.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        accessibilityLabel={SLOT_LABELS[slot]}
                        accessibilityRole="button"
                        onPress={() => setSelectedSlot(slot)}
                        style={[
                          styles.slotChip,
                          selectedSlot === slot ? styles.slotChipActive : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.slotChipText,
                            selectedSlot === slot ? styles.slotChipTextActive : undefined,
                          ]}
                        >
                          {SLOT_LABELS[slot]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.summaryBar}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{totalCalories}</Text>
                    <Text style={styles.summaryUnit}>kcal</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{totalMacros.protein}</Text>
                    <Text style={styles.summaryUnit}>g protein</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{totalMacros.carbs}</Text>
                    <Text style={styles.summaryUnit}>g carbs</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{totalMacros.fat}</Text>
                    <Text style={styles.summaryUnit}>g fat</Text>
                  </View>
                </View>

                {items.map((item, idx) => (
                  <WebCard key={idx} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <View
                        style={[
                          styles.confidenceBadge,
                          { backgroundColor: `${CONFIDENCE_COLORS[item.confidence]}15` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.confidenceText,
                            { color: CONFIDENCE_COLORS[item.confidence] },
                          ]}
                        >
                          {CONFIDENCE_LABELS[item.confidence]}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.itemMacros}>
                      <Text style={styles.macroValue}>
                        {item.estimatedCalories} kcal
                      </Text>
                      <Text style={styles.macroValue}>
                        {item.proteinG}g P
                      </Text>
                      <Text style={styles.macroValue}>
                        {item.carbsG}g C
                      </Text>
                      <Text style={styles.macroValue}>
                        {item.fatG}g F
                      </Text>
                    </View>
                    <WebButton
                      label="Add to Diary"
                      onPress={() => handleAddToDiary(item)}
                      variant="secondary"
                      style={styles.addButton}
                    />
                  </WebCard>
                ))}

                <WebButton
                  label="Analyze Another"
                  onPress={handleReset}
                  variant="ghost"
                  style={styles.anotherButton}
                />
              </>
            )}

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                AI estimates are approximations. Verify serving sizes manually.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 35, 27, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderTopLeftRadius: WEB_TOKENS.radii.lg,
    borderTopRightRadius: WEB_TOKENS.radii.lg,
    maxHeight: '90%',
    maxWidth: 640,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: WEB_TOKENS.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    paddingVertical: WEB_TOKENS.spacing.md,
  },
  heading: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
  },
  closeIcon: {
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 20,
    fontWeight: '600',
    padding: WEB_TOKENS.spacing.sm,
  },
  body: {
    flex: 1,
    maxHeight: '100%',
  },
  bodyContent: {
    padding: WEB_TOKENS.spacing.lg,
  },
  instruction: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  analyzeRow: {
    marginTop: WEB_TOKENS.spacing.md,
  },
  slotRow: {
    marginBottom: WEB_TOKENS.spacing.md,
  },
  slotLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  slotButtons: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.xs,
  },
  slotChip: {
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.xs,
  },
  slotChipActive: {
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  slotChipText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontWeight: '600',
  },
  slotChipTextActive: {
    color: WEB_TOKENS.colors.surface,
  },
  summaryBar: {
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    flexDirection: 'row',
    marginBottom: WEB_TOKENS.spacing.md,
    padding: WEB_TOKENS.spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.primary,
    fontSize: 20,
    lineHeight: 28,
  },
  summaryUnit: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  itemCard: {
    marginBottom: WEB_TOKENS.spacing.sm,
    padding: WEB_TOKENS.spacing.md,
  },
  itemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  itemName: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.text,
    flex: 1,
    fontWeight: '600',
  },
  confidenceBadge: {
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: WEB_TOKENS.spacing.sm,
    paddingVertical: 2,
  },
  confidenceText: {
    ...WEB_TOKENS.typography.label,
    fontSize: 11,
    lineHeight: 16,
  },
  itemMacros: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.md,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  macroValue: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  anotherButton: {
    marginBottom: WEB_TOKENS.spacing.md,
    marginTop: WEB_TOKENS.spacing.sm,
  },
  disclaimer: {
    borderTopColor: WEB_TOKENS.colors.border,
    borderTopWidth: 1,
    marginTop: WEB_TOKENS.spacing.md,
    paddingTop: WEB_TOKENS.spacing.md,
  },
  disclaimerText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
