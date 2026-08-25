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
import { ColorPalette } from "../../components/colorPalette";

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

const EXPANDED_HEIGHT = 200;
const COLLAPSED_HEIGHT = 45;

interface CustomRichToolbarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onDone: () => void;
  onAction: (actionType: string, payload?: any) => void;
  externalActiveKeys: string[];
  externalSelectedFont: string | null;
}

export const CustomRichToolbar: React.FC<CustomRichToolbarProps> = ({
  isExpanded,
  onToggle,
  onDone,
  onAction,
  externalActiveKeys = [],
  externalSelectedFont = null,
}) => {
  const height = useSharedValue(isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
  
  useEffect(() => {
    height.value = withTiming(isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT, {
      duration: 250,
    });
  }, [isExpanded, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const [selectedColor, setSelectedColor] = useState(colors.red1);
  const [isPaletteVisible, setIsPaletteVisible] = useState(false);
  const [isPencilActive, setIsPencilActive] = useState(false);

  const isActive = (key: string) => externalActiveKeys.includes(key);
  const isFontActive = (key: string) => externalSelectedFont === key;

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    onAction("SET_COLOR", color);
  };

  const handlePencilPress = () => {
    setIsPencilActive((prev) => !prev);
    onAction("pencil");
  };

  const Container: any = Platform.OS === "web" ? View : Animated.View;
  const containerStyle = Platform.OS === "web"
    ? [styles.toolbarContainer, { height: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT }]
    : [styles.toolbarContainer, animatedStyle];

  return (
    <Container style={containerStyle}>
      {/* 1. ШАПКА ПАНЕЛИ */}
      <Pressable style={styles.toolbarHeader} onPress={onToggle} hitSlop={15}>
        <Typography variant="h2">Форматирование</Typography>
        <Image
          source={ArrowIcon}
          style={[styles.chevronIcon, { transform: [{ rotate: isExpanded ? "0deg" : "180deg" }] }]}
        />
      </Pressable>

      {/* 2. СОДЕРЖИМОЕ ПАНЕЛИ */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* СТРОКА 1: Шрифты (Используем onPressIn против сброса фокуса клавиатуры) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.headingsScroll} contentContainerStyle={styles.headingsRow}>
            <Pressable onPressIn={() => onAction("H1")} hitSlop={5}>
              <Typography variant="span" style={[styles.nameText, isFontActive("H1") && styles.headingActive]}>Название</Typography>
            </Pressable>
            <Pressable onPressIn={() => onAction("H2")} hitSlop={5}>
              <Typography variant="span" style={[styles.headingText, isFontActive("H2") && styles.headingActive]}>Заголовок</Typography>
            </Pressable>
            <Pressable onPressIn={() => onAction("H3")} hitSlop={5}>
              <Typography variant="span" style={[styles.subtitleText, isFontActive("H3") && styles.headingActive]}>Подзаголовок</Typography>
            </Pressable>
            <Pressable onPressIn={() => onAction("main")} hitSlop={5}>
              <Typography variant="span" style={[styles.mainText, isFontActive("main") && styles.headingActive]}>Основной текст</Typography>
            </Pressable>
            <Pressable onPressIn={() => onAction("mono")} hitSlop={5}>
              <Typography variant="span" style={[styles.monospacedText, isFontActive("mono") && styles.headingActive]}>Моноширинный шрифт</Typography>
            </Pressable>
          </ScrollView>

          {/* СТРОКА 2: Группа BIUS + Цвет */}
          <View style={styles.actionsMainRow}>
            <View style={styles.segmentedButtonGroup}>
              <Pressable style={[styles.segmentBtn, styles.segmentLeft, isActive("bold") && styles.segmentBtnActive]} onPressIn={() => onAction("bold")}>
                <Image source={BoldTextIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={[styles.segmentBtn, isActive("italic") && styles.segmentBtnActive]} onPressIn={() => onAction("italic")}>
                <Image source={ItalicTextIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={[styles.segmentBtn, isActive("underline") && styles.segmentBtnActive]} onPressIn={() => onAction("underline")}>
                <Image source={UnderlineTextIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={[styles.segmentBtn, styles.segmentRight, isActive("strikeThrough") && styles.segmentBtnActive]} onPressIn={() => onAction("strikeThrough")}>
                <Image source={CrossedTextIcon} style={styles.btnIcon} />
              </Pressable>
            </View>

            <View style={styles.segmentedButtonGroup}>
              <Pressable style={[styles.segmentBtn, styles.segmentLeft, isPencilActive && styles.segmentBtnActive]} onPressIn={handlePencilPress}>
                <Image source={PencilIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <View style={[styles.segmentBtn, styles.segmentRight]}>
                <Pressable onPressIn={() => setIsPaletteVisible(true)} disabled={!isPencilActive} hitSlop={6}>
                  <View style={[styles.colorCircle, { backgroundColor: selectedColor }]} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* СТРОКА 3: Списки, выравнивание и код */}
          <View style={styles.actionsBottomRow}>
            <View style={styles.segmentedButtonGroup}>
              <Pressable style={[styles.segmentBtn, styles.segmentLeft, isActive("bulletList") && styles.segmentBtnActive]} onPressIn={() => onAction("bulletList")}>
                <Image source={MarkListIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={[styles.segmentBtn, isActive("list") && styles.segmentBtnActive]} onPressIn={() => onAction("list")}>
                <Image source={ListIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={[styles.segmentBtn, styles.segmentRight, isActive("numberedList") && styles.segmentBtnActive]} onPressIn={() => onAction("numberedList")}>
                <Image source={NumericListIcon} style={styles.btnIcon} />
              </Pressable>
            </View>

            <View style={styles.segmentedButtonGroup}>
              <Pressable style={[styles.segmentBtn, styles.segmentLeft, isActive("alignLeft") && styles.segmentBtnActive]} onPressIn={() => onAction("alignLeft")}>
                <Image source={LeftTextIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={[styles.segmentBtn, isActive("alignCenter") && styles.segmentBtnActive]} onPressIn={() => onAction("alignCenter")}>
                <Image source={CenterTextIcon} style={styles.btnIcon} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={[styles.segmentBtn, styles.segmentRight, isActive("alignRight") && styles.segmentBtnActive]} onPressIn={() => onAction("alignRight")}>
                <Image source={RightTextIcon} style={styles.btnIcon} />
              </Pressable>
            </View>

            <Pressable style={[styles.codeBtn, isActive("code") && styles.segmentBtnActive]} onPressIn={() => onAction("code")}>
              <Image source={CodeIcon} style={styles.btnIconCode} />
            </Pressable>
          </View>
        </View>
      )}
      {isPaletteVisible && (
        <ColorPalette
          title="Выберите цвет текста"
          onCancel={() => setIsPaletteVisible(false)}
          onSelectColor={handleSelectColor}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  toolbarContainer: { width: "100%", backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingHorizontal: 16, paddingBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 5, overflow: "hidden" },
  toolbarHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, width: "100%" },
  chevronIcon: { width: 14, height: 8, resizeMode: "contain", top: -2 },
  expandedContent: { width: "100%", gap: 14 },
  headingsScroll: { width: "100%", flexGrow: 0 },
  headingsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  nameText: { fontSize: 20, paddingHorizontal: 12, height: 36, lineHeight: 34, borderWidth: 1, borderColor: "transparent" },
  headingText: { paddingHorizontal: 12, height: 36, lineHeight: 34, borderWidth: 1, borderColor: "transparent" },
  subtitleText: { fontSize: 16, paddingHorizontal: 12, height: 36, lineHeight: 34, borderWidth: 1, borderColor: "transparent" },
  mainText: { fontSize: 16, fontFamily: "MontserratMedium", paddingHorizontal: 12, height: 36, lineHeight: 34, borderWidth: 1, borderColor: "transparent" },
  monospacedText: { fontSize: 16, fontFamily: "CourierPrime", paddingHorizontal: 12, height: 36, lineHeight: 34, borderWidth: 1, borderColor: "transparent" },
  headingActive: { color: colors.mainColor, borderColor: colors.mainColor, borderRadius: 16, overflow: "hidden" },
  actionsMainRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" },
  segmentedButtonGroup: { flexDirection: "row", backgroundColor: colors.lightGray, borderRadius: 20, overflow: "hidden" },
  segmentBtn: { paddingHorizontal: 12, height: 36, justifyContent: "center", alignItems: "center", minWidth: 36 },
  divider: { width: 2, backgroundColor: colors.white, alignSelf: "stretch" },
  segmentLeft: { borderTopLeftRadius: 14, borderBottomLeftRadius: 14 },
  segmentRight: { borderTopRightRadius: 14, borderBottomRightRadius: 14, borderRightWidth: 0 },
  segmentBtnActive: { backgroundColor: colors.mainColor },
  btnText: { fontFamily: "MontserratBold", color: "#1E1F4B", fontSize: 15 },
  italicText: { fontStyle: "italic", fontFamily: "MontserratItalic" },
  underlineText: { textDecorationLine: "underline" },
  strikethroughText: { textDecorationLine: "line-through" },
  colorCircle: { width: 14, height: 14, borderRadius: 9, backgroundColor: "#FF8E9E" },
  actionsBottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" },
  btnIcon: { width: 16, height: 16, resizeMode: "contain" },
  btnIconCode: { width: 25, height: 17, resizeMode: "contain" },
  codeBtn: { backgroundColor: colors.lightGray, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, justifyContent: "center", alignItems: "center" },
});