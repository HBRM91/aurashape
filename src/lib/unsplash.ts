const UNSPLASH_API = 'https://api.unsplash.com';

function getKey(): string {
  return process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || '';
}

export interface UnsplashPhoto {
  id: string;
  url: string;
  thumb: string;
  author: string;
  description: string;
}

export async function searchPhotos(query: string, count = 5): Promise<UnsplashPhoto[]> {
  const key = getKey();
  if (!key) return [];

  try {
    const res = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    const data = await res.json();
    return (data.results || []).map((r: any) => ({
      id: r.id,
      url: r.urls.regular,
      thumb: r.urls.thumb,
      author: r.user.name,
      description: r.alt_description || r.description || '',
    }));
  } catch {
    return [];
  }
}

export async function getRandomPhoto(query: string): Promise<UnsplashPhoto | null> {
  const key = getKey();
  if (!key) return null;

  try {
    const res = await fetch(
      `${UNSPLASH_API}/photos/random?query=${encodeURIComponent(query)}&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    const r = await res.json();
    if (!r.id) return null;
    return {
      id: r.id,
      url: r.urls.regular,
      thumb: r.urls.thumb,
      author: r.user.name,
      description: r.alt_description || r.description || '',
    };
  } catch {
    return null;
  }
}

const exerciseQueryMap: Record<string, string> = {
  pushups: 'push-up exercise',
  pullups: 'pull-up exercise',
  squats: 'squat exercise gym',
  deadlift: 'deadlift gym',
  bench: 'bench press',
  curls: 'bicep curl',
  plank: 'plank exercise',
  burpees: 'burpee workout',
  yoga: 'yoga stretch',
  running: 'running fitness',
  cycling: 'cycling exercise',
  swimming: 'swimming fitness',
  dumbbell: 'dumbbell workout',
  barbell: 'barbell gym',
  cardio: 'cardio workout',
  stretching: 'stretching exercise',
};

export function getExerciseQuery(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  for (const [key, query] of Object.entries(exerciseQueryMap)) {
    if (name.includes(key)) return query;
  }
  return `${exerciseName} exercise fitness`;
}
