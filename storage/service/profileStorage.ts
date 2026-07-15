import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@/store/userStore";

export interface ProfileStorageState {
  isActual: boolean;
  expiresAt: number;
  profile: UserProfile | null;
}

export const STORAGE_KEYS = {
  PROFILE: "@profile",
};

/**
 * Вспомогательная функция расчетаточки 00:10
 * @returns
 */
export const calculateProfileExpiryTime = (): number => {
  const now = new Date();
  const target = new Date();

  target.setHours(0, 10, 0, 0);

  //Если текущее время устройства уже перевалило за 00:10,
  //рассчитываем точку 00:10 на следующие сутки
  if (now.getTime() >= target.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime();
};

// Функция сохранения профиля
export const saveProfile = async (
  storageData: ProfileStorageState,
): Promise<void> => {
  try {
    // Строгая валидация входящих данных перед записью
    if (
      !storageData ||
      typeof storageData.isActual !== "boolean" ||
      typeof storageData.expiresAt !== "number" ||
      (storageData.profile !== null && typeof storageData.profile !== "object")
    ) {
      throw new Error(
        "[Storage CRITICAL] Попытка записать неверный формат структуры профиля на диск!",
      );
    }

    const jsonValue = JSON.stringify(storageData);
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, jsonValue);
  } catch (error) {
    console.error("Ошибка при сохранении профиля в AsyncStorage:", error);
    throw error;
  }
};

//Функция загрузки профиля с диска
export const loadProfile = async (): Promise<ProfileStorageState | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    if (jsonValue === null) {
      return null;
    }

    const data = JSON.parse(jsonValue);
    // Защитная проверка структуры: если данные повреждены, удаляем ключ
    if (
      !data ||
      typeof data.isActual !== "boolean" ||
      typeof data.expiresAt !== "number" ||
      (data.profile !== null && typeof data.profile !== "object")
    ) {
      await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE);
      return null;
    }
    return data as ProfileStorageState;
  } catch (error) {
    console.error("Ошибка при загрузке профиля из AsyncStorage:", error);
    return null;
  }
};

// 4. Функция обновления полей профиля на диске 
export const updateProfileInStorage = async (
  updatedFields: Partial<UserProfile>,
): Promise<UserProfile | null> => {
  try {
    const currentStorageState = await loadProfile();

    // Если на диске ничего нет, обновлять нечего
    if (!currentStorageState || !currentStorageState.profile) return null;

    const updatedProfile: UserProfile = {
      ...currentStorageState.profile,
      ...updatedFields,
    };

    // При изменении полей сохраняем старыеexpiresAt и isActual, если они валидны
    const newStorageState: ProfileStorageState = {
      ...currentStorageState,
      profile: updatedProfile,
    };

    await saveProfile(newStorageState);
    return updatedProfile;
  } catch (error) {
    console.error(
      "Ошибка при частичном обновлении профиля в AsyncStorage:",
      error,
    );
    throw error;
  }
};


// 5. Функция принудительной инвалидации профиля на диске
export const invalidateProfileInStorage = async (): Promise<void> => {
  try {
    const currentStorageState = await loadProfile();
    if (!currentStorageState) return;

    const newStorageState: ProfileStorageState = {
      ...currentStorageState,
      isActual: false // Жестко сбрасываем актуальность
    };

    await saveProfile(newStorageState);
    console.log('[Storage] Профиль на диске успешно переведен в статус неактуального');
  } catch (error) {
    console.error('Ошибка при инвалидации профиля в AsyncStorage:', error);
    throw error;
  }
};