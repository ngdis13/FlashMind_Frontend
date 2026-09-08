// Единые параметры отображения карточки: редактор / превью / обучение.
// Зеркало .editor-input из lexical-editor/src/Editor.css (padding: 16px 14px),
// чтобы текст переносился и выглядел одинаково во всех трёх местах.
// Источник эталона — бокс редактора в TextEditor.tsx (styles.editorBox).
export const CARD_DISPLAY = {
  width: 372, // ширина карточки (как editorBox в TextEditor)
  height: 520, // высота карточки (как editorBox в TextEditor)
  radius: 20, // радиус углов (как editorBox)
  paddingTop: 16, // .editor-input { padding: 16px 14px }
  paddingHorizontal: 14,
  paddingBottom: 16,
  blockGap: 16, // промежуток между блоками (= BLOCK_GAP в SideEditor)
  fontSize: 18, // базовый размер шрифта (как в HtmlText и редакторе)

  // Адаптив: начиная с этой ширины окна (планшет/десктоп) карточки крупнее
  WIDE_SCREEN_MIN_WIDTH: 768,
  // Ширина карточки на десктопе — горизонтальный прямоугольник,
  // как реальная флеш-карта (не квадрат)
  desktopMaxWidth: 650,
  // Высота карточки обучения/превью и бокса редактора на десктопе
  desktopHeight: 750,
} as const;
