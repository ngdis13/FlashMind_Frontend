/**
 * Основан на plugins/EditorBridgePlugin.tsx из
 * https://github.com/seranking-planable/react-native-lexical
 *
 * Расширения FlashMind:
 *  - в ToolbarState добавлены isCode / headingLevel / listType;
 *  - добавлены команды setHeadingCommand / toggleBulletListCommand /
 *    toggleOrderedListCommand / toggleCodeCommand / setColorCommand.
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  BLUR_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  EditorState,
  FOCUS_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $isHeadingNode, $createHeadingNode } from "@lexical/rich-text";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $patchStyleText, $setBlocksType } from "@lexical/selection";
import { useCallback, useEffect, useState } from "react";
import { getSelectedNode } from "../utils/getSelectedNode.ts";
import { linkBridge, registerWebMethod } from "@webview-bridge/web";
import type {
  EditorBridge,
  EditorElementFormat,
  HeadingLevelType,
  ListKindType,
  OnChangePayload,
  WebBridge,
} from "../../../shared/types.ts";

export default function EditorBridgePlugin() {
  const [editor] = useLexicalComposerContext();
  const [bridgeReady, setBridgeReady] = useState(false);
  const [bridge] = useState(() =>
    linkBridge<EditorBridge>({
      throwOnError: true,
      onReady: () => {
        setBridgeReady(true);
      },
    }),
  );
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [headingLevel, setHeadingLevel] = useState<HeadingLevelType | null>(
    null,
  );
  const [listType, setListType] = useState<ListKindType | null>(null);
  const [elementFormat, setElementFormat] =
    useState<EditorElementFormat>("left");

  useEffect(() => {
    if (bridge && bridgeReady) {
      (async function () {
        await bridge.setReady(true);
      })().catch();
    }
  }, [bridge, bridgeReady]);

  const toggleList = useCallback(
    (target: ListKindType) => {
      const current = editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return null;
        }
        const node = getSelectedNode(selection);
        const list = $isListNode(node)
          ? node
          : $findMatchingParent(node, (parentNode) => $isListNode(parentNode));
        if ($isListNode(list)) {
          const type = list.getListType();
          return type === "number" ? "number" : "bullet";
        }
        return null;
      });

      if (current === target) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else if (target === "bullet") {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      }
    },
    [editor],
  );

  useEffect(() => {
    const webBridge: WebBridge = {
      undoCommand(): Promise<void> {
        console.log("[LexicalWebView] command: undo");
        editor.dispatchCommand(UNDO_COMMAND, undefined);
        return Promise.resolve();
      },
      redoCommand(): Promise<void> {
        console.log("[LexicalWebView] command: redo");
        editor.dispatchCommand(REDO_COMMAND, undefined);
        return Promise.resolve();
      },
      formatTextCommand(payload): Promise<void> {
        console.log("[LexicalWebView] command: formatText", payload);
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, payload);
        return Promise.resolve();
      },
      formatElementCommand(payload): Promise<void> {
        console.log("[LexicalWebView] command: formatElement", payload);
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, payload);
        return Promise.resolve();
      },
      setHeadingCommand(level: HeadingLevelType | "paragraph"): Promise<void> {
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return;
          }
          if (level === "paragraph") {
            $setBlocksType(selection, () => $createParagraphNode());
            return;
          }
          const node = getSelectedNode(selection);
          const heading = $isHeadingNode(node)
            ? node
            : $findMatchingParent(node, (parentNode) =>
                $isHeadingNode(parentNode),
              );
          if ($isHeadingNode(heading) && heading.getTag() === level) {
            // Повторное нажатие возвращает обычный текст
            $setBlocksType(selection, () => $createParagraphNode());
          } else {
            $setBlocksType(selection, () => $createHeadingNode(level));
          }
        });
        return Promise.resolve();
      },
      toggleBulletListCommand(): Promise<void> {
        toggleList("bullet");
        return Promise.resolve();
      },
      toggleOrderedListCommand(): Promise<void> {
        toggleList("number");
        return Promise.resolve();
      },
      toggleCodeCommand(): Promise<void> {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
        return Promise.resolve();
      },
      setColorCommand(color: string): Promise<void> {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, { color });
          }
        });
        return Promise.resolve();
      },
      getEditorHtml(): Promise<string> {
        let html = "";
        try {
          editor.update(
            () => {
              html = $generateHtmlFromNodes(editor, null);
            },
            { discrete: true },
          );
        } catch (error) {
          console.error(error);
        }
        return Promise.resolve(html);
      },
      setEditorHtml(htmlString: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          try {
            editor.update(
              () => {
                // In the browser you can use the native DOMParser API to parse the HTML string.
                const parser = new DOMParser();
                const dom = parser.parseFromString(htmlString, "text/html");

                // Once you have the DOM instance it's easy to generate LexicalNodes.
                const nodes = $generateNodesFromDOM(editor, dom);

                // Select the root
                $getRoot().clear();

                // Insert them
                if (nodes.length > 0) {
                  $getRoot().append(...nodes);
                }
              },
              { discrete: true },
            );
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      },
      getEditorJson(): Promise<string> {
        return Promise.resolve(
          JSON.stringify(editor.getEditorState().toJSON()),
        );
      },
      setEditorJson(jsonString: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          try {
            const editorState = editor.parseEditorState(jsonString);
            editor.setEditorState(editorState);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      },
    };
    registerWebMethod(webBridge);
  }, [editor, toggleList]);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      const node = getSelectedNode(selection);

      const heading = $isHeadingNode(node)
        ? node
        : $findMatchingParent(node, (parentNode) => $isHeadingNode(parentNode));
      setHeadingLevel(
        $isHeadingNode(heading) ? (heading.getTag() as HeadingLevelType) : null,
      );

      const list = $isListNode(node)
        ? node
        : $findMatchingParent(node, (parentNode) => $isListNode(parentNode));
      if ($isListNode(list)) {
        const type = list.getListType();
        setListType(type === "number" ? "number" : "bullet");
      } else {
        setListType(null);
      }

      const parent = node.getParent();

      // Если узел инлайн (например ссылка), берём формат ближайшего блочного родителя
      const matchingParent = $findMatchingParent(
        node,
        (parentNode) =>
          parentNode !== node &&
          !parentNode.isInline() &&
          !$isListNode(parentNode),
      );

      setElementFormat(
        ($isHeadingNode(matchingParent)
          ? matchingParent.getFormatType()
          : list && list.getFormatType()
            ? list.getFormatType()
            : $isHeadingNode(heading)
              ? heading.getFormatType()
              : parent?.getFormatType() || "left") as EditorElementFormat,
      );
    }
  }, []);

  const setFocus = useCallback(
    (focus: boolean) => {
      (async function () {
        await bridge.setFocus(focus);
      })().catch();
    },
    [bridge],
  );

  useEffect(() => {
    async function updateToolbarState(): Promise<void> {
      const newToolbarState = {
        canUndo,
        canRedo,
        isBold,
        isItalic,
        isUnderline,
        isStrikethrough,
        isCode,
        headingLevel,
        listType,
        elementFormat,
      };
      await bridge.setToolbarState(newToolbarState);
    }

    updateToolbarState().catch();
  }, [
    bridge,
    canUndo,
    canRedo,
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    isCode,
    headingLevel,
    listType,
    elementFormat,
  ]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          setFocus(false);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          setFocus(true);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, setFocus, updateToolbar]);

  function onChange(
    editorState: EditorState,
    latestEditor: LexicalEditor,
    _tags: Set<string>,
  ) {
    if (bridge && bridgeReady) {
      editorState.read(() => {
        const plainText: string | null = window.editorParams
          .enableOnChangePlugin?.includePlainText
          ? $getRoot().getTextContent()
          : null;
        const htmlText: string | null = window.editorParams.enableOnChangePlugin
          ?.includeHtmlText
          ? $generateHtmlFromNodes(latestEditor, null)
          : null;
        const jsonState: string | null = window.editorParams
          .enableOnChangePlugin?.includeJsonState
          ? JSON.stringify(editorState.toJSON())
          : null;

        const payload: OnChangePayload = {
          ...(plainText && { plainText }),
          ...(htmlText && { htmlText }),
          ...(jsonState && { jsonState }),
        };
        (async function () {
          await bridge.changeNotification(payload);
        })().catch();
      });
    }
  }

  return (
    window.editorParams.enableOnChangePlugin && (
      <OnChangePlugin onChange={onChange} />
    )
  );
}
