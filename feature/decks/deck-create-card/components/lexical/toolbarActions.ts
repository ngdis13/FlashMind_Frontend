// Общая логика команд тулбара CustomRichToolbar для Lexical-редактора.
// Архитектура — https://github.com/seranking-planable/react-native-lexical:
//  - на нативе команды уходят ВНУТРЬ WebView через мост (sendToolbarActionToWebView);
//  - на web тот же набор команд применяется к локальному инстансу Lexical
//    (applyToolbarActionLocally) — 1:1 с webBridge в EditorBridgePlugin.
import {
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  type ElementFormatType,
  type LexicalEditor,
} from 'lexical';
import { $findMatchingParent } from '@lexical/utils';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from '@lexical/list';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import type { HeadingLevelType, ListKindType, ToolbarState } from '@/shared/types';

/** Ключи onAction из CustomRichToolbar. */
export type ToolbarActionType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'H1'
  | 'H2'
  | 'H3'
  | 'main'
  | 'mono'
  | 'code'
  | 'bulletList'
  | 'numberedList'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'undo'
  | 'redo'
  | 'pencil'
  | 'SET_COLOR';

function setHeading(editor: LexicalEditor, level: HeadingLevelType | 'paragraph'): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return;
    }
    if (level === 'paragraph') {
      $setBlocksType(selection, () => $createParagraphNode());
      return;
    }
    const anchor = selection.anchor.getNode();
    const heading = $isHeadingNode(anchor)
      ? anchor
      : $findMatchingParent(anchor, (parentNode) => $isHeadingNode(parentNode));
    if ($isHeadingNode(heading) && heading.getTag() === level) {
      // Повторное нажатие возвращает обычный текст
      $setBlocksType(selection, () => $createParagraphNode());
    } else {
      $setBlocksType(selection, () => $createHeadingNode(level));
    }
  });
}

function toggleList(editor: LexicalEditor, target: ListKindType): void {
  const current = editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return null;
    }
    const node = selection.anchor.getNode();
    const list = $isListNode(node)
      ? node
      : $findMatchingParent(node, (parentNode) => $isListNode(parentNode));
    if ($isListNode(list)) {
      return list.getListType() === 'number' ? 'number' : 'bullet';
    }
    return null;
  });

  if (current === target) {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  } else if (target === 'bullet') {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  } else {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }
}

/** Применение команды к локальному инстансу Lexical (используется на web). */
export function applyToolbarActionLocally(
  editor: LexicalEditor,
  action: string,
  payload?: unknown,
): void {
  console.log("[toolbarActions] web action →", action, payload ?? "");
  switch (action) {
    case 'bold':
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
      break;
    case 'italic':
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
      break;
    case 'underline':
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
      break;
    case 'strikeThrough':
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
      break;
    case 'mono':
    case 'code':
      // «Моноширинный шрифт» и кнопка кода — инлайн-код
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
      break;
    case 'undo':
      editor.dispatchCommand(UNDO_COMMAND, undefined);
      break;
    case 'redo':
      editor.dispatchCommand(REDO_COMMAND, undefined);
      break;
    case 'alignLeft':
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left' as ElementFormatType);
      break;
    case 'alignCenter':
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center' as ElementFormatType);
      break;
    case 'alignRight':
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right' as ElementFormatType);
      break;
    case 'alignJustify':
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify' as ElementFormatType);
      break;
    case 'H1':
      setHeading(editor, 'h1');
      break;
    case 'H2':
      setHeading(editor, 'h2');
      break;
    case 'H3':
      setHeading(editor, 'h3');
      break;
    case 'main':
      setHeading(editor, 'paragraph');
      break;
    case 'bulletList':
      toggleList(editor, 'bullet');
      break;
    case 'numberedList':
      toggleList(editor, 'number');
      break;
    case 'SET_COLOR':
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { color: String(payload ?? '#1E1F4B') });
        }
      });
      break;
    case 'pencil':
      // Чисто визуальный переключатель кисти в тулбаре — команды не требует
      break;
    default:
      break;
  }
}

/** Отправка команды в Lexical внутри WebView (натива). Мост — как в репозитории. */
export async function sendToolbarActionToWebView(
  action: string,
  payload?: unknown,
): Promise<void> {
  // Ленивый require: модуль с WebView не должен попадать в веб-бандл
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { LexicalWebMethods } =
    require('../LexicalWebView') as typeof import('../LexicalWebView');
  /* eslint-enable @typescript-eslint/no-require-imports */
  const methods = LexicalWebMethods.current;
  console.log(
    "[toolbarActions] native action →",
    action,
    "| bridge ready:",
    Boolean(methods?.isReady),
  );
  if (!methods || !methods.isReady) {
    console.warn('[toolbarActions] WebView bridge is not ready yet, action skipped:', action);
    return;
  }
  switch (action) {
    case 'bold':
      return methods.formatTextCommand('bold');
    case 'italic':
      return methods.formatTextCommand('italic');
    case 'underline':
      return methods.formatTextCommand('underline');
    case 'strikeThrough':
      return methods.formatTextCommand('strikethrough');
    case 'mono':
    case 'code':
      return methods.toggleCodeCommand();
    case 'undo':
      return methods.undoCommand();
    case 'redo':
      return methods.redoCommand();
    case 'alignLeft':
      return methods.formatElementCommand('left');
    case 'alignCenter':
      return methods.formatElementCommand('center');
    case 'alignRight':
      return methods.formatElementCommand('right');
    case 'alignJustify':
      return methods.formatElementCommand('justify');
    case 'H1':
      return methods.setHeadingCommand('h1');
    case 'H2':
      return methods.setHeadingCommand('h2');
    case 'H3':
      return methods.setHeadingCommand('h3');
    case 'main':
      return methods.setHeadingCommand('paragraph');
    case 'bulletList':
      return methods.toggleBulletListCommand();
    case 'numberedList':
      return methods.toggleOrderedListCommand();
    case 'SET_COLOR':
      return methods.setColorCommand(String(payload ?? '#1E1F4B'));
    default:
      return;
  }
}

/**
 * Преобразование ToolbarState (мост) в ключи подсветки кнопок CustomRichToolbar.
 * Сохраняет прежний контракт externalActiveKeys / externalSelectedFont.
 */
export function mapToolbarStateToToolbarKeys(state: ToolbarState): {
  activeStyles: string[];
  selectedFont: string | null;
} {
  const activeStyles: string[] = [];
  if (state.isBold) activeStyles.push('bold');
  if (state.isItalic) activeStyles.push('italic');
  if (state.isUnderline) activeStyles.push('underline');
  if (state.isStrikethrough) activeStyles.push('strikeThrough');
  if (state.listType === 'bullet') activeStyles.push('bulletList');
  if (state.listType === 'number') activeStyles.push('numberedList');
  if (state.isCode) activeStyles.push('code');

  // Выравнивание: активна текущая позиция
  if (state.elementFormat === 'center') activeStyles.push('alignCenter');
  else if (state.elementFormat === 'right') activeStyles.push('alignRight');
  else if (state.elementFormat === 'left') activeStyles.push('alignLeft');

  let selectedFont: string | null;
  if (state.headingLevel === 'h1') selectedFont = 'H1';
  else if (state.headingLevel === 'h2') selectedFont = 'H2';
  else if (state.headingLevel === 'h3') selectedFont = 'H3';
  else if (state.isCode) selectedFont = 'mono';
  else selectedFont = 'main';

  return { activeStyles, selectedFont };
}
