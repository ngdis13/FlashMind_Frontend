import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { StarProgress } from './StarProgress'; 
import { colors } from '@/styles/Colors';

export const StarTooltip = ({ count, starColor }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const getPluralForm = (n) => {
    if (n % 10 === 1 && n % 100 !== 11) return 'повторение';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'повторения';
    return 'повторений';
  };

  useEffect(() => {
    // Запуск анимации появления (1) или исчезновения (0)
    Animated.timing(fadeAnim, {
      toValue: isHovered ? 1 : 0,
      duration: 250, 
      useNativeDriver: true, 
    }).start();

    // Если подсказка открылась — запускаем таймер автозакрытия на 5 секунд
    if (isHovered) {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 2500); // 
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovered, fadeAnim]);

  // Обработка ручного клика (для мобилок и веба)
  const handlePress = () => {
    setIsHovered((prev) => !prev);
  };

  return (
    <View style={styles.anchor}>
      <Animated.View 
        style={[
          styles.tooltipContainer, 
          { 
            opacity: fadeAnim,
            pointerEvents: isHovered ? 'auto' : 'none' 
          }
        ]}
      >
        <View style={styles.tooltipCard}>
          <Text style={styles.tooltipText}>
            {count} {getPluralForm(count)}
          </Text>
        </View>
        <View style={styles.arrow} />
      </Animated.View>

      <Pressable
        // Убираем onHoverOut, чтобы уход курсора/пальца не закрывал плашку раньше времени
        onHoverIn={() => setIsHovered(true)}
        
        // Клик/Тап переключает состояние и запускает 5-секундный таймер
        onPress={handlePress}
        
        style={styles.starArea}
      >
        <StarProgress size={24} color={starColor} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  anchor: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999, 
  },
  starArea: {
    padding: 4,
    cursor: 'pointer',
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: 36, 
    alignItems: 'center',
    width: 120, 
    zIndex: 99999,
  },
  tooltipCard: {
    backgroundColor: colors.darkMainColor, 
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 100, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  tooltipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    /* @ts-ignore */
    whiteSpace: 'nowrap',
    /* @ts-ignore */
    wordBreak: 'keep-all',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1e293b',
    marginTop: -1,
  },
});
