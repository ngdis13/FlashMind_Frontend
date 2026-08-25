// МОДУЛЬ ТОЛЬКО ДЛЯ НАТИВНЫХ ПЛАТФОРМ (iOS/Android). На web не импортировать статически.
//
// Создаёт WebView, связанный с editorBridge через @webview-bridge/react-native —
// ровно как createWebView(...) в src/Toolbar.tsx репозитория
// https://github.com/seranking-planable/react-native-lexical
import { createWebView } from '@webview-bridge/react-native';

import htmlString from '../../../../shared/generated/lexicalHtmlString';
import { editorBridge } from './editorBridge';
import type { WebBridge } from '@/shared/types';

/** Готовая single-file сборка Lexical-редактора (результат npm run build в lexical-editor). */
export const lexicalEditorHtml: string = htmlString;

export const { WebView: LexicalBridgeWebView, linkWebMethod } = createWebView({
  bridge: editorBridge,
  // В dev прокидывает console.log из WebView в нативный лог — удобно для диагностики
  debug: __DEV__,
});

/** Методы для вызова команд ВНУТРИ WebView (undo/redo/format/...). */
export const LexicalWebMethods = linkWebMethod<WebBridge>();
