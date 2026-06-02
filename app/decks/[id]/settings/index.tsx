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
// Импортируем палитру
import { ColorPalette } from "@/app/create-decks/components/colorPalette";

export default function settingsDecks() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // 1. Стейты для управления цветом и видимостью палитры
  const [selectedColor, setSelectedColor] = useState(colors.red1);
  const [visibleColorPalette, setVisibleColorPalette] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const { decks, updateDeckFields } = useDecks();

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

      // Передаем измененное имя, описание и выбранный цвет
      await updateDeckFields(id, {
        name: name.trim(),
        description: description.trim() || "",
        color: selectedColor, // Сохраняем цвет на сервер и в сторадж
      });
      console.log("колода обновлена");
      router.push(`/decks/${id}`);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const deck = decks.find((d) => d.id === id || d.deck_id === id);
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
      // Если у колоды уже есть цвет в базе, инициализируем им
      if (deck.color) {
        setSelectedColor(deck.color);
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
          </View>
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
