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
// HTML-шаблон редактора
// - Selection/Range API для B/I/U (современный подход)
// - execCommand для списков (надёжный кросс-браузерный)
// - Debounce 150ms на postMessage
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
    margin: 0; padding: 8px;
    background: transparent;
    -webkit-text-size-adjust: 100%;
    color: ${TYPOGRAPHY.color};
  }
  #toolbar {
    display: flex; gap: 4px; padding: 6px 0;
    border-bottom: 1px solid #ddd; margin-bottom: 8px;
    user-select: none; -webkit-user-select: none; align-items: center;
  }
  .btn {
    padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px;
    background: #fff; font-family: ${TYPOGRAPHY.fontFamily};
    font-weight: ${TYPOGRAPHY.fontWeight}; font-size: 14px;
    cursor: pointer; min-width: 34px; text-align: center;
    color: ${TYPOGRAPHY.color}; -webkit-tap-highlight-color: transparent;
  }
  .btn:active { background: #dde; border-color: #99f; }
  .separator { width: 1px; height: 24px; background: #ddd; margin: 0 2px; }
  #editor {
    min-height: 100px; outline: none; line-height: 1.5;
    word-wrap: break-word; -webkit-user-select: text;
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
    <button class="btn" data-cmd="insertUnorderedList" title="Список">•</button>
    <button class="btn" data-cmd="insertOrderedList" title="Нумерованный">1.</button>
  </div>
  <div id="editor" contenteditable="true" data-placeholder="${placeholder.replace(/"/g, '"')}"></div>

  <script>
    (function() {
      var editor = document.getElementById('editor');
      var toolbar = document.getElementById('toolbar');
      var sendTimer = null;

      function scheduleSend() {
        clearTimeout(sendTimer);
        sendTimer = setTimeout(function() {
          window.ReactNativeWebView.postMessage(editor.innerHTML);
        }, 150);
      }
      function sendNow() {
        clearTimeout(sendTimer);
        window.ReactNativeWebView.postMessage(editor.innerHTML);
      }

      editor.addEventListener('input', scheduleSend);
      editor.addEventListener('click', function() { editor.focus(); });

      // ---- Selection/Range API для B/I/U ----
      function toggleInlineTag(tagName) {
        editor.focus();
        var sel = window.getSelection();
        if (!sel || !sel.rangeCount || sel.isCollapsed) return;
        var range = sel.getRangeAt(0);
        if (!range || range.collapsed) return;

        var ancestor = range.commonAncestorContainer;
        var wrapper = ancestor.nodeType === 1
          ? ancestor.closest(tagName)
          : (ancestor.parentNode && ancestor.parentNode.closest ? ancestor.parentNode.closest(tagName) : null);

        if (wrapper && editor.contains(wrapper)) {
          var parent = wrapper.parentNode;
          while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
          parent.removeChild(wrapper);
          parent.normalize();
        } else {
          var el = document.createElement(tagName);
          el.appendChild(range.extractContents());
          range.insertNode(el);
        }
        sel.removeAllRanges();
        sendNow();
      }

      function handleAction(cmd) {
        if (cmd === 'bold') { toggleInlineTag('B'); return; }
        if (cmd === 'italic') { toggleInlineTag('I'); return; }
        if (cmd === 'underline') { toggleInlineTag('U'); return; }
        // Списки через execCommand
        editor.focus();
        document.execCommand(cmd, false, null);
        sendNow();
      }

      toolbar.addEventListener('touchstart', function(e) {
        e.preventDefault();
        var btn = e.target.closest('.btn');
        if (btn && btn.dataset.cmd) handleAction(btn.dataset.cmd);
      });
      toolbar.addEventListener('mousedown', function(e) {
        e.preventDefault();
        var btn = e.target.closest('.btn');
        if (btn && btn.dataset.cmd) handleAction(btn.dataset.cmd);
      });

      document.addEventListener('gesturestart', function(e) { e.preventDefault(); });

      window.addEventListener('message', function(event) {
        try {
          var d = JSON.parse(event.data);
          if (d.type === 'LOAD_STATE' && typeof d.payload === 'string') {
            editor.innerHTML = d.payload;
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

  if (!WebViewComponent) return <View style={styles.container} />;

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
// Веб-версия — нативный contentEditable
// ============================================================================
function WebRichTextEditor({ placeholder, value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = useCallback(() => {
    if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
    sendTimerRef.current = setTimeout(() => {
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }, 150);
  }, [onChange]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
    return () => { if (sendTimerRef.current) clearTimeout(sendTimerRef.current); };
  }, [value]);

  const toggleInlineTag = useCallback((tagName: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!range || range.collapsed) return;

    const ancestor = range.commonAncestorContainer;
    let wrapper: Element | null = null;
    if (ancestor.nodeType === 1) {
      wrapper = (ancestor as Element).closest(tagName);
    } else if (ancestor.parentNode) {
      wrapper = (ancestor.parentNode as Element).closest(tagName);
    }

    if (wrapper && editor.contains(wrapper)) {
      const parent = wrapper.parentNode!;
      while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
      parent.removeChild(wrapper);
      parent.normalize();
    } else {
      const el = document.createElement(tagName);
      el.appendChild(range.extractContents());
      range.insertNode(el);
    }
    sel.removeAllRanges();
    editor.focus();
    handleInput();
  }, [handleInput]);

  const handleBtnMouseDown = useCallback((e: React.MouseEvent, cmd: string) => {
    e.preventDefault();
    if (cmd === 'bold') { toggleInlineTag('b'); return; }
    if (cmd === 'italic') { toggleInlineTag('i'); return; }
    if (cmd === 'underline') { toggleInlineTag('u'); return; }
    editorRef.current?.focus();
    document.execCommand(cmd, false, undefined);
    handleInput();
  }, [toggleInlineTag, handleInput]);

  return (
    <View style={styles.container}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />

      <div style={webStyles.toolbar}>
        <button type="button" onMouseDown={(e) => handleBtnMouseDown(e, 'bold')} style={webStyles.btn}><b>B</b></button>
        <button type="button" onMouseDown={(e) => handleBtnMouseDown(e, 'italic')} style={webStyles.btn}><i>I</i></button>
        <button type="button" onMouseDown={(e) => handleBtnMouseDown(e, 'underline')} style={webStyles.btn}><u>U</u></button>
        <span style={webStyles.separator} />
        <button type="button" onMouseDown={(e) => handleBtnMouseDown(e, 'insertUnorderedList')} style={webStyles.btn} title="Список">•</button>
        <button type="button" onMouseDown={(e) => handleBtnMouseDown(e, 'insertOrderedList')} style={webStyles.btn} title="Нумерованный">1.</button>
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
    width: '100%', height: 160, borderBottomWidth: 1, borderBottomColor: '#ccc',
    marginBottom: 20, overflow: 'hidden', borderRadius: 8, backgroundColor: '#fff',
  },
  webview: { backgroundColor: 'transparent' },
});
