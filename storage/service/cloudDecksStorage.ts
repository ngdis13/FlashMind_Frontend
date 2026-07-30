import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Структура кэша одного превью облачной колоды.
 * Аналог DecksStorageState, но для отдельной облачной колоды.
 * Использует ту же модель: isActual + expiresAt.
 */
export interface CloudDeckPreviewCache {
  isActual: boolean; 
  expiresAt: number; 
  data: unknown; 
}

const STORAGE_PREFIX = '@flashcards/cloud_deck_preview';

const getKey = (cloudDeckId: string) => `${STORAGE_PREFIX}_${cloudDeckId}`;

/**
 * Сохранить превью облачной колоды в AsyncStorage
 */
export const saveCloudDeckPreview = async (
  cloudDeckId: string,
  cache: CloudDeckPreviewCache,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(getKey(cloudDeckId), JSON.stringify(cache));
    console.log(
      `💾 [CloudCache] Превью колоды ${cloudDeckId} сохранено на диск (expiresAt: ${new Date(cache.expiresAt).toLocaleTimeString()})`,
    );
  } catch (error) {
    console.error('Ошибка сохранения превью облачной колоды:', error);
  }
};

/**
 * Загрузить превью облачной колоды из AsyncStorage
 */
export const loadCloudDeckPreview = async (
  cloudDeckId: string,
): Promise<CloudDeckPreviewCache | null> => {
  try {
    const json = await AsyncStorage.getItem(getKey(cloudDeckId));
    if (!json) return null;

    const data = JSON.parse(json);

    // Валидация структуры (как в decksStorage.ts)
    if (
      typeof data.isActual !== 'boolean' ||
      typeof data.expiresAt !== 'number'
    ) {
      console.log(
        `⚠️ [CloudCache] Битый формат для колоды ${cloudDeckId}, удаляю`,
      );
      await AsyncStorage.removeItem(getKey(cloudDeckId));
      return null;
    }

    return data as CloudDeckPreviewCache;
  } catch (error) {
    console.error('Ошибка загрузки превью облачной колоды:', error);
    return null;
  }
};

/**
 * Удалить превью облачной колоды из AsyncStorage
 */
export const removeCloudDeckPreview = async (
  cloudDeckId: string,
): Promise<void> => {
  try {
    await AsyncStorage.removeItem(getKey(cloudDeckId));
    console.log(`🗑️ [CloudCache] Превью колоды ${cloudDeckId} удалено с диска`);
  } catch (error) {
    console.error('Ошибка удаления превью облачной колоды:', error);
  }
};
