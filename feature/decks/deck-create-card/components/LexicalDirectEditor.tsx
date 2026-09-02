// WEB-версия редактора: тот же Lexical из репозитория
// https://github.com/seranking-planable/react-native-lexical (lexical-editor/src/Editor.tsx),
// но отрендеренный напрямую в React DOM приложения (без iframe),
// с тем же набором узлов/тем и тем же набором команд, что и WebView-версия.
//
// МОДУЛЬ ТОЛЬКО ДЛЯ Platform.OS === 'web'.
import React, { useEffect, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FOCUS_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  type ElementNode,
  type LexicalEditor,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { HeadingNode, QuoteNode, $isHeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode, $isListNode } from "@lexical/list";

import EditorTheme from "./lexical/EditorTheme";
import { getSelectedNode } from "./lexical/getSelectedNode";
import type {
  HeadingLevelType,
  ListKindType,
  ToolbarState,
} from "@/shared/types";

// Стили тем Lexical для web-версии. Внутри WebView они вшиты в сборку (Editor.css),
// а здесь их нужно внедрить на страницу вручную: без них форматы (bold/italic/...)
// применяются в модели, но визуально не видны.
// Селекторы ограничены корнем редактора, чтобы стили не утекали на весь сайт
const EDITOR_THEME_CSS = `
#lexical-direct-editor-root p { margin: 0; padding: 0; }
.editor-text-bold { font-family: "MontserratBold", sans-serif; font-weight: 400; }
.editor-text-italic { font-style: italic; }
.editor-text-underline { text-decoration: underline; }
.editor-text-strikethrough { text-decoration: line-through; }
.editor-text-underlineStrikethrough { text-decoration: underline line-through; }
.editor-text-code { font-family: 'CourierPrime', monospace; background: #f4f4f9; padding: 1px 4px; border-radius: 4px; font-size: 16px; }
.editor-heading-h1 { font-size: 24px; font-weight: 400; font-family: "MontserratBold", sans-serif; margin: 12px 0; color: #1E1F4B; }
.editor-heading-h2 { font-size: 20px; font-weight: 400; font-family: "MontserratBold", sans-serif; margin: 10px 0; color: #1E1F4B; }
.editor-heading-h3 { font-size: 18px; font-weight: 400; font-family: "MontserratSemiBold", sans-serif; margin: 8px 0; color: #1E1F4B; }
.editor-list-ul { list-style-type: disc; padding-left: 22px; margin: 8px 0; }
.editor-list-ol { list-style-type: decimal; padding-left: 22px; margin: 8px 0; }
.editor-listitem { margin: 2px 0; }
.editor-quote { margin: 8px 0; padding-left: 12px; border-left: 4px solid #ddd; color: #55556e; }
`;

// Однократная инжекция стилей темы в <head>
const ThemeStyleInjection = () => {
  React.useEffect(() => {
    const STYLE_ID = "lexical-direct-editor-css";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = EDITOR_THEME_CSS;
      document.head.appendChild(style);
    }
  }, []);
  return null;
};

interface DirectEditorProps {
  initialHtml: string;
  onChange: (html: string, textLength: number) => void;
  onSelectionState?: (state: ToolbarState) => void;
  editorRef: React.MutableRefObject<LexicalEditor | null>;
  /** Подсказка пустого поля (по умолчанию «Введите текст...») */
  placeholder?: string;
}

const INITIAL_TOOLBAR_STATE: ToolbarState = {
  canUndo: false,
  canRedo: false,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isCode: false,
  headingLevel: null,
  listType: null,
  elementFormat: "left",
};

type BridgePluginProps = {
  onChange: (html: string, textLength: number) => void;
  onSelectionState?: (state: ToolbarState) => void;
};

// Аналог EditorBridgePlugin из репозитория, но состояние уходит напрямую в RN-сторону.
const DirectBridgePlugin = ({
  onChange,
  onSelectionState,
}: BridgePluginProps) => {
  const [editor] = useLexicalComposerContext();
  // Флаги истории хранятся отдельно и подмешиваются в каждое состояние:
  // иначе SELECTION_CHANGE/BLUR затирали canUndo/canRedo нулями,
  // и стрелки undo/redo оставались задизейбленными.
  const historyFlagsRef = useRef({ canUndo: false, canRedo: false });

  useEffect(() => {
    const emitState = () => {
      onSelectionState?.({
        ...readToolbarState(editor),
        ...historyFlagsRef.current,
      });
    };

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const html = $generateHtmlFromNodes(editor, null);
          const textLength = $getRoot().getTextContent().length;
          onChange(html, textLength);
        });
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload: boolean) => {
          historyFlagsRef.current.canUndo = payload;
          emitState();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload: boolean) => {
          historyFlagsRef.current.canRedo = payload;
          emitState();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          emitState();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          emitState();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      // На blur состояние панели намеренно НЕ сбрасываем (как в репозитории):
      // сброс дизейблил кнопки в момент нажатия и ломал undo/redo.
    );
  }, [editor, onChange, onSelectionState]);

  return null;
};

// Чтение состояния выделения — 1:1 с updateToolbar в EditorBridgePlugin репозитория.
function readToolbarState(editor: LexicalEditor): ToolbarState {
  let state: ToolbarState = { ...INITIAL_TOOLBAR_STATE };
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return;
    }
    const node = getSelectedNode(selection);
    const heading = $isHeadingNode(node)
      ? node
      : mergeFind(node, (p) => $isHeadingNode(p));
    const list = $isListNode(node)
      ? node
      : mergeFind(node, (p) => $isListNode(p));

    let headingLevel: HeadingLevelType | null = null;
    if ($isHeadingNode(heading)) {
      const tag = heading.getTag();
      headingLevel = tag === "h1" || tag === "h2" || tag === "h3" ? tag : null;
    }

    let listType: ListKindType | null = null;
    if ($isListNode(list)) {
      listType = list.getListType() === "number" ? "number" : "bullet";
    }

    // Формат выравнивания хранится на блочном элементе (параграф/заголовок/список)
    const block = (heading ??
      list ??
      mergeFind(node, (p) => !p.isInline())) as ElementNode | null;

    state = {
      canUndo: state.canUndo,
      canRedo: state.canRedo,
      isBold: selection.hasFormat("bold"),
      isItalic: selection.hasFormat("italic"),
      isUnderline: selection.hasFormat("underline"),
      isStrikethrough: selection.hasFormat("strikethrough"),
      isCode: selection.hasFormat("code"),
      headingLevel,
      listType,
      elementFormat: ($isElementNode(block)
        ? block.getFormatType()
        : "left") as ToolbarState["elementFormat"],
    };
  });
  return state;
}

// Локальный аналог $findMatchingParent без лишнего импорта
function mergeFind(
  startNode: ReturnType<typeof getSelectedNode>,
  predicate: (node: import("lexical").LexicalNode) => boolean,
) {
  let current: import("lexical").LexicalNode | null = startNode;
  while (current !== null) {
    if (predicate(current)) {
      return current;
    }
    current = current.getParent();
  }
  return null;
}

export const LexicalDirectEditor: React.FC<DirectEditorProps> = ({
  initialHtml,
  onChange,
  onSelectionState,
  editorRef,
  placeholder = "Введите текст...",
}) => {
  const initialConfig = {
    namespace: "FlashMindEditor",
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    theme: EditorTheme,
    onError: (error: Error) => console.error("[LexicalDirectEditor]", error),
    editorState: (editor: LexicalEditor) => {
      try {
        const parser = new DOMParser();
        const dom = parser.parseFromString(
          initialHtml || "<p></p>",
          "text/html",
        );
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().clear();
        if (nodes.length > 0) {
          $getRoot().append(...nodes);
        }
      } catch (e) {
        console.error("[LexicalDirectEditor] initialHtml parse error →", e);
      }
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        id="lexical-direct-editor-root"
        style={{ position: "relative", height: "100%", outline: "none" }}
      >
        <DirectBridgePlugin
          onChange={onChange}
          onSelectionState={onSelectionState}
        />
        <div
          className="editor-inner"
          style={{ position: "relative", height: "100%" }}
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                style={{
                  outline: "none",
                  minHeight: 280,
                  height: "100%",
                  padding: "16px 14px",
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: "#1E1F4B",
                  fontFamily: "MontserratRegular, Montserrat, sans-serif",
                  boxSizing: "border-box",
                }}
              />
            }
            placeholder={
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 14,
                  color: "#aaa",
                  pointerEvents: "none",
                }}
              >
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <EditorRefPlugin editorRef={editorRef} />
        <ThemeStyleInjection />
      </div>
    </LexicalComposer>
  );
};

// Прокидывает инстанс редактора наружу — для кнопок тулбара (applyToolbarActionLocally).
const EditorRefPlugin = ({
  editorRef,
}: {
  editorRef: React.MutableRefObject<LexicalEditor | null>;
}) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editorRef.current = editor;
  }, [editor, editorRef]);
  return null;
};
