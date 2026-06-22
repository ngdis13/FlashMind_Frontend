import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Typography } from "@/styles/Typography";

import { Logo } from "./Logo";

interface UserHintProps {
  visible: boolean;
  text: string;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  showArrow?: boolean;
}
export const UserHint = ({
  visible,
  text,
  onClose,
  style,
  showArrow = true,
}: UserHintProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }, style]}>
      {showArrow && <View style={styles.arrow} />}

      <Pressable 
        onPress={onClose} 
        style={styles.bubbleContainer}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {/* Рендерим переданный ИИ-компонент */}
        <View style={styles.iconWrapper}>
          <Logo size={37}/>
        </View>
        
        <View style={styles.textContainer}>
          <Typography variant="h3" style={{fontSize: 10}}>
            {text}
          </Typography>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    width: "100%",
    zIndex: 99,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#E2E4FF", 
    bottom: -1,
    zIndex: 100,
  },
  bubbleContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E4FF", 
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 357,
    width: "100%",
  },
  iconWrapper: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
});
