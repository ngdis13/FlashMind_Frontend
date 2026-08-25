// feature-decks/deck-create-card/components/LexicalWebEditor.tsx
import React, { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $getSelection, FORMAT_TEXT_COMMAND } from 'lexical';

interface WebEditorProps {
  onChange: (html: string, length: number) => void;
  initialHtml: string;
  editorRef: React.MutableRefObject<any>;
}

const ToolbarBridgePlugin = ({ onChange, editorRef }: { onChange: any, editorRef: any }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editorRef.current = editor; // отдаем инстанс наверх в родительский экран

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        const text = $getRoot().getTextContent();
        onChange(html, text.trim().length);
      });
    });
  }, [editor, onChange, editorRef]);

  return null;
};

export const LexicalWebEditor: React.FC<WebEditorProps> = ({ onChange, initialHtml, editorRef }) => {
  const config = {
    namespace: 'WebLexical',
    theme: {
      paragraph: 'lexical-p',
      text: { bold: 'lexical-bold', italic: 'lexical-italic', underline: 'lexical-underline', strikethrough: 'lexical-strikethrough' },
    },
    onError: (error: Error) => console.error(error),
    editorState: (editor: any) => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml || '<p></p>', 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot().select();
      $getSelection()?.insertNodes(nodes);
    }
  };

  return (
    <LexicalComposer initialConfig={config}>
      <div style={{ position: 'relative', height: '100%', outline: 'none' }}>
        <RichTextPlugin
          contentEditable={<ContentEditable style={{ outline: 'none', minHeight: 280, padding: 4 }} />}
          placeholder={<div style={{ position: 'absolute', top: 4, left: 4, color: '#aaa', pointerEvents: 'none' }}>Введите текст...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ToolbarBridgePlugin onChange={onChange} editorRef={editorRef} />
      </div>
    </LexicalComposer>
  );
};
