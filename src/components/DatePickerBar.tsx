import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useDiaryStore } from '@/src/stores/diary';

function formatDate(dateStr: string): { dayName: string; day: string; month: string } {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
    day: String(d.getDate()),
    month: d.toLocaleDateString('en-US', { month: 'short' }),
  };
}

function getPastDates(today: string, count: number): string[] {
  const d = new Date(today + 'T00:00:00');
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    dates.unshift(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() - 1);
  }
  return dates;
}

export function DatePickerBar() {
  const { selectedDate, setDate } = useDiaryStore();
  const today = new Date().toISOString().slice(0, 10);
  const dates = getPastDates(today, 14);

  return (
    <View className="px-4 py-3 bg-white border-b border-gray-100">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {dates.map((d) => {
          const { dayName, day, month } = formatDate(d);
          const isSelected = d === selectedDate;
          const isToday = d === today;
          return (
            <TouchableOpacity
              key={d}
              onPress={() => setDate(d)}
              className={`items-center px-3 py-2 mx-1 rounded-xl min-w-[52] ${
                isSelected ? 'bg-green-500' : 'bg-gray-50'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? 'text-white' : isToday ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {dayName}
              </Text>
              <Text
                className={`text-lg font-bold ${
                  isSelected ? 'text-white' : isToday ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {day}
              </Text>
              <Text
                className={`text-xs ${
                  isSelected ? 'text-green-100' : 'text-gray-400'
                }`}
              >
                {month}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
