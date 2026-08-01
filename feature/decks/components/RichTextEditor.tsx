import React, { useRef, useEffect, useCallback, useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';

import type { WebView as WebViewType, WebViewMessageEvent } from 'react-native-webview';

interface RichTextEditorProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const TYPOGRAPHY = {
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 600,
  fontSize: '16px',
  color: '#282B54',
  placeholderColor: '#999',
};

// ============================================================================
// HTML — редактор + тулбар внутри
// ============================================================================
const EDITOR_HTML = (placeholder: string): string => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body {
    font-family: ${TYPOGRAPHY.fontFamily};
    font-weight: 400;
    font-size: ${TYPOGRAPHY.fontSize};
    margin: 0;
    padding: 8px;
    background: transparent;
    -webkit-text-size-adjust: 100%;
    color: ${TYPOGRAPHY.color};
  }
  #toolbar {
    display: flex;
    gap: 4px;
    padding: 6px 0;
    border-bottom: 1px solid #ddd;
    margin-bottom: 8px;
    user-select: none;
    -webkit-user-select: none;
    align-items: center;
  }
  .btn {
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: #fff;
    font-family: ${TYPOGRAPHY.fontFamily};
    font-weight: ${TYPOGRAPHY.fontWeight};
    font-size: 14px;
    cursor: pointer;
    min-width: 34px;
    text-align: center;
    color: ${TYPOGRAPHY.color};
    -webkit-tap-highlight-color: transparent;
  }
  .btn:active { background: #dde; border-color: #99f; }
  .separator { width: 1px; height: 24px; background: #ddd; margin: 0 2px; }
  #editor {
    min-height: 100px;
    outline: none;
    line-height: 1.5;
    word-wrap: break-word;
    -webkit-user-select: text;
  }
  #editor b, #editor strong { font-weight: 700; }
  #editor ul, #editor ol { padding-left: 24px; margin: 4px 0; }
  #editor li { margin: 2px 0; }
  #editor:empty::before {
    content: attr(data-placeholder);
    color: ${TYPOGRAPHY.placeholderColor};
    font-weight: ${TYPOGRAPHY.fontWeight};
  }
</style>
</head>
<body>
  <div id="toolbar">
    <button class="btn" data-cmd="bold"><b>B</b></button>
    <button class="btn" data-cmd="italic"><i>I</i></button>
    <button class="btn" data-cmd="underline"><u>U</u></button>
    <span class="separator"></span>
    <button class="btn" data-cmd="insertUnorderedList" title="Маркированный список">•</button>
    <button class="btn" data-cmd="insertOrderedList" title="Нумерованный список">1.</button>
  </div>
  <div id="editor" contenteditable="true" data-placeholder="${placeholder.replace(/"/g, '"')}"></div>

  <script>
    (function() {
      var editor = document.getElementById('editor');
      var toolbar = document.getElementById('toolbar');

      function send() { window.ReactNativeWebView.postMessage(editor.innerHTML); }

      editor.addEventListener('input', send);
      editor.addEventListener('click', function() { editor.focus(); });

      toolbar.addEventListener('touchstart', function(e) {
        e.preventDefault();
        var btn = e.target.closest('.btn');
        if (!btn || !btn.dataset.cmd) return;
        editor.focus();
        document.execCommand(btn.dataset.cmd, false, null);
        send();
      });

      toolbar.addEventListener('mousedown', function(e) {
        e.preventDefault();
        var btn = e.target.closest('.btn');
        if (!btn || !btn.dataset.cmd) return;
        editor.focus();
        document.execCommand(btn.dataset.cmd, false, null);
        send();
      });

      document.addEventListener('gesturestart', function(e) { e.preventDefault(); });

      window.addEventListener('message', function(event) {
        try {
          var data = JSON.parse(event.data);
          if (data.type === 'LOAD_STATE' && typeof data.payload === 'string') {
            editor.innerHTML = data.payload;
          }
        } catch(e) {}
      });
    })();
  </script>
</body>
</html>
`;

// ============================================================================
// Мобильная версия
// ============================================================================
function MobileRichTextEditor({ placeholder, value, onChange }: RichTextEditorProps) {
  const [WebViewComponent, setWebViewComponent] = useState<typeof WebViewType | null>(null);
  const webViewRef = useRef<WebViewType | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('react-native-webview').then((mod) => {
      if (!cancelled) setWebViewComponent(() => mod.WebView);
    });
    return () => { cancelled = true; };
  }, []);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    onChange(event.nativeEvent.data);
  }, [onChange]);

  const handleLoadEnd = useCallback(() => {
    if (!value || !webViewRef.current) return;
    const safeJson = JSON.stringify({ type: 'LOAD_STATE', payload: value })
      .replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    webViewRef.current.injectJavaScript(
      `(function(){try{var d=JSON.parse('${safeJson}');document.getElementById('editor').innerHTML=d.payload||'';}catch(e){}})(); true;`
    );
  }, [value]);

  if (!WebViewComponent) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <WebViewComponent
        ref={webViewRef}
        source={{ html: EDITOR_HTML(placeholder) }}
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
        javaScriptEnabled
        domStorageEnabled
        keyboardDisplayRequiresUserAction={false}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        style={styles.webview}
        originWhitelist={['*']}
      />
    </View>
  );
}

// ============================================================================
// Веб-версия
// ============================================================================
function WebRichTextEditor({ placeholder, value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleBtnMouseDown = useCallback((e: React.MouseEvent, cmd: string) => {
    e.preventDefault();
    editorRef.current?.focus();
    document.execCommand(cmd, false, undefined);
    handleInput();
  }, [handleInput]);

  return (
    <View style={styles.container}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />

      <div style={webStyles.toolbar}>
        <button type="button" onMouseDown={(e) => handleBtnMouseDown(e, 'bold')} style={webStyles.btn}><b>B</b></button>
        <button type="button" onMouseDown={(e) => handleBtnMouseDown(e, 'italic')} style={webStyles.btn}><i>I</i></button>
        <button type="button" onMouseDown={(e) => handleBtnMouseDown(e, 'underline')} style={webStyles.btn}><u>U</u></button>
        <span style={webStyles.separator} />
        <button type="button" onMouseDown={(e) => handleBtnMouseDown(e, 'insertUnorderedList')} style={webStyles.btn} title="Маркированный список">•</button>
        <button type="button" onMouseDown={(e) => handleBtnMouseDown(e, 'insertOrderedList')} style={webStyles.btn} title="Нумерованный список">1.</button>
      </div>

      <div ref={editorRef} contentEditable={true} data-placeholder={placeholder} onInput={handleInput} style={webStyles.editor} />

      <style>{`
        [contentEditable=true]:empty:before {
          content: attr(data-placeholder);
          color: ${TYPOGRAPHY.placeholderColor};
          font-weight: ${TYPOGRAPHY.fontWeight};
        }
        [contentEditable=true] ul, [contentEditable=true] ol { padding-left: 24px; margin: 4px 0; }
        [contentEditable=true] li { margin: 2px 0; }
      `}</style>
    </View>
  );
}

const webStyles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex', gap: '4px', padding: '6px 0', borderBottom: '1px solid #ddd',
    marginBottom: '8px', userSelect: 'none', alignItems: 'center',
  },
  btn: {
    padding: '6px 10px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff',
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: TYPOGRAPHY.fontWeight, fontSize: '14px',
    cursor: 'pointer', minWidth: '34px', textAlign: 'center', color: TYPOGRAPHY.color,
  },
  separator: { width: '1px', height: '24px', background: '#ddd', margin: '0 2px' } as React.CSSProperties,
  editor: {
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 400, fontSize: TYPOGRAPHY.fontSize,
    color: TYPOGRAPHY.color, outline: 'none', lineHeight: '1.5', padding: '0',
    wordWrap: 'break-word', minHeight: '100px',
  },
};

export function RichTextEditor(props: RichTextEditorProps) {
  if (Platform.OS === 'web') return <WebRichTextEditor {...props} />;
  return <MobileRichTextEditor {...props} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 160,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  webview: { backgroundColor: 'transparent' },
});
