// --------------------------- React ---------------------------
import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";

// --------------------------- Компоненты Шагов ---------------------------
import { Welcome } from "./screens/Welcome";
import { Progress } from "./screens/Progress";

// --------------------------- UI-Система Приложения ---------------------------
import { commonStyles } from "@/styles/Common";

import { Problems } from "./screens/Problems";
import { Recommendation } from "./screens/Recomendation";
import { Plans } from "./screens/Plans";
import { Closed } from "./screens/Closed";

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

/**
 * Экран ИИ-аналитики.
 * Шаги: 0=Welcome, 1=Progress, 2=Problems, 3=Recommendation, 4=Goals, 5=Closed.
 * Переключение — только по кнопке, без свайпов и анимаций.
 */
export const AiInsightsScreen = ({ data, onBack }: AiInsightsScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <View style={[commonStyles.container, { flex: 1 }]}>
      {/* ШАПКА с индикаторами (скрыта на Welcome) */}
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

      {/* КОНТЕНТ ШАГА */}
      <View style={styles.content}>
        {currentStep === 0 && <Welcome data={data} onNext={handleNext} />}
        {currentStep === 1 && <Progress data={data} onNext={handleNext} />}
        {currentStep === 2 && <Problems data={data} onNext={handleNext} />}
        {currentStep === 3 && <Recommendation data={data} onNext={handleNext} />}
        {currentStep === 4 && <Plans data={data} onNext={handleNext} />}
        {currentStep === 5 && <Closed data={data} onBack={onBack} />}
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
    backgroundColor: "#6A5AE0",
  },
  indicatorInactive: {
    backgroundColor: "rgba(106, 90, 224, 0.12)",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  mascot: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    zIndex: 5,
  },
  buttonWrap: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    paddingHorizontal: 12,
    zIndex: 10,
  },
  button: {
    width: "100%",
  },
});
