// Твой обновленный файл TemplateSelectScreen.tsx
import { ScrollView, View, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { styles } from "@/feature-decks/deck-create-card/styles/TemplateSelect.style";
import searchButton from "@/feature-decks/assets/searchButton.png";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { Input } from "@/components/Input";
import { AppEmojis } from "@/assets/emoji/emoji";
import { MainButton } from "@/components/MainButton";

// ИМПОРТИРУЕМ НАШ НОВЫЙ КОМПОНЕНТ И ТИП
import { TemplateItem, TemplateCardMock } from "../components/TemplateItem";

// Создаем 3 фейковые последние карточки для верстки
const MOCK_RECENT_TEMPLATES: TemplateCardMock[] = [
  {
    id: "template_1",
    title: "Немецкие глаголы",
    frontBlocks: [{ id: "f1", type: "term", value: "" }],
    backBlocks: [{ id: "b1", type: "text", value: "" }, { id: "b2", type: "text", value: "" }]
  },
  {
    id: "template_2",
    title: "Столицы (квиз)",
    frontBlocks: [{ id: "f2", type: "text", value: "" }],
    backBlocks: [{ id: "b3", type: "term", value: "" }]
  },
  {
    id: "template_3",
    title: "Анатомия: Мышцы",
    frontBlocks: [{ id: "f3", type: "term", value: "" }, { id: "f4", type: "text", value: "" }],
    backBlocks: [{ id: "b4", type: "text", value: "" }]
  }
];

export const TemplateSelectScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");

  const handleBack = (): void => {
    router.push("/decks");
  };

  // Метод перехода в конструктор при выборе конкретного шаблона
  const handleSelectTemplate = (id: string) => {
    router.push({
      pathname: "/deck-create-card/screens/CreateCard",
      params: { templateId: id }
    });
  };

  // Метод перехода для создания карточки с полного нуля
  const handleCreateTemplate = () => {
    router.push({
      pathname: "/deck-create-card/screens/CreateCard",
      params: { templateId: "empty" }
    });
  };


  const filteredTemplates = MOCK_RECENT_TEMPLATES.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}>
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            paddingHorizontal: 10,
            paddingTop: 20,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton} hitSlop={20}>
              <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
            </Pressable>
            <Typography variant="h2">Новая карточка</Typography>
          </View>

          <View style={styles.searchBox}>
            <Input
              style={{ textAlign: "left" }}
              placeholder={"Поиск"}
              value={search}
              onChangeText={setSearch}
            />
            <Pressable style={styles.searchButton}>
              <Image source={searchButton} style={{ width: 18, height: 18 }} />
            </Pressable>
          </View>

          <View style={styles.templateBox}>
            <Typography variant="h2" style={styles.headerName}>
              <Image source={AppEmojis.star} style={styles.inlineEmoji} /> {""}
              Недавно созданные
            </Typography>

            <View style={{ width: "100%" }}>
              {filteredTemplates.map((template) => (
                <TemplateItem 
                  key={template.id} 
                  item={template} 
                  onPress={handleSelectTemplate} 
                />
              ))}
              
              {filteredTemplates.length === 0 && (
                <Typography variant="h3" style={{ color: colors.darkGray, textAlign: 'center',}}>
                  Ничего не найдено
                </Typography>
              )}
            </View>
          </View>
        </ScrollView>

        <View
          style={{
            width: "100%",
            paddingHorizontal: 10,
            alignItems: "center",
            marginBottom: BOTTOM_MARGIN,
          }}
        >
          <MainButton
            style={styles.createTemplateButton}
            title="Создать пустой шаблон"
            onPress={handleCreateTemplate}
          />
        </View>
      </View>
    </View>
  );
};
