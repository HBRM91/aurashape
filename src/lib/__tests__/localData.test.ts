import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearLocalUserData, LOCAL_USER_STORAGE_KEYS } from '../localData';

describe('local user data', () => {
  it('clears every persisted user-data store', async () => {
    await clearLocalUserData();

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(LOCAL_USER_STORAGE_KEYS);
  });
});
