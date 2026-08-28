// Тулбар редактора — визуальная копия src/Toolbar.tsx из
// https://github.com/seranking-planable/react-native-lexical
// (TouchableOpacity + FontAwesomeIcon, touchableBg/touchableBgActive, canUndo/canRedo),
// расширенная под FlashMind: заголовки H1–H3, обычный текст, списки,
// инлайн-код и цвет текста — в том же визуальном языке.
//
// Состояние приходит из моста (bridge.toolbarState), команды уходят через onAction.
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faAlignCenter,
  faAlignJustify,
  faAlignLeft,
  faAlignRight,
  faBold,
  faCode,
  faItalic,
  faListOl,
  faListUl,
  faPalette,
  faRotateLeft,
  faRotateRight,
  faStrikethrough,
  faUnderline,
} from "@fortawesome/free-solid-svg-icons";

import { ColorPaletteText } from "../components/ColorPaletteText";
import { colors } from "@/styles/Colors";
import type { ToolbarState } from "@/shared/types";

interface LexicalToolbarProps {
  state: ToolbarState;
  onAction: (action: string, payload?: unknown) => void;
}

export const LexicalToolbar: React.FC<LexicalToolbarProps> = ({
  state,
  onAction,
}) => {
  const [isPaletteVisible, setIsPaletteVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FF8E9E");

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {/* Undo / Redo — как в репозитории: disabled без истории */}
        <TouchableOpacity
          {...(state.canUndo
            ? { onPress: () => onAction("undo") }
            : { disabled: true })}
        >
          <View style={styles.touchableBg}>
            <FontAwesomeIcon
              icon={faRotateLeft}
              style={state.canUndo ? styles.btnEnabled : styles.btnDisabled}
              size={16}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          {...(state.canRedo
            ? { onPress: () => onAction("redo") }
            : { disabled: true })}
        >
          <View style={styles.touchableBg}>
            <FontAwesomeIcon
              icon={faRotateRight}
              style={state.canRedo ? styles.btnEnabled : styles.btnDisabled}
              size={16}
            />
          </View>
        </TouchableOpacity>

        {/* BIUS */}
        <TouchableOpacity onPress={() => onAction("bold")}>
          <View style={state.isBold ? styles.touchableBgActive : styles.touchableBg}>
            <FontAwesomeIcon icon={faBold} size={16} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAction("italic")}>
          <View style={state.isItalic ? styles.touchableBgActive : styles.touchableBg}>
            <FontAwesomeIcon icon={faItalic} size={16} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAction("underline")}>
          <View style={state.isUnderline ? styles.touchableBgActive : styles.touchableBg}>
            <FontAwesomeIcon icon={faUnderline} size={16} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAction("strikeThrough")}>
          <View
            style={
              state.isStrikethrough ? styles.touchableBgActive : styles.touchableBg
            }
          >
            <FontAwesomeIcon icon={faStrikethrough} size={16} />
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Заголовки / обычный текст */}
        {(["H1", "H2", "H3"] as const).map((label) => {
          const level = label.toLowerCase() as "h1" | "h2" | "h3";
          return (
            <TouchableOpacity
              key={label}
              onPress={() => onAction(label)}
            >
              <View
                style={
                  state.headingLevel === level
                    ? styles.touchableBgActive
                    : styles.touchableBg
                }
              >
                <Text style={styles.headingBtn}>{label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity onPress={() => onAction("main")}>
          <View
            style={
              state.headingLevel === null && !state.isCode
                ? styles.touchableBgActive
                : styles.touchableBg
            }
          >
            <Text style={styles.headingBtn}>Aa</Text>
          </View>
        </TouchableOpacity>

        {/* Списки и код */}
        <TouchableOpacity onPress={() => onAction("bulletList")}>
          <View
            style={
              state.listType === "bullet"
                ? styles.touchableBgActive
                : styles.touchableBg
            }
          >
            <FontAwesomeIcon icon={faListUl} size={16} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAction("numberedList")}>
          <View
            style={
              state.listType === "number"
                ? styles.touchableBgActive
                : styles.touchableBg
            }
          >
            <FontAwesomeIcon icon={faListOl} size={16} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAction("code")}>
          <View style={state.isCode ? styles.touchableBgActive : styles.touchableBg}>
            <FontAwesomeIcon icon={faCode} size={16} />
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Выравнивание */}
        <TouchableOpacity onPress={() => onAction("alignLeft")}>
          <View
            style={
              state.elementFormat === "left"
                ? styles.touchableBgActive
                : styles.touchableBg
            }
          >
            <FontAwesomeIcon icon={faAlignLeft} size={16} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAction("alignCenter")}>
          <View
            style={
              state.elementFormat === "center"
                ? styles.touchableBgActive
                : styles.touchableBg
            }
          >
            <FontAwesomeIcon icon={faAlignCenter} size={16} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAction("alignRight")}>
          <View
            style={
              state.elementFormat === "right"
                ? styles.touchableBgActive
                : styles.touchableBg
            }
          >
            <FontAwesomeIcon icon={faAlignRight} size={16} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAction("alignJustify")}>
          <View
            style={
              state.elementFormat === "justify"
                ? styles.touchableBgActive
                : styles.touchableBg
            }
          >
            <FontAwesomeIcon icon={faAlignJustify} size={16} />
          </View>
        </TouchableOpacity>

        {/* Цвет текста (кисть) */}
        <TouchableOpacity onPress={() => setIsPaletteVisible(true)}>
          <View style={styles.touchableBg}>
            <FontAwesomeIcon icon={faPalette} size={16} />
            <View
              style={[styles.colorCircle, { backgroundColor: selectedColor }]}
            />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {isPaletteVisible && (
        <ColorPaletteText
          title="Выберите цвет текста"
          onCancel={() => setIsPaletteVisible(false)}
          onSelectColor={(color: string) => {
            setSelectedColor(color);
            onAction("SET_COLOR", color);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  touchableBg: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  // Активная кнопка подсвечивается фирменным цветом приложения
  touchableBgActive: {
    padding: 4,
    backgroundColor: colors.lightMainColor,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnEnabled: {
    color: "#000",
  },
  btnDisabled: {
    color: "#aaa",
  },
  headingBtn: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: "#eee",
    marginHorizontal: 4,
  },
  colorCircle: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fff",
  },
});
