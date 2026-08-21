import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";

import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import searchButton from "@/feature-decks/assets/searchButton.png";
import { CardBlockType } from "../types/cardBlocks";
import { Input } from "@/components/Input";
import viewCardIcon2 from "@/feature-decks/assets/ViewCardIcon2.png";
import ImageIcon from "@/feature-decks/assets/ImageIcon.png";
import TermIcon from "@/feature-decks/assets/TermIcon.png";
import TextIcon from "@/feature-decks/assets/TextIcon.png";

interface AddBlockBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectBlockType: (type: CardBlockType) => void;
}

export const AddBlockBottomSheet: React.FC<AddBlockBottomSheetProps> = ({
  isVisible,
  onClose,
  onSelectBlockType,
}) => {
  const [search, setSearch] = useState("");

  const blockTypes = useMemo(() => {
    const allBlocks: {
      type: CardBlockType;
      title: string;
      icon: ImageSourcePropType;
      description: string;
    }[] = [
      {
        type: "term",
        title: "Термин",
        icon: TermIcon,
        description: "Главный элемент карточки для терминов и слов",
      },
      {
        type: "text",
        title: "Текст",
        icon: TextIcon,
        description:
          "Универсальное текстовое поле для заметок, комментариев или любых ваших данных",
      },
      {
        type: "image",
        title: "Изображение",
        icon: ImageIcon,
        description: "Визуальный образ на любой стороне для ассоциативной памяти",
      },
      
    ];

    if (!search.trim()) return allBlocks;

    return allBlocks.filter(
      (block) =>
        block.title.toLowerCase().includes(search.toLowerCase()) ||
        block.description.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const handleSelectBlock = (type: CardBlockType) => {
    onSelectBlockType(type);
    setSearch("");
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Typography variant="h2" style={styles.modalTitle}>
                Выберите новый блок
              </Typography>

              <View style={styles.searchBox}>
                <Input
                  style={{ textAlign: "left" }}
                  placeholder={"Поиск"}
                  value={search}
                  onChangeText={setSearch}
                />
                <Pressable style={styles.searchButton}>
                  <Image
                    source={searchButton}
                    style={{ width: 18, height: 18 }}
                  />
                </Pressable>
              </View>

              <ScrollView
                style={{ width: "100%", flex: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {blockTypes.length === 0 ? (
                  <Typography
                    variant="h3"
                    color={colors.darkGray}
                    style={{ textAlign: "center", marginTop: 20 }}
                  >
                    Ничего не найдено
                  </Typography>
                ) : (
                  blockTypes.map((block) => (
                    <Pressable
                      key={block.type}
                      style={({ pressed }) => [
                        styles.blockCard,
                        pressed && styles.cardPressed,
                      ]}
                      onPress={() => handleSelectBlock(block.type)}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                          <Image
                            source={block.icon}
                            style={{ width: 16, height: 16 }}
                            resizeMode="contain"
                          />
                          <Typography variant="span" color={colors.white}>
                            {block.title}
                          </Typography>
                        </View>
                        <Image
                          source={viewCardIcon2}
                          style={{ width: 16, height: 16 }}
                        />
                      </View>
                      <View style={styles.cardBody}>
                        <Typography variant="h3" style={styles.cardDescription}>
                          {block.description}
                        </Typography>
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    width: "97%",
    maxWidth: 800,
    alignSelf: "center",
    height: "90%",
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#E5E5EA",
    marginBottom: 12,
  },
  modalTitle: {
    marginBottom: 12,
  },
  searchButton: {
    position: "absolute",
    marginRight: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 16,
    width: "100%",
  },
  blockCard: {
    width: "100%",
    borderWidth: 2,
    borderColor: colors.mainColor,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.mainColor,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardBody: {
    padding: 14,
  },
  cardDescription: {
    color: colors.darkGray,
    lineHeight: 18,
  },
});
