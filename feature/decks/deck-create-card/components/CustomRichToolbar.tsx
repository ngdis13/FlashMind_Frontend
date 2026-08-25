import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { MainButton } from "@/components/MainButton";

import ChevronDownIcon from "@/assets/icons/ReturnIcon.png";

// Иконки панели (deck-create-card/assets)
import ArrowIcon from "../assets/ArrowIcon.png";
import BoldTextIcon from "../assets/BoldTextIcon.png";
import ItalicTextIcon from "../assets/ItalicTextIcon.png";
import UnderlineTextIcon from "../assets/UnderlineTextIcon.png";
import CrossedTextIcon from "../assets/CrossedTextIcon.png";
import LeftTextIcon from "../assets/LeftTextIcon.png";
import CenterTextIcon from "../assets/CenterTextIcon.png";
import RightTextIcon from "../assets/RightTextIcon.png";
import ListIcon from "../assets/ListIcon.png";
import MarkListIcon from "../assets/MarkListIcon.png";
import NumericListIcon from "../assets/NumericListIcon.png";
import PencilIcon from "../assets/PencilIcon.png";

import CodeIcon from "../assets/CodeIcon.png";

// Высоты панели
const EXPANDED_HEIGHT = 200;
const COLLAPSED_HEIGHT = 45;

interface CustomRichToolbarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onDone: () => void;
}

export const CustomRichToolbar: React.FC<CustomRichToolbarProps> = ({
  isExpanded,
  onToggle,
  onDone,
}) => {
  // Анимация сворачивания панели
  const height = useSharedValue(
    isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
  );
  useEffect(() => {
    height.value = withTiming(isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT, {
      duration: 250,
    });
  }, [isExpanded, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  // ВЫБРАННЫЙ ШРИФТ (radio: активен только один пункт строки)
  const [selectedFont, setSelectedFont] = useState<string | null>(null);

  // АКТИВНЫЕ КНОПКИ (toggle: вкл/выкл по клику)
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const toggleKey = (key: string) =>
    setActiveKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const isActive = (key: string) => activeKeys.includes(key);

  // Выбор шрифта с возможностью снятия: повторный клик убирает выделение
  const selectFont = (key: string) =>
    setSelectedFont((prev) => (prev === key ? null : key));

  return (
    <Animated.View
      style={[styles.toolbarContainer, animatedStyle]}
      pointerEvents="box-none"
    >
      {/* 1. ШАПКА ПАНЕЛИ (всегда видна) */}
      <Pressable style={styles.toolbarHeader} onPress={onToggle} hitSlop={15}>
        <Typography variant="h2">Форматирование</Typography>
        <Image
          source={ArrowIcon}
          style={[
            styles.chevronIcon,
            { transform: [{ rotate: isExpanded ? "0deg" : "180deg" }] },
          ]}
        />
      </Pressable>

      {/* 2. СОДЕРЖИМОЕ (видно только в развёрнутом состоянии) */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* СТРОКА 1 (скроллится по горизонтали): шрифты и заголовки */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.headingsScroll}
            contentContainerStyle={styles.headingsRow}
          >
            <Pressable onPress={() => selectFont("H1")} hitSlop={5}>
              <Typography
                variant="span"
                style={[
                  styles.nameText,
                  selectedFont === "H1" && styles.headingActive,
                ]}
              >
                Название
              </Typography>
            </Pressable>
            <Pressable onPress={() => selectFont("H2")} hitSlop={5}>
              <Typography
                variant="span"
                style={[
                  styles.headingText,
                  selectedFont === "H2" && styles.headingActive,
                ]}
              >
                Заголовок
              </Typography>
            </Pressable>
            <Pressable onPress={() => selectFont("H3")} hitSlop={5}>
              <Typography
                variant="span"
                style={[
                  styles.subtitleText,
                  selectedFont === "H3" && styles.headingActive,
                ]}
              >
                Подзаголовок
              </Typography>
            </Pressable>
            <Pressable onPress={() => selectFont("main")} hitSlop={5}>
              <Typography
                variant="span"
                style={[
                  styles.mainText,
                  selectedFont === "main" && styles.headingActive,
                ]}
              >
                Основной текст
              </Typography>
            </Pressable>
            <Pressable onPress={() => selectFont("mono")} hitSlop={5}>
              <Typography
                variant="span"
                style={[
                  styles.monospacedText,
                  selectedFont === "mono" && styles.headingActive,
                ]}
              >
                Моноширинный шрифт
              </Typography>
            </Pressable>
          </ScrollView>

          {/* СТРОКА 2: Группа BIUS + карандаш и цвет */}
          <View style={styles.actionsMainRow}>
            <View style={styles.segmentedButtonGroup}>
              <Pressable
                style={[
                  styles.segmentBtn,
                  styles.segmentLeft,
                  isActive("bold") && styles.segmentBtnActive,
                ]}
                onPress={() => toggleKey("bold")}
              >
                <Image source={BoldTextIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={[
                  styles.segmentBtn,
                  isActive("italic") && styles.segmentBtnActive,
                ]}
                onPress={() => toggleKey("italic")}
              >
                <Image source={ItalicTextIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={[
                  styles.segmentBtn,
                  isActive("underline") && styles.segmentBtnActive,
                ]}
                onPress={() => toggleKey("underline")}
              >
                <Image source={UnderlineTextIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={[
                  styles.segmentBtn,
                  styles.segmentRight,
                  isActive("strikeThrough") && styles.segmentBtnActive,
                ]}
                onPress={() => toggleKey("strikeThrough")}
              >
                <Image source={CrossedTextIcon} style={styles.btnIcon} />
              </Pressable>
            </View>

            {/* Карандаш и цвет — два отдельных элемента с зазором */}
            <View style={styles.segmentedButtonGroup}>
              <Pressable
                style={[
                  styles.segmentBtn,
                  styles.segmentLeft,
                  isActive("pencil") && styles.segmentBtnActive,
                ]}
                onPress={() => toggleKey("pencil")}
              >
                <Image source={PencilIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <View style={[styles.segmentBtn, styles.segmentRight]}>
                <View style={styles.colorCircle} />
              </View>
            </View>
          </View>

          {/* СТРОКА 3: Списки, выравнивание и код */}
          <View style={styles.actionsBottomRow}>
            {/* Группа списков */}
            <View style={styles.segmentedButtonGroup}>
              <Pressable
                style={[
                  styles.segmentBtn,
                  styles.segmentLeft,
                  isActive("bulletList") && styles.segmentBtnActive,
                ]}
                onPress={() => toggleKey("bulletList")}
              >
                <Image source={MarkListIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={[
                  styles.segmentBtn,
                  isActive("list") && styles.segmentBtnActive,
                ]}
                onPress={() => toggleKey("list")}
              >
                <Image source={ListIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={[
                  styles.segmentBtn,
                  styles.segmentRight,
                  isActive("numberedList") && styles.segmentBtnActive,
                ]}
                onPress={() => toggleKey("numberedList")}
              >
                <Image source={NumericListIcon} style={styles.btnIcon} />
              </Pressable>
            </View>

            {/* Группа выравнивания */}
            <View style={styles.segmentedButtonGroup}>
              <Pressable
                style={[
                  styles.segmentBtn,
                  styles.segmentLeft,
                  isActive("alignLeft") && styles.segmentBtnActive,
                ]}
                onPress={() => toggleKey("alignLeft")}
              >
                <Image source={LeftTextIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={[
                  styles.segmentBtn,
                  isActive("alignCenter") && styles.segmentBtnActive,
                ]}
                onPress={() => toggleKey("alignCenter")}
              >
                <Image source={CenterTextIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={[
                  styles.segmentBtn,
                  styles.segmentRight,
                  isActive("alignRight") && styles.segmentBtnActive,
                ]}
                onPress={() => toggleKey("alignRight")}
              >
                <Image source={RightTextIcon} style={styles.btnIcon} />
              </Pressable>
            </View>

            {/* Кнопка моноширинного шрифта (код) */}
            <Pressable
              style={[
                styles.codeBtn,
                isActive("code") && styles.segmentBtnActive,
              ]}
              onPress={() => toggleKey("code")}
            >
              <Image source={CodeIcon} style={styles.btnIconCode} />
            </Pressable>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toolbarContainer: {
    width: "100%",
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
    overflow: "hidden",
  },
  toolbarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    width: "100%",
  },
  chevronIcon: { width: 14, height: 8, resizeMode: "contain", top: -2 },
  expandedContent: { width: "100%", gap: 14 },
  headingsScroll: { width: "100%", flexGrow: 0 },
  headingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameText: {
    fontSize: 20,
    paddingHorizontal: 12,
    height: 36,
    lineHeight: 34,
    borderWidth: 1,
    borderColor: "transparent",
  },
  headingText: {
    paddingHorizontal: 12,
    height: 36,
    lineHeight: 34,
    borderWidth: 1,
    borderColor: "transparent",
  },
  subtitleText: {
    fontSize: 16,
    paddingHorizontal: 12,
    height: 36,
    lineHeight: 34,
    borderWidth: 1,
    borderColor: "transparent",
  },
  mainText: {
    fontSize: 16,
    fontFamily: "MontserratMedium",
    paddingHorizontal: 12,
    height: 36,
    lineHeight: 34,
    borderWidth: 1,
    borderColor: "transparent",
  },
  monospacedText: {
    fontSize: 16,
    fontFamily: "CourierPrime",
    paddingHorizontal: 12,
    height: 36,
    lineHeight: 34,
    borderWidth: 1,
    borderColor: "transparent",
  },
  headingActive: {
    color: colors.mainColor,
    borderColor: colors.mainColor,
    borderRadius: 16,
    overflow: "hidden",
  },
  actionsMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  segmentedButtonGroup: {
    flexDirection: "row",
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    overflow: "hidden",
  },
  segmentBtn: {
    paddingHorizontal: 12,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 36,
  },
  divider: { width: 2, backgroundColor: colors.white, alignSelf: "stretch" },
  segmentLeft: { borderTopLeftRadius: 14, borderBottomLeftRadius: 14 },
  segmentRight: {
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderRightWidth: 0,
  },
  segmentBtnActive: { backgroundColor: colors.mainColor },
  btnText: { fontFamily: "MontserratBold", color: "#1E1F4B", fontSize: 15 },
  italicText: { fontStyle: "italic", fontFamily: "MontserratItalic" },
  underlineText: { textDecorationLine: "underline" },
  strikethroughText: { textDecorationLine: "line-through" },

  colorCircle: {
    width: 14,
    height: 14,
    borderRadius: 9,
    backgroundColor: "#FF8E9E",
  },
  actionsBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  listText: { fontSize: 14 },
  btnIcon: { width: 16, height: 16, resizeMode: "contain" },
  btnIconCode: { width: 25, height: 17, resizeMode: "contain" },
  codeBtn: {
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  doneRow: { width: "100%", marginTop: 2 },
});
