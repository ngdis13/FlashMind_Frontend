// feature-decks/deck-create-card/screens/TermEditor.tsx
//
// Экран термина. Движок — тот же редактор из
// https://github.com/seranking-planable/react-native-lexical (Lexical в WebView),
// что и в TextEditor: тулбар над полем, размер поля как у карточки в превью.
// Отличие: лимит 40 символов — счётчик краснеет, «Готово» блокируется при превышении.
import {
  ScrollView,
  View,
  Image,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { useCardStore } from "@/store/card.store";
import { MainButton } from "@/components/MainButton";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { LexicalToolbar } from "../LexicalToolbar";
import {
  applyToolbarActionLocally,
  sendToolbarActionToWebView,
} from "../lexical/toolbarActions";
import { INITIAL_TOOLBAR_STATE } from "../editorBridge";
import type { ToolbarState } from "@/shared/types";

const MAX_TERM_LENGTH = 40;

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
// Платформенно-условная загрузка: на web — прямой Lexical, на нативе — WebView-версия.
let LexicalDirectEditor: any;
let LexicalWebViewEditor: any;
if (Platform.OS === "web") {
  LexicalDirectEditor = require("../LexicalDirectEditor").LexicalDirectEditor;
} else {
  LexicalWebViewEditor =
    require("../LexicalWebViewEditor").LexicalWebViewEditor;
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

export const TermEditor = () => {
  const router = useRouter();
  const { id, side, blockId, cardId } = useLocalSearchParams<{
    id: string;
    side: string;
    blockId: string;
    cardId?: string;
  }>();

  const front = useCardStore((s) => s.draftFront);
  const back = useCardStore((s) => s.draftBack);
  const updateDraftBlockValue = useCardStore((s) => s.updateDraftBlockValue);

  const sideKey: "front" | "back" = side === "front" ? "front" : "back";
  const block = (sideKey === "front" ? front : back).find(
    (b) => b.id === blockId,
  );

  const initialValue =
    block && (block.type === "term" || block.type === "text")
      ? block.value
      : "";

  // Локальный стейт, чтобы Zustand не перерендеривался на каждый символ
  const [localHtml, setLocalHtml] = useState(initialValue);
  const [textLength, setTextLength] = useState(0);

  // Сырое состояние тулбара из моста (как в репозитории react-native-lexical)
  const [editorToolbarState, setEditorToolbarState] = useState<ToolbarState>(
    INITIAL_TOOLBAR_STATE,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lexicalEditorRef = useRef<any>(null);

  const isOverflowed = textLength > MAX_TERM_LENGTH;

  const handleEditorChange = useCallback((html: string, length: number) => {
    setLocalHtml(html);
    setTextLength(length);
  }, []);

  // ToolbarState из моста → подсветка кнопок тулбара
  const handleSelectionState = useCallback((state: ToolbarState) => {
    setEditorToolbarState(state);
  }, []);

  const handleBack = (): void => {
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      params: cardId ? { side, cardId } : { side },
    });
  };

  const handleToolbarAction = (actionType: string, payload?: unknown) => {
    if (Platform.OS === "web") {
      // === Веб-окружение: команды к локальному Lexical ===
      if (lexicalEditorRef.current) {
        applyToolbarActionLocally(
          lexicalEditorRef.current,
          actionType,
          payload,
        );
      }
    } else {
      // === Мобильное окружение: команды внутрь WebView через мост ===
      void sendToolbarActionToWebView(actionType, payload);
    }
  };

  // Функция сохранения при клике на MainButton внизу
  const handleSave = (): void => {
    if (isOverflowed) return; // лимит термина превышен
    updateDraftBlockValue(sideKey, blockId, localHtml.trim());
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      params: cardId ? { side, cardId } : { side },
    });
  };

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
          {/* Шапка — как на экране текста */}
          <View style={[styles.header, styles.contentWidth]}>
            <Pressable onPress={handleBack} style={styles.backButton} hitSlop={20}>
              <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
            </Pressable>
            <Typography variant="h2">Термин</Typography>
          </View>

          {/* Панель форматирования — над контейнером ввода */}
          <View style={[styles.toolbarWrapper, styles.contentWidth]}>
            <LexicalToolbar
              state={editorToolbarState}
              onAction={handleToolbarAction}
            />
          </View>

          {/* Инпут-бокс */}
          <View style={[styles.workArea, styles.contentWidth]}>
            <View style={styles.editorBox}>
              {Platform.OS === "web" ? (
                <LexicalDirectEditor
                  initialHtml={localHtml}
                  onChange={handleEditorChange}
                  onSelectionState={handleSelectionState}
                  editorRef={lexicalEditorRef}
                  placeholder="Введите термин"
                />
              ) : (
                <LexicalWebViewEditor
                  initialHtml={localHtml}
                  onChange={handleEditorChange}
                  onSelectionState={handleSelectionState}
                  placeholder="Введите термин"
                />
              )}
            </View>

            {/* Счетчик символов */}
            <Typography
              variant="h3"
              color={isOverflowed ? colors.red1 : colors.darkGray}
              style={styles.counter}
            >
              {textLength} / {MAX_TERM_LENGTH}
            </Typography>
          </View>
        </ScrollView>

        {/* Стандартная кнопка в самом низу экрана */}
        <View style={[styles.saveButtonWrapper, styles.contentWidth]}>
          <MainButton
            style={[
              styles.saveButton,
              ...(isOverflowed ? [styles.saveDisabled] : []),
            ]}
            title={isOverflowed ? `Максимум ${MAX_TERM_LENGTH} символов` : "Готово"}
            onPress={handleSave}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 16,
    width: "100%",
  },
  backButton: { position: "absolute", left: -20, padding: 20 },
  contentWidth: { width: "100%", maxWidth: 800, alignSelf: "center" },
  toolbarWrapper: { width: "100%", marginBottom: 12 },
  workArea: { width: "100%", borderRadius: 20 },
  // Размер — как у карточки в превью и как в TextEditor (372×520)
  editorBox: {
    width: 372,
    maxWidth: "100%",
    alignSelf: "center",
    height: 520,
    backgroundColor: colors.white,
    overflow: "hidden",
    borderRadius: 20,
  },
  counter: { alignSelf: "flex-end", marginTop: 8 },
  saveButtonWrapper: {
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: BOTTOM_MARGIN,
  },
  saveButton: { width: "100%" },
  saveDisabled: { opacity: 0.5 },
});
