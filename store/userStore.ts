import { updateUserProfile } from "@/feature/onboarding/api/onboarding.api";
import { ProfileResponse } from "@/feature/onboarding/types/api.types";
import { getUserProfile } from "@/feature/profile/api/profile.api";
import { create } from "zustand";

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

  setUser: (user) => {
    set({ user, lastFetched: Date.now() });
  },

  fetchUser: async (force = false) => {
    const state = get();
    if (!force && state.user) {
      console.log("Данные уже есть в сторе, использую их");
      return;
    }

    if (state.isLoading) {
      console.log("Уже загружается...");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await getUserProfile();
      const mappedUserProfile = {
        firstName: response.first_name,
        lastName: response.last_name,
        bio: response.bio ? response.bio : 'О себе',
        avatarUrl: response.avatar_url || null,
      };
      set({
        user: mappedUserProfile,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Ошибка загрузки профиля",
        isLoading: false,
      });
    }
  },

  updateProfile: (data) =>
    set((state) => {
      // Если user существует - обновляем
      if (state.user) {
        return { user: { ...state.user, ...data } };
      }
      // Если user не существует - создаем новый с данными
      return {
        user: {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || null,
        },
      };
    }),

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
      // 👈 Берем данные прямо из стора через get()
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

      // Создаем FormData для отправки
      const formData = new FormData();

      // Добавляем текстовые поля из стора
      formData.append("first_name", user.firstName || "");
      formData.append("last_name", user.lastName || "");
      formData.append("bio", user.bio || "");

      // Добавляем файл аватара, если он есть в сторе
    if (user.avatarFile) {
      const uri = user.avatarFile.uri;

      // Загружаем файл с локального URI
      const response = await fetch(uri);
      const blob = await response.blob(); // получаем Blob

      // Добавляем файл в FormData с именем
      formData.append("avatar_file", blob, user.avatarFile.name);

      console.log("📸 Добавляем файл из стора:", user.avatarFile);
    }

      // Отправляем запрос с FormData
      const resp = await updateUserProfile(formData);

      // Обновляем стор с данными от сервера
      const updatedUser = {
        firstName: resp.first_name,
        lastName: resp.last_name,
        bio: resp.bio,
        avatarUrl: resp.avatar_url || null,
        avatarFile: null, // очищаем локальный файл, теперь есть URL
      };

      set({
        user: updatedUser,
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
}));
