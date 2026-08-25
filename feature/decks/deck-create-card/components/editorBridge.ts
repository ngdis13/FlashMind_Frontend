// RN-сторона моста с Lexical-редактором внутри WebView.
// Повторяет src/editor-bridge.ts из https://github.com/seranking-planable/react-native-lexical,
// changeNotification дополнительно рассылается подписчикам (для onUpdate карточки).
import { bridge } from '@webview-bridge/react-native';
import type { EditorBridgeState, OnChangePayload, ToolbarState } from '@/shared/types';

type ChangeListener = (payload: OnChangePayload) => void;

const changeListeners = new Set<ChangeListener>();

/** Подписка на изменения контента редактора (changeNotification из WebView). */
export function subscribeToEditorChanges(listener: ChangeListener): () => void {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

export const INITIAL_TOOLBAR_STATE: ToolbarState = {
  canUndo: false,
  canRedo: false,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isCode: false,
  headingLevel: null,
  listType: null,
  elementFormat: 'left',
};

export const editorBridge = bridge<EditorBridgeState>(({ set }) => ({
  isReady: false,
  async setReady(b: boolean) {
    set({ isReady: b });
  },
  toolbarState: INITIAL_TOOLBAR_STATE,
  async setToolbarState(s: ToolbarState) {
    set({ toolbarState: s });
  },
  hasFocus: false,
  async setFocus(focus: boolean): Promise<void> {
    set({ hasFocus: focus });
  },
  async changeNotification(payload: OnChangePayload): Promise<void> {
    changeListeners.forEach((listener) => listener(payload));
  },
}));
