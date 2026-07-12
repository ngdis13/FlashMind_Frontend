// --------------------------- React ---------------------------
import { useEffect, useState } from "react";

// --------------------------- React Native ---------------------------
import { Pressable, View, Image, ScrollView } from "react-native";

// --------------------------- Expo ---------------------------
import { useLocalSearchParams, useRouter } from "expo-router";

// --------------------------- Сторонние библиотеки ---------------------------
import Slider from "@react-native-community/slider";
import Toast from "react-native-toast-message";
import { AxiosError } from "axios";

// --------------------------- Стили ---------------------------
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { styles } from "@/feature-decks/deck-settings/styles/SettingsDeck.style";

// --------------------------- Компоненты ---------------------------
import { MainButton } from "@/components/MainButton";
import { Input } from "@/components/Input";
import { ColorPalette } from "@/feature/decks/components/colorPalette";
import { LogoSadStar } from "@/components/LogoSadStar";
import { CustomAlert } from "@/components/CustomAlert";
import { InfoStudy } from "@/feature/decks/components/InfoStudy";

// --------------------------- Ассеты ---------------------------
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import infoButton from "@/feature-decks/assets/infoButton.png";
import deleteIcon from "@/feature-decks/assets/deleteIcon.png";

// --------------------------- Хуки и хранилища ---------------------------
import { useDecks } from "@/storage/hooks/useDecks";

// --------------------------- Константы ---------------------------
/**
 * Минимальное количество дней для интервала повторения
 */
const MIN_DAYS = 30;

/**
 * Максимальное количество дней для интервала повторения
 */
const MAX_DAYS = 730;

// --------------------------- Вспомогательные функции ---------------------------
/**
 * Преобразует позицию слайдера (0-1) в реальное количество дней
 * Использует логарифмическую шкалу для равномерного распределения
 * 
 * @param {number} value - Позиция слайдера от 0 до 1
 * @returns {number} Количество дней (округленное)
 */
const logScale = (value: number): number => {
  const minLog = Math.log(MIN_DAYS);
  const maxLog = Math.log(MAX_DAYS);
  const scale = minLog + value * (maxLog - minLog);
  return Math.round(Math.exp(scale));
};

/**
 * Преобразует количество дней в позицию слайдера (0-1)
 * 
 * @param {number} days - Количество дней
 * @returns {number} Позиция слайдера от 0 до 1
 */
const logPosition = (days: number): number => {
  if (days < MIN_DAYS) return 0;
  if (days > MAX_DAYS) return 1;
  const minLog = Math.log(MIN_DAYS);
  const maxLog = Math.log(MAX_DAYS);
  return (Math.log(days) - minLog) / (maxLog - minLog);
};

/**
 * Экран настроек колоды
 * 
 * @component
 * @returns {JSX.Element} React компонент экрана настроек колоды
 * 
 * @description
 * Экран предоставляет:
 * - Редактирование названия и описания колоды
 * - Выбор цвета колоды через палитру
 * - Настройка интенсивности обучения (Лайт/Баланс/Интенсив/Пользовательский)
 * - Продвинутые настройки:
 *   - Целевое запоминание (85-95%)
 *   - Максимальный интервал повторения (30-730 дней)
 * - Удаление колоды с подтверждением
 * - Сохранение всех изменений с валидацией
 * 
 * @example
 * // Использование в навигации
 * router.push(`/decks/${deckId}/settings`)
 */
export default function SettingsDecksScreen() {
  // --------------------------- Параметры маршрута ---------------------------
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // --------------------------- Хуки ---------------------------
  const { decks, updateDeckFields, deleteDeck } = useDecks();

  // --------------------------- Состояния ---------------------------
  /**
   * Название колоды
   */
  const [name, setName] = useState<string>("");
  
  /**
   * Описание колоды
   */
  const [description, setDescription] = useState<string>("");
  
  /**
   * Выбранный цвет колоды
   */
  const [selectedColor, setSelectedColor] = useState<string>(colors.red1);
  
  /**
   * Видимость палитры цветов
   */
  const [visibleColorPalette, setVisibleColorPalette] = useState<boolean>(false);
  
  /**
   * Видимость информационного блока об обучении
   */
  const [visibleInfo, setVisibleInfo] = useState<boolean>(false);

  /**
   * Режим интенсивности обучения: "light" | "balance" | "intensive" | "custom"
   */
  const [intensity, setIntensity] = useState<string>("balance");
  
  /**
   * Целевой процент запоминания (85-95%)
   */
  const [targetRetention, setTargetRetention] = useState<number>(90);
  
  /**
   * Максимальный интервал повторения в днях
   */
  const [maxInterval, setMaxInterval] = useState<number>(90);
  
  /**
   * Управление прокруткой ScrollView во время настройки слайдеров
   */
  const [isScrollEnabled, setIsScrollEnabled] = useState<boolean>(true);

  /**
   * Флаг загрузки
   */
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  /**
   * Видимость модального окна подтверждения удаления
   */
  const [alertVisible, setAlertVisible] = useState<boolean>(false);

  // --------------------------- Константы ---------------------------
  /**
   * Доступные режимы интенсивности обучения
   */
  const modes = [
    { id: "light", label: "Лайт" },
    { id: "balance", label: "Баланс" },
    { id: "intensive", label: "Интенсив" },
  ];

  // --------------------------- Обработчики навигации ---------------------------
  /**
   * Возвращает на экран просмотра колоды
   */
  const handleBack = (): void => {
    router.push(`/decks/${id}`);
  };

  // --------------------------- Обработчики цвета ---------------------------
  /**
   * Открывает/закрывает палитру цветов
   */
  const handleColorModalToggle = (): void => {
    setVisibleColorPalette((prev) => !prev);
  };

  /**
   * Закрывает палитру цветов
   */
  const handleColorModalClose = (): void => {
    setVisibleColorPalette(false);
  };

  // --------------------------- Обработчики сохранения ---------------------------
  /**
   * Сохраняет изменения настроек колоды
   * @async
   */
  const handleSaveEdit = async (): Promise<void> => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Toast.show({
        type: "error",
        text1: "Заполните имя колоды",
        text2: "Настройки не могут быть сохранены с пустым названием",
        position: "bottom",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        name: trimmedName,
        description: description.trim() || "",
        desired_retention: Number((targetRetention / 100).toFixed(2)), // 0.85 - 0.95
        maximum_interval: Number(maxInterval), // число
        color: selectedColor, // строка с цветом
      };

      console.log("📤 Отправляем на сервер:", JSON.stringify(payload, null, 2));

      await updateDeckFields(id, payload);

      console.log("✅ Колода обновлена");

      Toast.show({
        type: "success",
        text1: "Настройки колоды сохранены",
        position: "bottom",
        visibilityTime: 3000,
      });

      router.push(`/decks/${id}`);
    } catch (error) {
      const err = error as AxiosError<{ message?: string; detail?: string }>;

      console.error("❌ Ошибка при сохранении:");
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);

      const serverMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err?.message ||
        "Не удалось сохранить настройки";

      Toast.show({
        type: "error",
        text1: "Ошибка изменения настроек",
        text2: serverMessage,
        position: "bottom",
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------- Обработчики интенсивности ---------------------------
  /**
   * Переключает видимость информационного блока об обучении
   */
  const handleInfo = (): void => {
    setVisibleInfo((prev) => !prev);
  };

  /**
   * Выбирает режим интенсивности обучения и обновляет соответствующие настройки
   * 
   * @param {string} mode - Идентификатор режима ("light" | "balance" | "intensive")
   */
  const handleSelectIntensity = (mode: string): void => {
    setIntensity(mode);

    if (mode === "light") {
      setTargetRetention(85);
      setMaxInterval(730);
    } else if (mode === "balance") {
      setTargetRetention(92);
      setMaxInterval(365);
    } else if (mode === "intensive") {
      setTargetRetention(95);
      setMaxInterval(30);
    }
  };

  // --------------------------- Обработчики удаления ---------------------------
  /**
   * Открывает модальное окно подтверждения удаления
   */
  const handlePressDeleteButton = (): void => {
    setAlertVisible(true);
  };

  /**
   * Подтверждает удаление колоды
   * @async
   */
  const handleConfirmDelete = async (): Promise<void> => {
    setAlertVisible(false);
    try {
      setIsLoading(true);
      await deleteDeck(id);
      Toast.show({
        type: "success",
        text1: "Колода успешно удалена",
        position: "bottom",
        visibilityTime: 3000,
      });
      console.log("Колода успешно удалена");
      router.push("/decks");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Ошибка удаления колоды",
        text2: "Попробуйте снова",
        position: "bottom",
        visibilityTime: 3000,
      });
      console.error("Ошибка при удалении колоды:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Отменяет удаление колоды
   */
  const handleCancelDelete = (): void => {
    setAlertVisible(false);
  };

  // --------------------------- Effects ---------------------------
  /**
   * Загружает данные колоды при монтировании компонента
   * Устанавливает значения полей и определяет режим интенсивности
   */
  useEffect(() => {
    const deck = decks.find((d) => d.id === id);
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
      if (deck.settings.color) {
        setSelectedColor(deck.settings.color);
      }

      // 1. Получаем и нормализуем значения из базы данных
      let loadedRetention = 92;
      if (deck.settings.desired_retention) {
        const rawRetention = deck.settings.desired_retention;
        loadedRetention =
          rawRetention <= 1
            ? Math.round(rawRetention * 100)
            : Math.round(rawRetention);
      }

      let loadedInterval = 365;
      if (deck.settings.maximum_interval) {
        const rawInterval = deck.settings.maximum_interval;
        loadedInterval =
          rawInterval < MIN_DAYS
            ? MIN_DAYS
            : rawInterval > MAX_DAYS
              ? MAX_DAYS
              : rawInterval;
      }

      // 2. Сетим значения в стейты для ползунков
      setTargetRetention(loadedRetention);
      setMaxInterval(loadedInterval);

      // 3. Автоматически определяем режим на основе пришедших данных
      if (loadedRetention === 85 && loadedInterval === 730) {
        setIntensity("light");
      } else if (loadedRetention === 92 && loadedInterval === 365) {
        setIntensity("balance");
      } else if (loadedRetention === 95 && loadedInterval === 30) {
        setIntensity("intensive");
      } else {
        setIntensity("custom");
      }
    }
  }, [decks, id]);

  // --------------------------- Отрисовка ---------------------------
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          style={{ width: "100%" }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={isScrollEnabled}
        >
          {/* Шапка экрана */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Image source={ReturnIcon} style={{ width: 12, height: 22 }} />
            </Pressable>
            <Typography variant="h1">Настройки колоды</Typography>
          </View>

          {/* Блок полей ввода */}
          <View style={styles.infoBox}>
            <Input
              style={[commonStyles.mainBox, styles.input]}
              placeholder="Название колоды"
              value={name}
              autoCapitalize="none"
              onChangeText={setName}
            />

            <Input
              style={[
                commonStyles.mainBox,
                styles.input,
                styles.descriptionInput,
              ]}
              placeholder="Описание колоды"
              value={description}
              autoCapitalize="none"
              multiline={true}
              onChangeText={setDescription}
            />

            {/* Выбор цвета колоды*/}
            <Pressable
              style={[commonStyles.mainBox, styles.colorPickerRow]}
              onPress={handleColorModalToggle}
            >
              <View
                style={[styles.colorCircle, { backgroundColor: selectedColor }]}
              />
              <Typography variant="h2" style={styles.colorText}>
                Цвет колоды
              </Typography>
            </Pressable>

            <View style={styles.intensityBox}>
              <View style={styles.headerIntensity}>
                <Typography variant="h2" style={styles.colorText}>
                  Интенсивность обучения
                </Typography>
                <Pressable onPress={handleInfo} style={styles.backButton}>
                  <Image
                    source={infoButton}
                    style={{ width: 16, height: 16 }}
                  />
                </Pressable>
              </View>

              <View style={styles.intensityButtonBox}>
                {modes.map((mode) => {
                  const isActive = intensity === mode.id;

                  return (
                    <Pressable
                      key={mode.id}
                      style={[
                        styles.intensityButton,
                        isActive && {
                          borderColor: colors.mainColor,
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => handleSelectIntensity(mode.id)}
                    >
                      <Typography variant="h3">{mode.label}</Typography>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.advancedSettingsBox}>
              <Typography
                variant="h1"
                style={[styles.colorText, { marginBottom: 12 }]}
              >
                Продвинутые настройки
              </Typography>

              <View style={[commonStyles.mainBox, styles.advancedSettings]}>
                {/* НАСТРОЙКА 1: Целевое запоминание */}
                <View style={styles.settings}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginBottom: 4,
                    }}
                  >
                    <Typography variant="h2" style={styles.colorText}>
                      Целевое запоминание
                    </Typography>
                    <Typography
                      variant="h2"
                      style={{ color: colors.mainColor }}
                    >
                      [ {targetRetention}% ]
                    </Typography>
                  </View>

                  <Slider
                    style={{ width: "100%", height: 30 }}
                    minimumValue={85}
                    maximumValue={95}
                    step={1}
                    value={targetRetention}
                    onValueChange={setTargetRetention}
                    onSlidingStart={() => setIsScrollEnabled(false)}
                    onSlidingComplete={() => setIsScrollEnabled(true)}
                    minimumTrackTintColor={colors.mainColor}
                    maximumTrackTintColor="#E0E0E0"
                    thumbTintColor={colors.mainColor}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 2,
                    }}
                  >
                    <Typography variant="h3">85%</Typography>
                    <Typography variant="h3">95%</Typography>
                  </View>

                  <Typography variant="h3" style={styles.sliderDescription}>
                    Чем выше процент, тем чаще будут возвращаться карточки
                  </Typography>
                </View>

                {/* НАСТРОЙКА 2: Максимальный интервал */}
                <View style={[styles.settings]}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginBottom: 4,
                    }}
                  >
                    <Typography variant="h2" style={styles.colorText}>
                      Максимальный интервал
                    </Typography>
                    <Typography
                      variant="h2"
                      style={{ color: colors.mainColor }}
                    >
                      [ {maxInterval} дней ]
                    </Typography>
                  </View>

                  <Slider
                    style={{ width: "100%", height: 30 }}
                    minimumValue={0}
                    maximumValue={1}
                    value={logPosition(maxInterval)}
                    onValueChange={(val) => {
                      const calculatedDays = logScale(val);
                      if (calculatedDays >= 30 && calculatedDays <= 730) {
                        setMaxInterval(calculatedDays);
                      }
                    }}
                    onSlidingStart={() => setIsScrollEnabled(false)}
                    onSlidingComplete={() => setIsScrollEnabled(true)}
                    minimumTrackTintColor={colors.mainColor}
                    maximumTrackTintColor="#E0E0E0"
                    thumbTintColor={colors.mainColor}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 2,
                    }}
                  >
                    <Typography variant="h3">30 дней</Typography>
                    <Typography variant="h3">730 дней</Typography>
                  </View>

                  <Typography variant="h3" style={styles.sliderDescription}>
                    Максимальный перерыв перед проверкой хорошо знакомого слова
                  </Typography>
                </View>
              </View>
            </View>
          </View>
          {/* Удаление колоды */}
          <Pressable
            style={[
              commonStyles.mainBox,
              commonStyles.greyButton,
              styles.deleteButton,
            ]}
            onPress={handlePressDeleteButton}
            disabled={isLoading}
          >
            <Image
              source={deleteIcon}
              style={[
                { width: 20, height: 20, shadowColor: colors.errorColor },
              ]}
              resizeMode="contain"
            />
            <Typography variant="h2" color={colors.errorColor}>
              Удалить колоду
            </Typography>
          </Pressable>
        </ScrollView>

        {/* Модалка для подтверждения удаления */}
        <CustomAlert
          visible={alertVisible}
          message="Ты действительно хочешь удалить колоду?"
          confirmText="Удалить"
          cancelText="Вернуться к колоде"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          icon={<LogoSadStar size={128} />}
        />

        <View style={[styles.bottomButtonContainer, { maxWidth: 800 }]}>
          <MainButton
            style={styles.button}
            title={isLoading ? "Сохранение..." : "Сохранить изменения"}
            onPress={handleSaveEdit}
            disabled={isLoading}
          />
        </View>
      </View>

      {visibleColorPalette && (
        <ColorPalette
          onCancel={handleColorModalClose}
          onSelectColor={(color) => {
            setSelectedColor(color);
            setVisibleColorPalette(false);
          }}
        />
      )}

      {visibleInfo && <InfoStudy visible={visibleInfo} onCancel={handleInfo} />}
    </View>
  );
}