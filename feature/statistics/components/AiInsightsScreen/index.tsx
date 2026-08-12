// --------------------------- React ---------------------------
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

// --------------------------- Компоненты Шагов ---------------------------
import { Welcome } from "./screens/Welcome";
import { Progress } from "./screens/Progress";
import { Problems } from "./screens/Problems";
import { Recommendation } from "./screens/Recomendation";
import { Plans } from "./screens/Plans";
import { Closed } from "./screens/Closed";

// --------------------------- UI-Система Приложения ---------------------------
import { commonStyles } from "@/styles/Common";
import { colors } from "@/styles/Colors";

interface AiInsightsScreenProps {
  data: {
    analysis_date: string;
    analysis_next_date: string;
    analysis_success: boolean;
    insights: any[];
    problem_areas: any[];
    recommendations: any[];
    goals: any[];
  };
  onBack: () => void;
}

export const AiInsightsScreen = ({ data, onBack }: AiInsightsScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const translateX = useSharedValue(0);

  const handleStepChange = (step: number, direction: 'next' | 'prev') => {
    if (step === currentStep) return;
    if (step < 0 || step > 5) return;
    
    // Анимация выезда
    translateX.value = withTiming(direction === 'next' ? -300 : 300, { duration: 250 });
    
    // Смена шага после анимации
    setTimeout(() => {
      runOnJS(setCurrentStep)(step);
      translateX.value = withTiming(0, { duration: 200 });
    }, 250);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      handleStepChange(currentStep + 1, 'next');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1, 'prev');
    }
  };

  // Жест для свайпа (работает на всех платформах)
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const { translationX } = event;
      // Ограничиваем движение
      const clamped = Math.min(Math.max(translationX, -300), 300);
      translateX.value = clamped;
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const threshold = 80; // Порог в пикселях

      if (translationX < -threshold || velocityX < -500) {
        if (currentStep < 5) {
          handleStepChange(currentStep + 1, 'next');
        } else {
          translateX.value = withSpring(0);
        }
      } else if (translationX > threshold || velocityX > 500) {
        if (currentStep > 0) {
          handleStepChange(currentStep - 1, 'prev');
        } else {
          translateX.value = withSpring(0);
        }
      } else {
        translateX.value = withSpring(0);
      }
    });

  // Обработка клавиатурных стрелок для веба
  useEffect(() => {
    // Добавляем обработчик только на вебе
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Игнорируем, если пользователь вводит текст в input или textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          handleBack();
          break;
        case 'Escape':
          event.preventDefault();
          onBack();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep]); // Обновляем при изменении currentStep

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderStep = (step: number) => {
    const props = {
      data,
      onNext: handleNext,
      onBack: step > 0 ? handleBack : undefined,
    };

    switch (step) {
      case 0:
        return <Welcome {...props} />;
      case 1:
        return <Progress {...props} />;
      case 2:
        return <Problems {...props} />;
      case 3:
        return <Recommendation {...props} />;
      case 4:
        return <Plans {...props} />;
      case 5:
        return <Closed data={data} onBack={onBack} />;
      default:
        return null;
    }
  };

  return (
    <View style={[commonStyles.container, { flex: 1 }]}>
      {/* ШАПКА с индикаторами */}
      {currentStep > 0 && (
        <View style={styles.header}>
          <View style={styles.indicatorRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.indicatorBar,
                  i <= currentStep - 1
                    ? styles.indicatorActive
                    : styles.indicatorInactive,
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* КОНТЕНТ */}
      <View style={styles.contentWrapper}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.animatedContainer, animatedStyle]}>
            {renderStep(currentStep)}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 8,
    width: "100%",
    zIndex: 10,
  },
  indicatorRow: {
    flexDirection: "row",
    gap: 4,
  },
  indicatorBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  indicatorActive: {
    backgroundColor: colors.mainColor,
  },
  indicatorInactive: {
    backgroundColor: "rgba(106, 90, 224, 0.12)",
  },
  contentWrapper: {
    flex: 1,
    overflow: "hidden",
  },
  animatedContainer: {
    flex: 1,
    width: "100%",
  },
});