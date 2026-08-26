import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, type LexicalEditor } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import './Editor.css';
import EditorBridgePlugin from './plugins/EditorBridgePlugin.tsx';
import EditorTheme from './EditorTheme';

function onError(error: unknown) {
  console.error(error);
}

// Загружаем начальный контент из HTML (совместимо с карточками, сохранёнными ранее).
// Расширение относительно оригинального репозитория: он принимал только initialEditorState (JSON).
function loadInitialHtml(editor: LexicalEditor) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(window.editorParams.initialHtml ?? '', 'text/html');
  const nodes = $generateNodesFromDOM(editor, dom);
  $getRoot().clear();
  if (nodes.length > 0) {
    $getRoot().append(...nodes);
  }
}

export function Editor() {
  const initialConfig = {
    namespace: window.editorParams.namespace ?? 'MyLexicalEditor',
    theme: EditorTheme,
    onError,
    // Узлы для заголовков/цитат/списков — нужны кнопкам тулбара FlashMind
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    ...(window.editorParams.initialEditorState
      ? { editorState: window.editorParams.initialEditorState }
      : window.editorParams.initialHtml
        ? { editorState: loadInitialHtml }
        : {}),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <EditorBridgePlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={
              <div className="editor-placeholder">
                {window.editorParams.placeholder ?? "Введите текст..."}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
