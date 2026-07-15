import { updateUserProfile } from "@/feature/onboarding/api/onboarding.api";
import { ProfileResponse } from "@/feature/onboarding/types/api.types";
import { getUserProfile } from "@/feature/profile/api/profile.api";
import { create } from "zustand";

import {
  saveProfile,
  loadProfile,
  ProfileStorageState,
  calculateProfileExpiryTime,
  invalidateProfileInStorage,
} from "@/storage/service/profileStorage";

export type UserProfile = {
  id?: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatarUrl: string | null;
  avatarFile?: {
    uri: string;
    name: string;
    type: string;
  } | null;
  review_series: number;
  total_reviews: number;
  max_review_series: number;
  daily_review_counts: {
    [date: string]: number;
  };
};

/**
 * Состояние стора пользователя
 * @typedef {Object} UserState
 * @property {UserProfile | null} user - Данные профиля пользователя
 * @property {boolean} isLoading - Флаг загрузки данных
 * @property {string | null} error - Сообщение об ошибке
 * @property {number | null} lastFetched - Временная метка последнего обновления
 */
type UserState = {
  user: UserProfile | null;

  isLoading: boolean; // добавим для отслеживания загрузки
  error: string | null; // добавим для ошибок
  lastFetched: number | null;

  isActual: boolean;
  expiresAt: number | null;

  /**
   * Устанавливает данные пользователя
   * @param {UserProfile} user - Данные пользователя
   */
  setUser: (user: UserProfile) => void;

  /**
   * Частично обновляет профиль пользователя
   * @param {Partial<UserProfile>} data - Объект с обновляемыми полями
   */
  updateProfile: (data: Partial<UserProfile>) => void;

  /**
   * Устанавливает URL аватара
   * @param {string} uri - URL аватара
   */
  setAvatar: (uri: string) => void;

  /**
   * Устанавливает локальный файл аватара для загрузки
   * @param {string} uri - Локальный URI файла
   */
  setAvatarFile: (uri: string) => void;

  /**
   * Очищает данные пользователя
   */
  clearUser: () => void;

  /**
   * Загружает профиль пользователя с сервера
   * @param {boolean} [force=false] - Принудительная загрузка, игнорируя кэш
   * @returns {Promise<void>}
   */
  fetchUser: () => Promise<void>;

  /**
   * Отправляет данные онбординга на сервер
   * @returns {Promise<ProfileResponse>} Ответ сервера с обновленными данными
   * @throws {Error} Если нет данных пользователя или ошибка отправки
   */
  submitOnbordingData: () => Promise<ProfileResponse>;
  updateAvatar: (uri: string) => Promise<ProfileResponse>;

  loadFromStorage: () => Promise<void>;
  invalidateProfile: () => Promise<void>;

  incrementDailyReviews: () => Promise<void>;
};

/**
 * Store для управления состоянием пользователя
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<UserState>>}
 *
 * @example
 * // Получение данных пользователя
 * const { user, isLoading } = useUserStore();
 *
 * @example
 * // Загрузка профиля
 * await useUserStore.getState().fetchUser();
 *
 * @example
 * // Обновление профиля
 * useUserStore.getState().updateProfile({ firstName: "Новое имя" });
 *
 * @example
 * // Установка аватара для загрузки
 * useUserStore.getState().setAvatarFile("file://path/to/image.jpg");
 *
 * @example
 * // Отправка данных онбординга
 * try {
 *   const response = await useUserStore.getState().submitOnbordingData();
 *   console.log('Онбординг завершен', response);
 * } catch (error) {
 *   console.error('Ошибка', error);
 * }
 */

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  isActual: false,
  expiresAt: null,

  setUser: (user) => {
    const expiresAt = calculateProfileExpiryTime();
    const storageData: ProfileStorageState = {
      isActual: true,
      expiresAt: expiresAt,
      profile: user,
    };

    saveProfile(storageData).catch((err) => {
      console.error("Ошибка сохранения профиля на диск", err);
    });
    set({
      user,
      lastFetched: Date.now(),
      isActual: true,
      expiresAt: expiresAt,
    });
  },

  loadFromStorage: async () => {
    console.log("📂 Загружаем профиль с диска...");
    try {
      const storageData = await loadProfile();

      if (storageData && storageData.profile) {
        console.log("✅ Профиль загружен с диска:", {
          firstName: storageData.profile.firstName,
          isActual: storageData.isActual,
          expiresAt: new Date(storageData.expiresAt).toLocaleString(),
        });

        set({
          user: storageData.profile,
          isActual: storageData.isActual,
          expiresAt: storageData.expiresAt,
          lastFetched: Date.now(),
        });
      } else {
        console.log("ℹ️ Профиль на диске не найден");
      }
    } catch (error) {
      console.error("❌ Ошибка загрузки профиля с диска:", error);
    }
  },
  invalidateProfile: async () => {
    console.log("🔄 Инвалидация профиля...");

    const state = get();

    // Если профиля нет в памяти, ничего не делаем
    if (!state.user) {
      console.log("ℹ️ Профиль не найден в памяти, инвалидация пропущена");
      return;
    }

    try {
      // 1. Инвалидируем на диске
      await invalidateProfileInStorage();

      // 2. Обновляем состояние в памяти
      set({
        isActual: false,
        // user и expiresAt остаются нетронутыми
      });

      console.log("✅ Профиль успешно инвалидирован (isActual: false)");
    } catch (error) {
      console.error("❌ Ошибка при инвалидации профиля:", error);
      throw error;
    }
  },

  fetchUser: async (force = false) => {
    const state = get();

    // 👇 ВАЖНО: Проверяем ВСЕ условия
    const shouldFetch =
      force ||
      !state.user ||
      !state.isActual ||
      (state.expiresAt && Date.now() >= state.expiresAt);

    if (!shouldFetch) {
      console.log("💾 Данные валидны, используем кэш, запрос не делаем");
      return; // 👈 ВОЗВРАЩАЕМСЯ, НЕ ДЕЛАЕМ ЗАПРОС
    }

    if (state.isLoading) {
      console.log("⏳ Уже загружается...");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log("🌐 Загружаем свежие данные с сервера...");
      const response = await getUserProfile();

      const mappedUserProfile: UserProfile = {
        id: response.user_id,
        firstName: response.first_name || "Star",
        lastName: response.last_name || "1234",
        bio: response.bio || "О себе",
        avatarUrl: response.avatar_url || null,
        review_series: response.review_series ?? 0,
        total_reviews: response.total_reviews ?? 0,
        max_review_series: response.max_review_series ?? 0,
        daily_review_counts: response.daily_review_counts || {},
      };

      // Сохраняем через setUser (это установит isActual: true и expiresAt)
      get().setUser(mappedUserProfile);

      console.log("✅ Профиль обновлен и сохранен на диск");
    } catch (err) {
      console.error("❌ Ошибка загрузки профиля:", err);
      set({
        error: err instanceof Error ? err.message : "Ошибка загрузки профиля",
        isLoading: false,
      });
      throw err;
    }
  },

  updateProfile: (data) => {
    const state = get();
    if (!state.user) {
      const newUser = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        bio: data.bio || "",
        avatarUrl: data.avatarUrl || null,
        review_series: 0,
        total_reviews: 0,
        max_review_series: 0,
        daily_review_counts: {},
        ...data,
      };
      const expiresAt = calculateProfileExpiryTime();
      const storageData: ProfileStorageState = {
        isActual: true,
        expiresAt: expiresAt,
        profile: newUser,
      };

      saveProfile(storageData).catch((err) => {
        console.error("Ошибка сохранения профиля на диск", err);
      });

      set({
        user: newUser,
        isActual: true,
        expiresAt: expiresAt,
      });
      return;
    }

    // Обновляем существующего пользователя
    const updatedUser = { ...state.user, ...data };
    const storageData: ProfileStorageState = {
      isActual: state.isActual,
      expiresAt: state.expiresAt || calculateProfileExpiryTime(),
      profile: updatedUser,
    };

    saveProfile(storageData).catch((err) => {
      console.error("Ошибка сохранения профиля на диск:", err);
    });

    set({ user: updatedUser });
  },

  setAvatar: (uri) =>
    set((state) => ({
      user: state.user ? { ...state.user, avatarUrl: uri } : null,
    })),

  setAvatarFile: (uri) => {
    // Защита от null или undefined
    if (!uri) {
      console.error("setAvatarFile вызван с пустым uri");
      return;
    }

    try {
      // Создаем объект файла из URI
      const filename = uri.split("/").pop() || "avatar.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      const avatarFile = {
        uri,
        name: filename,
        type,
      };

      console.log("Сохраняем файл в сторе:", avatarFile);

      set((state) => ({
        user: state.user
          ? { ...state.user, avatarFile }
          : {
              firstName: "",
              lastName: "",
              bio: "",
              avatarUrl: null,
              avatarFile,
            },
      }));
    } catch (error) {
      console.error("Ошибка при создании объекта файла:", error);
    }
  },
  clearUser: () => set({ user: null }),

  submitOnbordingData: async () => {
    set({ isLoading: true, error: null });

    try {
      const state = get();
      const { user } = state;

      if (!user) {
        throw new Error("Нет данных пользователя в сторе");
      }

      console.log("📤 Отправляем данные из стора:", {
        firstName: user.firstName,
        lastName: user.lastName,
        hasAvatarFile: user.avatarFile ? "Да" : "Нет",
      });

      const formData = new FormData();
      formData.append("first_name", user.firstName || "");
      formData.append("last_name", user.lastName || "");
      formData.append("bio", user.bio || "");

      if (user.avatarFile) {
        const uri = user.avatarFile.uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append("avatar_file", blob, user.avatarFile.name);
        console.log("📸 Добавляем файл из стора:", user.avatarFile);
      }

      const resp = await updateUserProfile(formData);

      // Обновляем стор с данными от сервера
      const updatedUser = {
        firstName: resp.first_name,
        lastName: resp.last_name,
        bio: resp.bio,
        avatarUrl: resp.avatar_url || null,
        avatarFile: null,
      };

      // 👇 ВАЖНО: Сохраняем isActual и expiresAt
      const currentState = get();
      const storageData: ProfileStorageState = {
        isActual: currentState.isActual, // Сохраняем текущий флаг
        expiresAt: currentState.expiresAt || calculateProfileExpiryTime(),
        profile: { ...currentState.user, ...updatedUser },
      };

      // Сохраняем на диск
      await saveProfile(storageData);

      // Обновляем Zustand
      set({
        user: { ...currentState.user, ...updatedUser },
        isLoading: false,
        lastFetched: Date.now(),
      });

      console.log(
        "✅ Онбординг успешно завершен, получен avatarUrl:",
        resp.avatar_url,
      );
      return resp;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Ошибка отправки данных онбординга";
      console.error("❌ Ошибка отправки:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw err;
    }
  },

  updateAvatar: async (uri: string) => {
    set({ isLoading: true, error: null });

    try {
      const formData = new FormData();
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = uri.split("/").pop() || "avatar.jpg";
      formData.append("avatar_file", blob, filename);

      const resp = await updateUserProfile(formData);

      const state = get();
      if (state.user) {
        const updatedUser = { ...state.user, avatarUrl: resp.avatar_url };

        // Сохраняем на диск
        const storageData: ProfileStorageState = {
          isActual: state.isActual,
          expiresAt: state.expiresAt || calculateProfileExpiryTime(),
          profile: updatedUser,
        };

        await saveProfile(storageData);

        // Обновляем Zustand
        set({
          user: updatedUser,
          isLoading: false,
        });
      }

      return resp;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Ошибка",
        isLoading: false,
      });
      throw err;
    }
  },

  incrementDailyReviews: async () => {
    const state = get();
    const { user, isActual, expiresAt } = state;

    if (!user) {
      console.warn("⚠️ Профиль не загружен");
      return;
    }

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const updatedUser = { ...user };
    updatedUser.total_reviews = (user.total_reviews || 0) + 1;

    const todayCount = user.daily_review_counts?.[today] || 0;

    if (todayCount > 0) {
      // Сценарий А: Сегодня уже были повторения
      updatedUser.daily_review_counts = {
        ...user.daily_review_counts,
        [today]: todayCount + 1,
      };
    } else {
      // Сценарий B: Первое повторение за сегодня
      updatedUser.daily_review_counts = {
        ...user.daily_review_counts,
        [today]: 1,
      };

      const newSeries = (user.review_series || 0) + 1;
      updatedUser.review_series = newSeries;

      const maxSeries = user.max_review_series || 0;
      if (newSeries > maxSeries) {
        updatedUser.max_review_series = newSeries;
        console.log(`🏆 Новый рекорд: ${newSeries} дней`);
      }
    }

    // Сохраняем в кэш
    const storageData: ProfileStorageState = {
      isActual: isActual,
      expiresAt: expiresAt || calculateProfileExpiryTime(),
      profile: updatedUser,
    };

    await saveProfile(storageData);
    set({ user: updatedUser });

    console.log(
      `📊 Статистика: +1 повторение (всего: ${updatedUser.total_reviews}, серия: ${updatedUser.review_series} дн., сегодня: ${updatedUser.daily_review_counts[today]})`,
    );
  },
}));
