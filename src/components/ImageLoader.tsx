import { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, Text } from 'react-native';
import { searchPhotos, getExerciseQuery, type UnsplashPhoto } from '@/src/lib/unsplash';

export function ExerciseImage({ exerciseName, size = 80 }: { exerciseName: string; size?: number }) {
  const [photo, setPhoto] = useState<UnsplashPhoto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const query = getExerciseQuery(exerciseName);
    searchPhotos(query, 1).then((results) => {
      if (!cancelled && results.length > 0) setPhoto(results[0]);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [exerciseName]);

  if (loading) {
    return (
      <View style={{ width: size, height: size, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="small" color="#D1D5DB" />
      </View>
    );
  }

  if (photo) {
    return (
      <Image
        source={{ uri: photo.thumb }}
        style={{ width: size, height: size, borderRadius: 12 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={{ width: size, height: size, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.35 }}>🏋️</Text>
    </View>
  );
}

export function FoodImage({ foodName, size = 56 }: { foodName: string; size?: number }) {
  const [photo, setPhoto] = useState<UnsplashPhoto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    searchPhotos(`${foodName} food`, 1).then((results) => {
      if (!cancelled && results.length > 0) setPhoto(results[0]);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [foodName]);

  if (loading) {
    return (
      <View style={{ width: size, height: size, borderRadius: 10, backgroundColor: '#F3F4F6' }} />
    );
  }

  if (photo) {
    return (
      <Image
        source={{ uri: photo.thumb }}
        style={{ width: size, height: size, borderRadius: 10 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={{ width: size, height: size, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.4 }}>🍽️</Text>
    </View>
  );
}
