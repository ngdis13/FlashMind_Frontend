import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface Props {
  currentStep: number;
}
const TOTAL_BARS = 4;

export function ProgressLineAnimated({ currentStep }: Props) {
  const animation = useRef(
    Array.from({ length: TOTAL_BARS }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    animation.forEach((anim, index) => {
      const stepIndex = currentStep - 1;

      if (index < stepIndex) {
        anim.setValue(1);
        return;
      }

      if (index > stepIndex) {
        anim.setValue(0);
        return;
      }

      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();
    });
  }, [currentStep]);

  return (
    <View style={styles.container}>
      {animation.map((anim, index) => (
        <View key={index} style={styles.barBackground}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 8,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#6E75D9',
    borderRadius: 4,
  },
});
