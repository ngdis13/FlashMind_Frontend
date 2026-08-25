// feature-decks/deck-create-card/components/editorTemplate.ts
export const getEditorHtml = (initialContent: string) => `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    body, html { margin: 0; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #ffffff; height: 100%; }
    #editor { outline: none; min-height: 250px; font-size: 16px; color: #1E1F4B; }
    
    /* Стилизация под iOS Заметки для Lexical-нод */
    .lexical-h1 { font-size: 20px; font-weight: bold; margin: 8px 0; color: #1E1F4B; }
    .lexical-h2 { font-size: 18px; font-weight: bold; margin: 8px 0; color: #1E1F4B; }
    .lexical-h3 { font-size: 16px; font-weight: 600; margin: 6px 0; color: #1E1F4B; }
    .lexical-p { font-size: 16px; margin: 4px 0; color: #1E1F4B; }
    .lexical-bold { font-weight: bold; }
    .lexical-italic { font-style: italic; }
    .lexical-underline { text-decoration: underline; }
    .lexical-strikethrough { text-decoration: line-through; }
    .lexical-code { background: #f4f4f9; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 14px; }
    .lexical-ul { padding-left: 24px; margin: 6px 0; }
    .lexical-ol { padding-left: 24px; margin: 6px 0; }
  </style>

  <!-- Загружаем Lexical через UNPKG (как в концепте плейграунда, но в один файл) -->
  <script src="https://unpkg.com"></script>
  <script src="https://unpkg.com"></script>
</head>
<body>
  <div id="editor" contenteditable="true"></div>

  <script>
    // Настройки темы Lexical (совпадают с классами в CSS выше)
    const theme = {
      paragraph: 'lexical-p',
      heading: {
        h1: 'lexical-h1',
        h2: 'lexical-h2',
        h3: 'lexical-h3',
      },
      text: {
        bold: 'lexical-bold',
        italic: 'lexical-italic',
        underline: 'lexical-underline',
        strikethrough: 'lexical-strikethrough',
        code: 'lexical-code'
      },
      list: {
        ul: 'lexical-ul',
        ol: 'lexical-ol',
      }
    };

    // Создаем инстанс Lexical
    const config = {
      namespace: 'MobileLexical',
      theme: theme,
      onError: (error) => console.error(error)
    };
    
    const editor = Lexical.createEditor(config);
    const editorElement = document.getElementById('editor');
    editor.setRootElement(editorElement);

    // Парсим начальный HTML при старте
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(\`${initialContent}\` || '<p></p>', 'text/html');
      const nodes = LexicalHtml.$generateNodesFromDOM(editor, dom);
      const root = Lexical.$getRoot();
      root.clear();
      root.append(...nodes);
    });

    // Отправляем изменения обратно в React Native
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = LexicalHtml.$generateHtmlFromNodes(editor, null);
        const text = Lexical.$getRoot().getTextContent();
        
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'UPDATE',
          html: html,
          textLength: text.trim().length
        }));
      });
    });

    // Слушаем команды от вашей панели CustomRichToolbar
    window.addEventListener('message', (event) => {
      try {
        const command = JSON.parse(event.data);
        
        editor.update(() => {
          const selection = Lexical.$getSelection() || Lexical.$getRoot().select();
          
          if (command.type === 'bold') selection.formatText('bold');
          if (command.type === 'italic') selection.formatText('italic');
          if (command.type === 'underline') selection.formatText('underline');
          if (command.type === 'strikeThrough') selection.formatText('strikethrough');
          if (command.type === 'mono') selection.formatText('code');
          
          // Изменение заголовков и параграфов
          if (command.type === 'H1' || command.type === 'H2' || command.type === 'H3') {
            const headingTag = command.type.toLowerCase();
            const headingNode = Lexical.createHeadingNode(headingTag);
            // Превращаем текущий блок в заголовок
            selection.getNodes().forEach(node => {
              const parent = node.getParentOrThrow();
              if (Lexical.$isElementNode(parent)) {
                parent.replace(headingNode);
              }
            });
          }
          
          if (command.type === 'main') {
            const paragraphNode = Lexical.createParagraphNode();
            selection.getNodes().forEach(node => {
              const parent = node.getParentOrThrow();
              if (Lexical.$isElementNode(parent)) parent.replace(paragraphNode);
            });
          }
          
          // Кастомный цвет (через инлайн-стили Lexical)
          if (command.type === 'SET_COLOR') {
            selection.getNodes().forEach(node => {
              if (Lexical.$isTextNode(node)) {
                node.setStyle(\`color: \${command.color}\`);
              }
            });
          }
        });
      } catch(e) {
        console.error("Ошибка команды Lexical внутри WebView:", e);
      }
    });
  </script>
</body>
</html>
`;
