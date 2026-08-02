import { useBodyStore } from '@/src/stores/body';

beforeEach(() => {
  useBodyStore.setState({
    weightEntries: [],
    measurements: [],
    photos: [],
  });
});

describe('Body Store - Photos', () => {
  describe('addPhoto', () => {
    it('should add a progress photo', () => {
      useBodyStore.getState().addPhoto({
        uri: 'file://test/photo.jpg',
        date: '2026-03-15',
        type: 'front',
      });
      const photos = useBodyStore.getState().photos;
      expect(photos).toHaveLength(1);
      expect(photos[0].type).toBe('front');
      expect(photos[0].uri).toBe('file://test/photo.jpg');
    });

    it('should include weight if provided', () => {
      useBodyStore.getState().addPhoto({
        uri: 'file://test/photo.jpg',
        date: '2026-03-15',
        type: 'side',
        weightKg: 75,
      });
      expect(useBodyStore.getState().photos[0].weightKg).toBe(75);
    });

    it('should assign unique IDs', () => {
      useBodyStore.getState().addPhoto({ uri: 'a', date: '2026-01-01', type: 'front' });
      useBodyStore.getState().addPhoto({ uri: 'b', date: '2026-01-02', type: 'back' });
      const ids = useBodyStore.getState().photos.map((p) => p.id);
      expect(ids[0]).not.toBe(ids[1]);
    });
  });

  describe('removePhoto', () => {
    it('should remove a photo by ID', () => {
      useBodyStore.getState().addPhoto({ uri: 'a', date: '2026-01-01', type: 'front' });
      useBodyStore.getState().addPhoto({ uri: 'b', date: '2026-01-02', type: 'back' });
      const id = useBodyStore.getState().photos[0].id;
      useBodyStore.getState().removePhoto(id);
      expect(useBodyStore.getState().photos).toHaveLength(1);
    });
  });

  describe('getPhotosByDate', () => {
    it('should return photos for a specific date', () => {
      useBodyStore.getState().addPhoto({ uri: 'a', date: '2026-03-15', type: 'front' });
      useBodyStore.getState().addPhoto({ uri: 'b', date: '2026-03-15', type: 'side' });
      useBodyStore.getState().addPhoto({ uri: 'c', date: '2026-03-16', type: 'back' });

      const dayPhotos = useBodyStore.getState().getPhotosByDate('2026-03-15');
      expect(dayPhotos).toHaveLength(2);
      expect(dayPhotos.map((p) => p.type).sort()).toEqual(['front', 'side']);
    });

    it('should return empty array for date with no photos', () => {
      const photos = useBodyStore.getState().getPhotosByDate('2099-01-01');
      expect(photos).toHaveLength(0);
    });
  });

  describe('weight entries', () => {
    it('should still add weight entries', () => {
      useBodyStore.getState().addWeight({ date: '2026-03-15', weightKg: 80 });
      expect(useBodyStore.getState().weightEntries).toHaveLength(1);
    });

    it('should still remove weight entries', () => {
      useBodyStore.getState().addWeight({ date: '2026-03-15', weightKg: 80 });
      const id = useBodyStore.getState().weightEntries[0].id;
      useBodyStore.getState().removeWeight(id);
      expect(useBodyStore.getState().weightEntries).toHaveLength(0);
    });
  });
});
