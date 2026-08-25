// НАТИВНАЯ версия редактора (iOS/Android): Lexical внутри WebView.
// Повторяет связку из App.tsx репозитория
// https://github.com/seranking-planable/react-native-lexical:
//  - single-file сборка редактора грузится как source={{ html }};
//  - window.editorParams инжектится до загрузки контента;
//  - изменения контента приходят через bridge.changeNotification;
//  - состояние тулбара — через bridge.toolbarState.
//
// МОДУЛЬ ТОЛЬКО ДЛЯ Platform.OS !== 'web'.
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import type { WebViewMessageEvent } from 'react-native-webview';
import { useBridge } from '@webview-bridge/react-native';

import { LexicalBridgeWebView, lexicalEditorHtml } from './LexicalWebView';
import { editorBridge, subscribeToEditorChanges } from './editorBridge';
import type { EditorParams, ToolbarState } from '@/shared/types';

interface WebViewEditorProps {
  initialHtml: string;
  onChange: (html: string, textLength: number) => void;
  onSelectionState?: (state: ToolbarState) => void;
  /** Фокус редактора (мост hasFocus) — чтобы показывать тулбар вместе с клавиатурой */
  onHasFocus?: (hasFocus: boolean) => void;
}

let mountCounter = 0;

export const LexicalWebViewEditor: React.FC<WebViewEditorProps> = ({
  initialHtml,
  onChange,
  onSelectionState,
  onHasFocus,
}) => {
  // Уникальный namespace на каждый монтаж — страховка от переиспользования стейта
  const namespace = useMemo(() => `FlashMindLexical_${++mountCounter}`, []);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // changeNotification из WebView → локальный стейт экрана
  useEffect(() => {
    return subscribeToEditorChanges((payload) => {
      if (typeof payload.htmlText === 'string') {
        onChangeRef.current(payload.htmlText, (payload.plainText ?? '').length);
      }
    });
  }, []);

  // toolbarState из моста → подсветка кнопок тулбара
  const { toolbarState, hasFocus } = useBridge(editorBridge);
  const onSelectionStateRef = useRef(onSelectionState);
  onSelectionStateRef.current = onSelectionState;
  const onHasFocusRef = useRef(onHasFocus);
  onHasFocusRef.current = onHasFocus;

  useEffect(() => {
    onSelectionStateRef.current?.(toolbarState);
  }, [toolbarState]);

  useEffect(() => {
    onHasFocusRef.current?.(hasFocus);
  }, [hasFocus]);

  const editorParams: EditorParams = {
    namespace,
    initialHtml,
    enableOnChangePlugin: {
      includePlainText: true,
      includeHtmlText: true,
      includeJsonState: false,
    },
  };

  const injectedJavaScriptBeforeContentLoaded = `(function() {
      window.editorParams = ${JSON.stringify(editorParams)};
    })();`;

  const onMessage = (_event: WebViewMessageEvent) => {
    // BODY_HEIGHT_CHANGE и прочие служебные сообщения не нужны:
    // высоту области редактора фиксирует контейнер экрана.
  };

  return (
    <LexicalBridgeWebView
      style={styles.webView}
      source={{ html: lexicalEditorHtml }}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      keyboardDisplayRequiresUserAction={false}
      hideKeyboardAccessoryView={true}
      injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
      onMessage={onMessage}
    />
  );
};

const styles = StyleSheet.create({
  webView: { flex: 1, backgroundColor: '#FFFFFF' },
});
