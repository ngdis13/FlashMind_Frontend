import { commonStyles } from "@/styles/Common";
import { Pressable, View, Image, ScrollView } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { Typography } from "@/styles/Typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDecks } from "@/storage/hooks/useDecks";
import { styles } from "../../styles/settingsDeck.style";
import { MainButton } from "@/components/MainButton";
import { Input } from "@/components/Input";
import { useEffect, useState } from "react";
import { colors } from "@/styles/Colors";
import infoButton from "@/feature-decks/assets/infoButton.png";
import deleteIcon from "@/feature-decks/assets/deleteIcon.png";
// Импортируем палитру
import { ColorPalette } from "@/app/create-decks/components/colorPalette";
import Slider from "@react-native-community/slider";

// Константы для логарифмического слайдера интервала
const MIN_DAYS = 30;
const MAX_DAYS = 3650;

// Перевод позиции слайдера (0...1) в реальные дни
const logScale = (value: number) => {
  const minLog = Math.log(MIN_DAYS);
  const maxLog = Math.log(MAX_DAYS);
  const scale = minLog + value * (maxLog - minLog);
  return Math.round(Math.exp(scale));
};

// Перевод реальных дней обратно в позицию слайдера (0...1)
const logPosition = (days: number) => {
  if (days < MIN_DAYS) return 0;
  if (days > MAX_DAYS) return 1;
  const minLog = Math.log(MIN_DAYS);
  const maxLog = Math.log(MAX_DAYS);
  return (Math.log(days) - minLog) / (maxLog - minLog);
};

export default function settingsDecks() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // 1. Стейты для управления цветом и видимостью палитры
  const [selectedColor, setSelectedColor] = useState(colors.red1);
  const [visibleColorPalette, setVisibleColorPalette] = useState(false);

  const [intensity, setIntensity] = useState("balance");
  const [targetRetention, setTargetRetention] = useState(90); // По умолчанию 90%
  const [maxInterval, setMaxInterval] = useState(90); // По умолчанию 90 дней
  //для управления скролла во время настроек обучения
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const { decks, updateDeckFields, deleteDeck } = useDecks();

  const modes = [
    { id: "light", label: "Лайт" },
    { id: "balance", label: "Баланс" },
    { id: "intensive", label: "Интенсив" },
  ];

  const handleBack = () => {
    router.push(`/decks/${id}`);
  };

  const handleColorModalToggle = () => {
    setVisibleColorPalette((prev) => !prev);
  };

  const handleColorModalClose = () => {
    setVisibleColorPalette(false);
  };

  const handleSaveEdit = async () => {
    if (!name.trim()) {
      return;
    }

    try {
      setIsLoading(true);

      await updateDeckFields(id, {
        name: name.trim(),
        description: description.trim() || "",
        color: selectedColor,
        desired_retention: Number((targetRetention * 0.01).toFixed(2)),
        maximum_interval: maxInterval,
      });
      console.log("колода обновлена");
      router.push(`/decks/${id}`);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfo = () => {
    //для блока информации об интенсивностти обучения
  };

  const handleSelectIntensity = (mode: string) => {
    setIntensity(mode);

    if (mode === "light") {
      setTargetRetention(85);
      setMaxInterval(720);
    } else if (mode === "balance") {
      setTargetRetention(90);
      setMaxInterval(180);
    } else if (mode === "intensive") {
      setTargetRetention(95);
      setMaxInterval(30);
    }
  };
  const handleDelete = async () => {
    //удаление колоды
    try {
      setIsLoading(true);
      await deleteDeck(id);
      console.log("Колода успешно удалена");
      router.push("/decks");
    } catch (error) {
      console.error("Ошибка при удалении колоды:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const deck = decks.find((d) => d.id === id);
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
      if (deck.color) {
        setSelectedColor(deck.color);
      }

      // 1. Получаем и нормализуем значения из базы данных
      let loadedRetention = 90; // Дефолтное значение
      if (deck.desired_retention) {
        const rawRetention = deck.desired_retention;
        loadedRetention =
          rawRetention <= 1
            ? Math.round(rawRetention * 100)
            : Math.round(rawRetention);
      }

      let loadedInterval = 180; // Дефолтное значение
      if (deck.maximum_interval) {
        const rawInterval = deck.maximum_interval;
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
      if (loadedRetention === 85 && loadedInterval === 720) {
        setIntensity("light");
      } else if (loadedRetention === 90 && loadedInterval === 180) {
        setIntensity("balance");
      } else if (loadedRetention === 95 && loadedInterval === 30) {
        setIntensity("intensive");
      } else {
        setIntensity("custom");
      }
    }
  }, [decks, id]);

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

            {/* Нажатие теперь открывает модалку */}
            <Pressable
              style={[commonStyles.mainBox, styles.colorPickerRow]}
              onPress={handleColorModalToggle}
            >
              {/* Кружок теперь красится в выбранный цвет динамически */}
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
                    //управление скроллом во время настройки
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
                      if (calculatedDays >= 30 && calculatedDays <= 3650) {
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
                    <Typography variant="h3">3650 дней</Typography>
                  </View>

                  <Typography variant="h3" style={styles.sliderDescription}>
                    Максимальный перерыв перед проверкой хорошо знакомого слова
                  </Typography>
                </View>
              </View>
            </View>
          </View>

          <Pressable
            style={[
              commonStyles.mainBox,
              commonStyles.greyButton,
              styles.deleteButton,
            ]}
            onPress={handleDelete}
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
          onCancel={handleColorModalClose} // Передаем строгое закрытие для клика мимо
          onSelectColor={(color) => {
            setSelectedColor(color);
            setVisibleColorPalette(false); // Закрываем стейт родителя
          }}
        />
      )}
    </View>
  );
}
