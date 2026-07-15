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

  // В userStore.ts

  setAvatarFile: (uri: string) => {
    if (!uri) {
      console.error("❌ setAvatarFile вызван с пустым uri");
      return;
    }

    try {
      const filename = uri.split("/").pop() || "avatar.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      const avatarFile = {
        uri: uri,
        name: filename,
        type: type,
      };

      console.log("📦 Сохраняем файл в сторе:", avatarFile);

      set((state) => {
        const currentUser = state.user || {
          firstName: "",
          lastName: "",
          bio: "",
          avatarUrl: null,
          review_series: 0,
          total_reviews: 0,
          max_review_series: 0,
          daily_review_counts: {},
        };

        return {
          user: {
            ...currentUser,
            avatarFile: avatarFile,
          },
          isActual: state.isActual || true,
          expiresAt: state.expiresAt || calculateProfileExpiryTime(),
        };
      });

      // 👇 СОХРАНЯЕМ НА ДИСК СРАЗУ
      const state = get();
      if (state.user) {
        const storageData: ProfileStorageState = {
          isActual: state.isActual || true,
          expiresAt: state.expiresAt || calculateProfileExpiryTime(),
          profile: state.user,
        };
        saveProfile(storageData)
          .then(() => console.log("✅ Аватар сохранен на диск"))
          .catch((err) =>
            console.error("❌ Ошибка сохранения аватара на диск:", err),
          );
      }
    } catch (error) {
      console.error("❌ Ошибка при создании объекта файла:", error);
    }
  },
  clearUser: () => set({ user: null }),

  // В userStore.ts

  submitOnbordingData: async (): Promise<ProfileResponse> => {
    console.log("🚀 submitOnbordingData начал выполнение");

    // Проверяем текущее состояние
    const currentState = get();
    console.log("📊 Текущее состояние стора:", {
      hasUser: !!currentState.user,
      isLoading: currentState.isLoading,
      isActual: currentState.isActual,
      expiresAt: currentState.expiresAt,
    });

    set({ isLoading: true, error: null });

    try {
      // ШАГ 1: Проверяем пользователя
      const { user } = get();
      console.log(
        "👤 Проверка пользователя:",
        user ? `Есть: ${user.firstName}` : "Нет",
      );

      if (!user) {
        throw new Error("Нет данных пользователя в сторе");
      }

      console.log("📤 Отправляем данные онбординга:", {
        firstName: user.firstName,
        lastName: user.lastName,
        hasAvatarFile: user.avatarFile ? "Да" : "Нет",
        avatarFile: user.avatarFile,
      });

      // ШАГ 2: Создаем FormData
      console.log("📦 Создаем FormData...");
      const formData = new FormData();
      formData.append("first_name", user.firstName || "");
      formData.append("last_name", user.lastName || "");
      formData.append("bio", user.bio || "");
      console.log("✅ Текстовые поля добавлены");

      // ШАГ 3: Добавляем файл
      if (user.avatarFile) {
        const { uri, name, type } = user.avatarFile;
        console.log("📸 Добавляем файл:", {
          uri: uri?.substring(0, 50),
          name,
          type,
        });

        if (uri) {
          try {
            console.log("🔄 Загружаем файл через fetch...");
            const response = await fetch(uri);
            console.log("✅ Fetch выполнен, статус:", response.status);

            const blob = await response.blob();
            console.log("✅ Blob получен, размер:", blob.size);

            formData.append("avatar_file", blob, name || "avatar.jpg");
            console.log("✅ Файл добавлен в FormData через blob");
          } catch (error) {
            console.error("❌ Ошибка загрузки blob:", error);
            // Пробуем добавить как есть
            formData.append("avatar_file", {
              uri: uri,
              name: name || "avatar.jpg",
              type: type || "image/jpeg",
            } as any);
            console.log("⚠️ Файл добавлен как объект (fallback)");
          }
        } else {
          console.warn("⚠️ URI аватара пустой!");
        }
      } else {
        console.log("ℹ️ Нет файла аватара");
      }

      // ШАГ 4: Отправляем запрос
      console.log("📤 Отправка запроса на сервер...");
      console.log("🔗 URL: /users/profile");

      try {
        const resp = await updateUserProfile(formData);
        console.log(
          "✅ Ответ сервера получен полностью:",
          JSON.stringify(resp, null, 2),
        );

        // ШАГ 5: Проверяем ответ
        if (!resp) {
          throw new Error("Сервер вернул пустой ответ");
        }

        console.log("📊 Поля ответа:", {
          first_name: resp.first_name,
          last_name: resp.last_name,
          avatar_url: resp.avatar_url,
          has_avatar: !!resp.avatar_url,
        });

        // ШАГ 6: Обновляем профиль
        console.log("🔄 Обновляем профиль в сторе...");
        const updatedUser = {
          ...user,
          firstName: resp.first_name || user.firstName,
          lastName: resp.last_name || user.lastName,
          bio: resp.bio || user.bio,
          avatarUrl: resp.avatar_url || null,
          avatarFile: null,
        };

        console.log("👤 Обновленный пользователь:", {
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          hasAvatarUrl: !!updatedUser.avatarUrl,
          avatarUrl: updatedUser.avatarUrl?.substring(0, 50),
        });

        // ШАГ 7: Сохраняем на диск
        console.log("💾 Сохраняем на диск...");
        const expiresAt = calculateProfileExpiryTime();
        const storageData: ProfileStorageState = {
          isActual: true,
          expiresAt: expiresAt,
          profile: updatedUser,
        };

        await saveProfile(storageData);
        console.log("✅ Профиль сохранен на диск");

        // ШАГ 8: Обновляем Zustand
        console.log("🔄 Обновляем Zustand...");
        set({
          user: updatedUser,
          isLoading: false,
          lastFetched: Date.now(),
          isActual: true,
          expiresAt: expiresAt,
        });

        console.log("✅ Онбординг успешно завершен!");
        return resp;
      } catch (apiError) {
        console.error("❌ Ошибка API запроса:", apiError);

        // Детали ошибки
        if (apiError instanceof Error) {
          console.error("📦 Тип ошибки:", apiError.name);
          console.error("📦 Сообщение:", apiError.message);
          console.error("📦 Стек:", apiError.stack);
        }

        // Проверяем, есть ли response
        if ((apiError as any).response) {
          console.error("📦 Ответ ошибки:", {
            status: (apiError as any).response?.status,
            data: (apiError as any).response?.data,
            headers: (apiError as any).response?.headers,
          });
        }

        throw apiError;
      }
    } catch (err) {
      console.error("❌ КРИТИЧЕСКАЯ ОШИБКА в submitOnbordingData:", err);

      if (err instanceof Error) {
        console.error("📦 Имя ошибки:", err.name);
        console.error("📦 Сообщение:", err.message);
        console.error("📦 Стек:", err.stack);
      }

      set({
        error:
          err instanceof Error
            ? err.message
            : "Ошибка отправки данных онбординга",
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
