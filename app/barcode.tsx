import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { COLORS } from '@/src/constants/theme';
import { getFoodByBarcode } from '@/src/lib/foodApi';
import { captureError } from '@/src/lib/sentry';
import { useDiaryStore } from '@/src/stores/diary';
import type { MealSlot } from '@/src/types';
import { X, Flashlight } from 'phosphor-react-native';

export default function BarcodeScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [torch, setTorch] = useState(false);
  const { addEntry } = useDiaryStore();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      const food = await getFoodByBarcode(data);
      if (food) {
        const mealSlots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
        Alert.alert(
          'Food Found',
          `${food.name}\n${food.calories_per_serving} kcal per ${food.serving_name}\n\nAdd to which meal?`,
          [
            ...mealSlots.map((slot) => ({
              text: slot.charAt(0).toUpperCase() + slot.slice(1),
              onPress: () => {
                addEntry(food, slot);
                router.back();
              },
            })),
            { text: 'Skip', style: 'cancel' as const, onPress: () => { setScanned(false); setLoading(false); } },
          ]
        );
      } else {
        Alert.alert(
          'Not Found',
          `Barcode ${data} not found in database.`,
          [
            { text: 'Try Again', onPress: () => { setScanned(false); setLoading(false); } },
            {
              text: 'Add Manually',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (err) {
      captureError(err as Error, { barcode: data });
      Alert.alert('Error', 'Failed to look up barcode. Please try again.');
      setScanned(false);
      setLoading(false);
    }
  }, [scanned, loading, addEntry]);

  if (!permission?.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-white text-lg font-bold mb-4">Camera Access Needed</Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="px-8 py-3 rounded-xl"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-white font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        className="flex-1"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        enableTorch={torch}
      >
        <View className="flex-1 justify-between">
          <View className="flex-row justify-between px-6 pt-14">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
            >
              <X size={22} color="white" weight="bold" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTorch(!torch)}
              className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
            >
              <Flashlight size={20} color={torch ? '#FACC15' : 'white'} weight="fill" />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-20">
            <View className="w-64 h-64 border-2 border-white/40 rounded-3xl items-center justify-center">
              <View className="absolute -top-1 left-0 w-8 h-1 bg-white rounded-full" />
              <View className="absolute -top-1 right-0 w-8 h-1 bg-white rounded-full" />
              <View className="absolute -bottom-1 left-0 w-8 h-1 bg-white rounded-full" />
              <View className="absolute -bottom-1 right-0 w-8 h-1 bg-white rounded-full" />
              {loading && <ActivityIndicator size="large" color="white" />}
              {!loading && (
                <Text className="text-white/60 text-sm mt-16">Point camera at barcode</Text>
              )}
            </View>
          </View>

          <View className="pb-12 items-center">
            <Text className="text-white/40 text-xs">Supports EAN-13, UPC-A, EAN-8</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
