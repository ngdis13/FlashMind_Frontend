// components/ColorPalette.tsx
import React, { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Typography } from "@/styles/Typography";
import { MainButton } from "@/components/MainButton";

// Цвета палитры со скриншота
const PALETTE_COLORS = [
  ["#FF7373", "#FFA07A", "#FFF0A5", "#A8FF78", "#78E5FF", "#B578FF"],
  ["#E86363", "#E58E65", "#FFE066", "#61E061", "#52A7E0", "#9B52E0"],
  ["#A35252", "#A16043", "#FFCC00", "#549443", "#4A7CA3", "#733D9E"],
];

interface ColorPaletteProps {
  onCancel: () => void;
  onSelectColor: (color: string) => void;
}

export const ColorPalette = ({ onCancel, onSelectColor }: ColorPaletteProps) => {
  // ИСПРАВЛЕНО: Стейт инициализируется конкретной строкой цвета (первым цветом палитры)
  const [selectedColor, setSelectedColor] = useState(PALETTE_COLORS[0][0]);

  const onConfirm = () => {
    onSelectColor(selectedColor); // Передаем цвет на главный экран
    onCancel(); // Закрываем модалку
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          {/* Предотвращаем закрытие модалки при клике на саму форму */}
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.alertContainer}>
              
              <Typography variant="h2" style={styles.title}>
                Выберите цвет колоды
              </Typography>

              {/* Сетка кружков */}
              <View style={styles.gridContainer}>
                {PALETTE_COLORS.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.row}>
                    {row.map((color) => {
                      const isSelected = selectedColor === color;
                      return (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorCircle,
                            { backgroundColor: color },
                            isSelected && styles.selectedCircle,
                          ]}
                          activeOpacity={0.7}
                          onPress={() => setSelectedColor(color)}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>

              <View style={styles.buttonContainer}>
                <MainButton title="Сохранить цвет" onPress={onConfirm} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: "90%",
    maxWidth: 800, // Контейнер расширяется максимум до 800px
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    textAlign: "left",
    marginBottom: 20,
  },
  gridContainer: {
    gap: 16, 
    marginBottom: 28,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: 14, // Фиксированный шаг, чтобы кружки не разъезжались на экранах в 800px
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 18,
  },
  selectedCircle: {
    borderWidth: 3,
    borderColor: "#5F69D9", // Цвет обводки выбора
    transform: [{ scale: 1.1 }],
  },
  buttonContainer: {
    width: "100%",
  },
});
