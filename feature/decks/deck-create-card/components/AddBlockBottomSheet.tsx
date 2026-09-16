// feature-decks/deck-create-card/components/AddBlockBottomSheet.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  useWindowDimensions,
  PanResponder,
} from "react-native";

import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import searchButton from "@/feature-decks/assets/searchButton.png";
import { CardBlock, CardBlockType } from "../types/cardBlocks";
import { Input } from "@/components/Input";
import viewCardIcon2 from "@/feature-decks/assets/ViewCardIcon2.png";
import ImageIcon from "@/feature-decks/assets/ImageIcon.png";
import TermIcon from "@/feature-decks/assets/TermIcon.png";
import TextIcon from "@/feature-decks/assets/TextIcon.png";

interface AddBlockBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectBlockType: (type: CardBlockType) => void;
  allowedTypes?: CardBlock["type"][]; // Пропс, определяющий доступные типы блоков
}

export const AddBlockBottomSheet: React.FC<AddBlockBottomSheetProps> = ({
  isVisible,
  onClose,
  onSelectBlockType,
  allowedTypes = ["term", "text", "image"], // Дефолтные значения
}) => {
  const [search, setSearch] = useState(""); //
  // Держим модалку смонтированной, пока идёт анимация закрытия
  const [isMounted, setIsMounted] = useState<boolean>(isVisible);

  // anim — прозрачность затемнения (0..1)
  const anim = useRef(new Animated.Value(0)).current;
  // sheetY — вертикальное смещение шторки (0 — открыта, screenHeight — скрыта)
  const sheetY = useRef(new Animated.Value(0)).current;
  const { height: screenHeight } = useWindowDimensions();

  // Актуальный onClose для PanResponder (избегаем устаревшего замыкания)
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isVisible) {
      setIsMounted(true);
      sheetY.setValue(screenHeight);
      // Открытие: экран плавно темнеет, шторка выезжает снизу
      Animated.parallel([
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sheetY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isMounted) {
      // Закрытие: шторка уезжает вниз, затемнение плавно рассеивается
      Animated.parallel([
        Animated.timing(anim, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sheetY, {
          toValue: screenHeight,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        // Размонтируем только если анимация завершилась (не прервана повторным открытием)
        if (finished) setIsMounted(false);
      });
    }
  }, [isVisible, isMounted, anim, sheetY, screenHeight]);

  // Свайп-закрытие: тянем шторку вниз за верхнюю ручку
  const panResponder = useRef(
    PanResponder.create({
      // Захватываем жест только при движении вниз
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 6,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) sheetY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        const draggedFar = gesture.dy > 120; // протянули достаточно далеко
        const flicked = gesture.vy > 0.8; // резко дёрнули вниз
        if (draggedFar || flicked) {
          onCloseRef.current(); // isVisible → false, эффект доиграет анимацию
        } else {
          // Недотянули — возвращаем шторку пружинкой
          Animated.spring(sheetY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Жест перехвачен системой — возвращаем на место
        Animated.spring(sheetY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

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
        description: "Главный element карточки для терминов и слов", //
      },
      {
        type: "text",
        title: "Текст",
        icon: TextIcon,
        description:
          "Универсальное текстовое поле для заметок, комментариев или любых ваших данных", //
      },
      {
        type: "image",
        title: "Изображение",
        icon: ImageIcon,
        description:
          "Визуальный образ на любой стороне для ассоциативной памяти", //
      },
    ];

    const filteredBySide = allBlocks.filter((block) =>
      allowedTypes.includes(block.type),
    );

    // Если поисковая строка пустая — отдаем отфильтрованные по стороне блоки
    if (!search.trim()) return filteredBySide;

    // Иначе дополнительно фильтруем по поиску
    return filteredBySide.filter(
      (block) =>
        block.title.toLowerCase().includes(search.toLowerCase()) ||
        block.description.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, allowedTypes]); // Добавили allowedTypes в массив зависимостей useMemo

  const handleSelectBlock = (type: CardBlockType) => {
    onSelectBlockType(type); //
    setSearch(""); //
  };

  if (!isMounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none" // анимацию выполняем сами через Animated
      onRequestClose={onClose} //
    >
      <View style={styles.overlayContainer}>
        {/* Затемнение — плавно проявляется на всём экране, пока шторка выезжает */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlay, { opacity: anim }]} />
        </TouchableWithoutFeedback>

        {/* Шторка — позиция управляется через sheetY (анимация + свайп) */}
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}
        >
          {/* Ручка — тяните вниз, чтобы закрыть */}
          <Animated.View
            style={styles.handleWrapper}
            {...panResponder.panHandlers}
          >
            <View style={styles.handle} />
          </Animated.View>
          <Typography variant="h2" style={styles.modalTitle}>
            Выберите новый блок
          </Typography>

          <View style={styles.searchBox}>
            <Input
              style={{ textAlign: "left" }}
              placeholder={"Поиск"}
              value={search}
              onChangeText={setSearch} //
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
            keyboardShouldPersistTaps="handled" //
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
                  onPress={() => handleSelectBlock(block.type)} //
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
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Контейнер на весь экран: затемнение — абсолютом, шторка — прижата к низу
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end",
  }, //
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  }, //
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
  }, //
  // Зона касания ручки — шире самой полоски, чтобы свайп было удобно делать
  handleWrapper: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  }, //
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#E5E5EA",
  }, //
  modalTitle: { marginBottom: 12 }, //
  searchButton: { position: "absolute", marginRight: 12 }, //
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 16,
    width: "100%",
  }, //
  blockCard: {
    width: "100%",
    borderWidth: 2,
    borderColor: colors.mainColor,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: colors.white,
  }, //
  cardPressed: { opacity: 0.7 }, //
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.mainColor,
    paddingHorizontal: 12,
    paddingVertical: 10,
  }, //
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 }, //
  cardBody: { padding: 14 }, //
  cardDescription: { color: colors.darkGray, lineHeight: 18 }, //
});
