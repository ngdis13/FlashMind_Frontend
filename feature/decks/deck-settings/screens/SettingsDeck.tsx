// --------------------------- React ---------------------------
import { useEffect, useState } from "react";

// --------------------------- React Native ---------------------------
import { Pressable, View, Image, ScrollView, TextInput } from "react-native";

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
import infoIcon from "@/assets/icons/IconInfo.png";
import deleteIcon from "@/feature-decks/assets/deleteIcon.png";

// --------------------------- Хуки и хранилища ---------------------------
import { useDecks } from "@/storage/hooks/useDecks";
import { InfoProdSettings } from "../../components/InfoProdSettings";

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
  const [visibleColorPalette, setVisibleColorPalette] =
    useState<boolean>(false);

  /**
   * Видимость информационного блока об интенсивности обучения
   */
  const [visibleInfo, setVisibleInfo] = useState<boolean>(false);

  /**
   * Видимость информационного блока о продвинутых настройках
   */
  const [visibleInfoProd, setVisibleInfoProd] = useState<boolean>(false);

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
   * Количество новых карточек в день (1-100)
   */
  const [newCardsPerDay, setNewCardsPerDay] = useState<number>(20);

  /**
   * Дневной лимит карточек (1-1000)
   */
  const [dailyLimit, setDailyLimit] = useState<number>(200);

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

    // Валидация настроек перед сохранением
    const validationError = validateSettings();
    if (validationError) {
      Toast.show({
        type: "error",
        text1: "Проверьте настройки",
        text2: validationError,
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
   * Переключает видимость информационного блока об интенсивности обучения
   */
  const handleInfo = (): void => {
    setVisibleInfo((prev) => !prev);
  };

  /**
   * Переключает видимость информационного блока продвинутых настроек
   */
  const handleInfoProd = (): void => {
    setVisibleInfoProd((prev) => !prev);
  };

  /**
   * Выбирает режим интенсивности обучения и обновляет соответствующие настройки
   *
   * @param {string} mode - Идентификатор режима ("light" | "balance" | "intensive")
   */
  /**
   * Обработка свободного ввода: пользователь может печатать и стирать
   * что угодно — никаких проверок на лету. Валидация выполняется
   * при нажатии «Сохранить изменения» (см. validateSettings).
   */
  const handleValueInput = (
    text: string,
    setter: (value: number) => void,
  ): void => {
    const num = parseInt(text, 10);
    setter(isNaN(num) ? 0 : num);
  };

  /**
   * Валидация всех настроек перед сохранением.
   * @returns {string | null} Текст ошибки или null, если всё в порядке
   */
  const validateSettings = (): string | null => {
    const validations = [
      {
        value: newCardsPerDay,
        min: 1,
        max: 100,
        label: "Количество новых карточек",
        unit: "",
      },
      {
        value: dailyLimit,
        min: 1,
        max: 1000,
        label: "Дневной лимит карточек",
        unit: "",
      },
      {
        value: targetRetention,
        min: 85,
        max: 95,
        label: "Целевое запоминание",
        unit: "%",
      },
      {
        value: maxInterval,
        min: MIN_DAYS,
        max: MAX_DAYS,
        label: "Максимальный интервал",
        unit: " дней",
      },
    ];

    for (const v of validations) {
      if (v.value < v.min) {
        return `${v.label}: минимальное значение — ${v.min}${v.unit}`;
      }
      if (v.value > v.max) {
        return `${v.label}: максимальное значение — ${v.max}${v.unit}`;
      }
    }

    return null;
  };

  const handleSelectIntensity = (mode: string): void => {
    setIntensity(mode);

    if (mode === "light") {
      setTargetRetention(85); 
      setMaxInterval(730);
      setNewCardsPerDay(10);
      setDailyLimit(50);
    } else if (mode === "balance") {
      setTargetRetention(92);
      setMaxInterval(365);
      setNewCardsPerDay(20);
      setDailyLimit(200);
    } else if (mode === "intensive") {
      setTargetRetention(95);
      setMaxInterval(30);
      setNewCardsPerDay(50);
      setDailyLimit(500);
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

      // 2. Получаем значения новых настроек (с дефолтами, пока API не готов)
      const loadedNewCards = deck.settings.new_cards_per_day ?? 20;
      const loadedDailyLimit = deck.settings.daily_limit ?? 200;

      // 3. Сетим значения в стейты для ползунков
      setTargetRetention(loadedRetention);
      setMaxInterval(loadedInterval);
      setNewCardsPerDay(loadedNewCards);
      setDailyLimit(loadedDailyLimit);

      // 4. Автоматически определяем режим на основе пришедших данных
      if (
        loadedRetention === 85 &&
        loadedInterval === 730 &&
        loadedNewCards === 10 &&
        loadedDailyLimit === 50
      ) {
        setIntensity("light");
      } else if (
        loadedRetention === 92 &&
        loadedInterval === 365 &&
        loadedNewCards === 20 &&
        loadedDailyLimit === 200
      ) {
        setIntensity("balance");
      } else if (
        loadedRetention === 95 &&
        loadedInterval === 30 &&
        loadedNewCards === 50 &&
        loadedDailyLimit === 500
      ) {
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
          <View style={[commonStyles.screenHeader, { marginBottom: 16 }]}>
            <Pressable
              onPress={handleBack}
              style={commonStyles.backButton}
              hitSlop={20}
            >
              <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
            </Pressable>
            <Typography variant="h2">Настройки колоды</Typography>
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
                <Pressable onPress={handleInfo} style={styles.infoButton}>
                  <Image source={infoIcon} style={{ width: 16, height: 16 }} />
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
              <View style={[styles.headerIntensity, { marginBottom: 12 }]}>
                <Typography variant="h1" style={styles.colorText}>
                  Продвинутые настройки
                </Typography>

                <Pressable onPress={handleInfoProd} style={styles.infoButton}>
                  <Image source={infoIcon} style={{ width: 16, height: 16 }} />
                </Pressable>
              </View>

              <View style={[commonStyles.mainBox, styles.advancedSettings]}>
                {/* НАСТРОЙКА 1:Количество новых карточек */}
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
                      Количество новых карточек
                    </Typography>
                    <Typography variant="h2" style={{ color: colors.mainColor }}>
                      [
                    </Typography>
                    <TextInput
                      style={[
                        styles.valueInput,
                        {
                          width:
                            String(newCardsPerDay).length * 10 + 4,
                        },
                      ]}
                      value={String(newCardsPerDay)}
                      keyboardType="number-pad"
                      maxLength={3}
                      onChangeText={(text) => {
                        handleValueInput(text, setNewCardsPerDay);
                        setIntensity("custom");
                      }}
                    />
                    <Typography variant="h2" style={{ color: colors.mainColor }}>
                      ]
                    </Typography>
                  </View>

                  <Slider
                    style={{ width: "100%", height: 30 }}
                    minimumValue={1}
                    maximumValue={100}
                    step={1}
                    value={newCardsPerDay}
                    onValueChange={(val) => {
                      setNewCardsPerDay(val);
                      setIntensity("custom");
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
                    <Typography variant="h3">1</Typography>
                    <Typography variant="h3">100</Typography>
                  </View>

                  <Typography variant="h3" style={styles.sliderDescription}>
                    Количество новых карточек, добавляемых в день
                  </Typography>
                </View>

                {/* НАСТРОЙКА 2:Дневной лимит карточек  */}
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
                      Дневной лимит карточек
                    </Typography>
                    <Typography variant="h2" style={{ color: colors.mainColor }}>
                      [
                    </Typography>
                    <TextInput
                      style={[
                        styles.valueInput,
                        { width: String(dailyLimit).length * 10 + 4 },
                      ]}
                      value={String(dailyLimit)}
                      keyboardType="number-pad"
                      maxLength={4}
                      onChangeText={(text) => {
                        handleValueInput(text, setDailyLimit);
                        setIntensity("custom");
                      }}
                    />
                    <Typography variant="h2" style={{ color: colors.mainColor }}>
                      ]
                    </Typography>
                  </View>

                  <Slider
                    style={{ width: "100%", height: 30 }}
                    minimumValue={1}
                    maximumValue={1000}
                    step={1}
                    value={dailyLimit}
                    onValueChange={(val) => {
                      setDailyLimit(val);
                      setIntensity("custom");
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
                    <Typography variant="h3">1</Typography>
                    <Typography variant="h3">1000</Typography>
                  </View>

                  <Typography variant="h3" style={styles.sliderDescription}>
                    Общий лимит повторений карточек в день
                  </Typography>
                </View>

                {/* НАСТРОЙКА 3: Целевое запоминание */}
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
                    <Typography variant="h2" style={{ color: colors.mainColor }}>
                      [
                    </Typography>
                    <TextInput
                      style={[
                        styles.valueInput,
                        {
                          width:
                            String(targetRetention).length * 10 + 4,
                        },
                      ]}
                      value={String(targetRetention)}
                      keyboardType="number-pad"
                      maxLength={3}
                      onChangeText={(text) => {
                        handleValueInput(text, setTargetRetention);
                        setIntensity("custom");
                      }}
                    />
                    <Typography variant="h2" style={{ color: colors.mainColor }}>
                      %]
                    </Typography>
                  </View>

                  <Slider
                    style={{ width: "100%", height: 30 }}
                    minimumValue={85}
                    maximumValue={95}
                    step={1}
                    value={targetRetention}
                    onValueChange={(val) => {
                      setTargetRetention(val);
                      setIntensity("custom");
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
                    <Typography variant="h3">85%</Typography>
                    <Typography variant="h3">95%</Typography>
                  </View>

                  <Typography variant="h3" style={styles.sliderDescription}>
                    Чем выше процент, тем чаще будут возвращаться карточки
                  </Typography>
                </View>

                {/* НАСТРОЙКА 4: Максимальный интервал */}
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
                    <Typography variant="h2" style={{ color: colors.mainColor }}>
                      [
                    </Typography>
                    <TextInput
                      style={[
                        styles.valueInput,
                        { width: String(maxInterval).length * 10 + 4 },
                      ]}
                      value={String(maxInterval)}
                      keyboardType="number-pad"
                      maxLength={4}
                      onChangeText={(text) => {
                        handleValueInput(text, setMaxInterval);
                        setIntensity("custom");
                      }}
                    />
                    <Typography variant="h2" style={{ color: colors.mainColor }}>
                      дней]
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
                        setIntensity("custom");
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
      {visibleInfoProd && (
        <InfoProdSettings visible={visibleInfoProd} onCancel={handleInfoProd} />
      )}
    </View>
  );
}
