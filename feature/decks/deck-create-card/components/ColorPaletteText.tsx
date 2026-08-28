// feature/decks/deck-create-card/components/ColorPaletteText.tsx
// Полнофункциональный Color Picker для текста — аналог палитры Lexical Playground.
// 4 блока: HEX-ввод, пресеты, Saturation/Lightness canvas, Hue-слайдер + превью.
// Кросс-платформенный (React Native / Expo Web).

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  TextInput,
  Platform,
} from "react-native";
import Svg, { Rect, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Typography } from "@/styles/Typography";
import { MainButton } from "@/components/MainButton";
import { colors } from "@/styles/Colors";

// =============================================================================
// Color conversion utilities (HSV ↔ RGB ↔ HEX)
// =============================================================================

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return [
    parseInt(full.substring(0, 2), 16),
    parseInt(full.substring(2, 4), 16),
    parseInt(full.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsv(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s, v];
}

function hsvToRgb(
  h: number,
  s: number,
  v: number,
): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function hsvToHex(h: number, s: number, v: number): string {
  const [r, g, b] = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

function hexToHsv(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

// =============================================================================
// Preset colors (2 rows, как в Lexical Playground)
// =============================================================================

const PRESET_ROW1 = [
  "#FF0000", "#FF8800", "#FFDD00", "#8B4513",
  "#88DD00", "#00CC00", "#8800CC", "#FF00FF",
];
const PRESET_ROW2 = [
  "#0000FF", "#00CCCC", "#AAFFAA", "#000000",
  "#555555", "#AAAAAA", "#FFFFFF",
];

// =============================================================================
// Props
// =============================================================================

interface ColorPaletteTextProps {
  onCancel: () => void;
  onSelectColor: (color: string) => void;
  title?: string;
}

// =============================================================================
// Component
// =============================================================================

export const ColorPaletteText: React.FC<ColorPaletteTextProps> = ({
  onCancel,
  onSelectColor,
  title = "Выберите цвет текста",
}) => {
  // --- HSV state ---
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [value, setValue] = useState(0);

  const currentHex = hsvToHex(hue, saturation, value);
  const [hexInput, setHexInput] = useState(currentHex);

  // --- Refs for mutable values (read by pointer/touch handlers) ---
  const hueRef = useRef(hue);
  const saturationRef = useRef(saturation);
  const valueRef = useRef(value);
  hueRef.current = hue;
  saturationRef.current = saturation;
  valueRef.current = value;

  // --- Layout refs (measured once, read by handlers) ---
  const canvasLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const hueBarLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // --- Canvas layout state (for SVG marker rendering) ---
  const [canvasLayout, setCanvasLayout] = useState({
    x: 0, y: 0, width: 0, height: 0,
  });
  const [hueBarLayout, setHueBarLayout] = useState({
    x: 0, y: 0, width: 0, height: 0,
  });

  // --- Drag state refs ---
  const isDraggingCanvas = useRef(false);
  const isDraggingHue = useRef(false);

  // --- Measure helpers ---
  const measureCanvas = useCallback(() => {
    if (Platform.OS === "web") {
      const el = document.getElementById("color-canvas");
      if (el) {
        const r = el.getBoundingClientRect();
        const layout = { x: r.left, y: r.top, width: r.width, height: r.height };
        canvasLayoutRef.current = layout;
        setCanvasLayout(layout);
      }
    }
  }, []);

  const measureHueBar = useCallback(() => {
    if (Platform.OS === "web") {
      const el = document.getElementById("color-huebar");
      if (el) {
        const r = el.getBoundingClientRect();
        const layout = { x: r.left, y: r.top, width: r.width, height: r.height };
        hueBarLayoutRef.current = layout;
        setHueBarLayout(layout);
      }
    }
  }, []);

  // Measure on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      measureCanvas();
      measureHueBar();
    }, 100);
    return () => clearTimeout(timer);
  }, [measureCanvas, measureHueBar]);

  // --- Validation ---
  const isValidHex = (hex: string) =>
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);

  // --- Update from hex string (preset click or manual input) ---
  const updateFromHex = useCallback((hex: string) => {
    if (isValidHex(hex)) {
      const [h, s, v] = hexToHsv(hex);
      setHue(h);
      setSaturation(s);
      setValue(v);
      setHexInput(hex.toUpperCase());
    }
  }, []);

  // --- Hex input handler ---
  const handleHexChange = useCallback((text: string) => {
    let val = text;
    if (val && !val.startsWith("#")) val = "#" + val;
    setHexInput(val.toUpperCase());
    if (isValidHex(val)) {
      const [h, s, v] = hexToHsv(val);
      setHue(h);
      setSaturation(s);
      setValue(v);
    }
  }, []);

  // --- Canvas interaction (Saturation / Lightness) ---
  const updateCanvasFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const layout = canvasLayoutRef.current;
      if (layout.width === 0 || layout.height === 0) {
        measureCanvas();
        return;
      }
      const localX = clientX - layout.x;
      const localY = clientY - layout.y;
      const s = Math.max(0, Math.min(1, localX / layout.width));
      const v = Math.max(0, Math.min(1, 1 - localY / layout.height));
      setSaturation(s);
      setValue(v);
      const hex = hsvToHex(hueRef.current, s, v);
      setHexInput(hex);
    },
    [measureCanvas],
  );

  // --- Hue bar interaction ---
  const updateHueFromClient = useCallback(
    (clientX: number) => {
      const layout = hueBarLayoutRef.current;
      if (layout.width === 0) {
        measureHueBar();
        return;
      }
      const localX = clientX - layout.x;
      const h = Math.max(0, Math.min(360, (localX / layout.width) * 360));
      setHue(h);
      const hex = hsvToHex(h, saturationRef.current, valueRef.current);
      setHexInput(hex);
    },
    [measureHueBar],
  );

  // --- Global pointer/touch handlers (attached on drag start) ---
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingCanvas.current) {
        e.preventDefault();
        updateCanvasFromClient(e.clientX, e.clientY);
      }
      if (isDraggingHue.current) {
        e.preventDefault();
        updateHueFromClient(e.clientX);
      }
    };

    const handlePointerUp = () => {
      isDraggingCanvas.current = false;
      isDraggingHue.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [updateCanvasFromClient, updateHueFromClient]);

  // --- Canvas pointer down ---
  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      isDraggingCanvas.current = true;
      updateCanvasFromClient(e.clientX, e.clientY);
    },
    [updateCanvasFromClient],
  );

  // --- Hue bar pointer down ---
  const handleHuePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      isDraggingHue.current = true;
      updateHueFromClient(e.clientX);
    },
    [updateHueFromClient],
  );

  // --- Confirm ---
  const onConfirm = useCallback(() => {
    onSelectColor(currentHex);
    onCancel();
  }, [currentHex, onSelectColor, onCancel]);

  // --- Derived: pure hue color (saturation=1, value=1) for canvas gradient ---
  const hueColor = hsvToHex(hue, 1, 1);

  // --- Marker border color: white for dark colors, dark for light ---
  const isColorDark = value < 0.5 || (value < 0.7 && saturation > 0.5);
  const markerStroke = isColorDark ? "#FFFFFF" : "#333333";

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.container}>
              <Typography variant="h2" style={styles.title}>
                {title}
              </Typography>

              {/* ============================================================= */}
              {/* Block 1: Hex Input                                                */}
              {/* ============================================================= */}
              <View style={styles.hexRow}>
                <Typography variant="span" style={styles.hexLabel}>
                  Hex
                </Typography>
                <TextInput
                  style={styles.hexInput}
                  value={hexInput}
                  onChangeText={handleHexChange}
                  maxLength={7}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={colors.darkMainColor}
                  placeholderTextColor={colors.darkGray}
                />
              </View>

              {/* ============================================================= */}
              {/* Block 2: Preset Color Swatches (2 rows)                       */}
              {/* ============================================================= */}
              <View style={styles.swatchesContainer}>
                <View style={styles.swatchRow}>
                  {PRESET_ROW1.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.swatch,
                        { backgroundColor: color },
                        currentHex === color && styles.swatchSelected,
                      ]}
                      onPress={() => updateFromHex(color)}
                    />
                  ))}
                </View>
                <View style={styles.swatchRow}>
                  {PRESET_ROW2.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.swatch,
                        { backgroundColor: color },
                        color === "#FFFFFF" && styles.swatchWhiteBorder,
                        currentHex === color &&
                          (color === "#000000"
                            ? styles.swatchSelectedDark
                            : styles.swatchSelected),
                      ]}
                      onPress={() => updateFromHex(color)}
                    />
                  ))}
                </View>
              </View>

              {/* ============================================================= */}
              {/* Block 3: Saturation / Lightness Canvas                        */}
              {/* ============================================================= */}
              <View
                id="color-canvas"
                style={styles.canvasContainer}
                // @ts-expect-error onPointerDown is valid on web
                onPointerDown={handleCanvasPointerDown}
              >
                <Svg width="100%" height="100%">
                  <Defs>
                    <LinearGradient
                      id="satGrad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
                      <Stop offset="1" stopColor={hueColor} stopOpacity="1" />
                    </LinearGradient>
                    <LinearGradient
                      id="valGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <Stop offset="0" stopColor="rgba(0,0,0,0)" stopOpacity="1" />
                      <Stop offset="1" stopColor="#000000" stopOpacity="1" />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#satGrad)" />
                  <Rect width="100%" height="100%" fill="url(#valGrad)" />
                  {canvasLayout.width > 0 && (
                    <Circle
                      cx={saturation * canvasLayout.width}
                      cy={(1 - value) * canvasLayout.height}
                      r={9}
                      fill={currentHex}
                      stroke={markerStroke}
                      strokeWidth={2.5}
                    />
                  )}
                </Svg>
              </View>

              {/* ============================================================= */}
              {/* Block 4: Hue Slider + Preview                                  */}
              {/* ============================================================= */}
              <View
                id="color-huebar"
                style={styles.hueBarContainer}
                // @ts-expect-error onPointerDown is valid on web
                onPointerDown={handleHuePointerDown}
              >
                <Svg width="100%" height="100%">
                  <Defs>
                    <LinearGradient
                      id="hueGrad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <Stop offset="0%" stopColor="#FF0000" />
                      <Stop offset="17%" stopColor="#FFFF00" />
                      <Stop offset="33%" stopColor="#00FF00" />
                      <Stop offset="50%" stopColor="#00FFFF" />
                      <Stop offset="67%" stopColor="#0000FF" />
                      <Stop offset="83%" stopColor="#FF00FF" />
                      <Stop offset="100%" stopColor="#FF0000" />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#hueGrad)" rx={6} />
                  {hueBarLayout.width > 0 && (
                    <Circle
                      cx={(hue / 360) * hueBarLayout.width}
                      cy={hueBarLayout.height / 2}
                      r={9}
                      fill={hsvToHex(hue, 1, 1)}
                      stroke="#FFFFFF"
                      strokeWidth={2.5}
                    />
                  )}
                </Svg>
              </View>

              {/* Preview bar */}
              <View
                style={[styles.previewBar, { backgroundColor: currentHex }]}
              />

              {/* Apply button */}
              <View style={styles.buttonContainer}>
                <MainButton title="Применить цвет" onPress={onConfirm} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "92%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    textAlign: "left",
    marginBottom: 16,
  },

  // --- Block 1: Hex Input ---
  hexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  hexLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkGray,
    minWidth: 30,
  },
  hexInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 15,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: Platform.OS === "web" ? "monospace" : "Courier",
    color: colors.darkGray,
    backgroundColor: "#F9F9F9",
  },

  // --- Block 2: Preset Swatches ---
  swatchesContainer: {
    gap: 10,
    marginBottom: 16,
  },
  swatchRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-start",
    flexWrap: "wrap",
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
  },
  swatchWhiteBorder: {
    borderWidth: 1,
    borderColor: "#CCC",
  },
  swatchSelected: {
    borderWidth: 2,
    borderColor: "#5F69D9",
    transform: [{ scale: 1.12 }],
  },
  swatchSelectedDark: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    transform: [{ scale: 1.12 }],
  },

  // --- Block 3: Saturation / Lightness Canvas ---
  canvasContainer: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    cursor: "crosshair",
  } as Record<string, unknown>,

  // --- Block 4: Hue Slider ---
  hueBarContainer: {
    width: "100%",
    height: 24,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
    cursor: "pointer",
  } as Record<string, unknown>,

  // --- Preview bar ---
  previewBar: {
    width: "100%",
    height: 32,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },

  // --- Button ---
  buttonContainer: {
    width: "100%",
  },
});