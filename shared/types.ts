// Общие типы моста между RN-приложением и Lexical-редактором внутри WebView.
// Основано на архитектуре https://github.com/seranking-planable/react-native-lexical (shared/types.ts),
// расширено под тулбар FlashMind (заголовки, списки, код, цвет текста).
//
// ВАЖНО: файл не импортирует типы из 'lexical' напрямую — суб-приложение
// lexical-editor использует СВОЮ версию lexical (^0.14), а приложение — ^0.49.
// Поэтому форматы команд объявлены локальными объединениями (совместимы с обеими).
import type { BridgeStore } from '@webview-bridge/react-native';

export type HeadingLevelType = 'h1' | 'h2' | 'h3';

export type ListKindType = 'bullet' | 'number';

/** Подмножество TextFormatType (lexical), используемое тулбаром. */
export type EditorTextFormat =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code';

/** Подмножество ElementFormatType (lexical), используемое тулбаром. */
export type EditorElementFormat = 'left' | 'center' | 'right' | 'justify';

export type EditorParams = {
  namespace?: string;
  /** Текст-подсказка пустого редактора */
  placeholder?: string;
  /** Начальное состояние редактора в формате JSON Lexical */
  initialEditorState?: string;
  /** Начальное состояние редактора в формате HTML (используется FlashMind) */
  initialHtml?: string;
  enableOnChangePlugin?: {
    includePlainText: boolean;
    includeHtmlText: boolean;
    includeJsonState: boolean;
  };
};

export type OnChangePayload = {
  plainText?: string;
  htmlText?: string;
  jsonState?: string;
};

export type ToolbarState = {
  canUndo: boolean;
  canRedo: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  /** Инлайн-код («Моноширинный шрифт» / кнопка кода) */
  isCode: boolean;
  /** Текущий уровень заголовка под курсором */
  headingLevel: HeadingLevelType | null;
  /** Тип списка под курсором */
  listType: ListKindType | null;
  elementFormat: EditorElementFormat;
};

/** Методы, которые RN вызывает ВНУТРИ WebView (регистрируются на web-стороне). */
export type WebBridge = {
  undoCommand(): Promise<void>;
  redoCommand(): Promise<void>;
  formatTextCommand(payload: EditorTextFormat): Promise<void>;
  formatElementCommand(payload: EditorElementFormat): Promise<void>;
  setHeadingCommand(level: HeadingLevelType | 'paragraph'): Promise<void>;
  toggleBulletListCommand(): Promise<void>;
  toggleOrderedListCommand(): Promise<void>;
  toggleCodeCommand(): Promise<void>;
  setColorCommand(color: string): Promise<void>;
  getEditorHtml(): Promise<string>;
  setEditorHtml(htmlString: string): Promise<void>;
  getEditorJson(): Promise<string>;
  setEditorJson(jsonString: string): Promise<void>;
};

// this gets called from the webview part
export type EditorBridgeState = {
  isReady: boolean;
  setReady: (b: boolean) => Promise<void>;
  toolbarState: ToolbarState;
  setToolbarState: (s: ToolbarState) => Promise<void>;
  hasFocus: boolean;
  setFocus: (focus: boolean) => Promise<void>;
  changeNotification: (payload: OnChangePayload) => Promise<void>;
};

export type EditorBridge = BridgeStore<EditorBridgeState>;
