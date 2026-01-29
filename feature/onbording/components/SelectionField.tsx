import React, { ReactNode } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Typography } from '@/styles';

interface SelectionProps {
  image: ReactNode;
  title: string;
  style?: ViewStyle | ViewStyle[];
  onPress: () => void;
}

export const SelectionField = ({
  image,
  title,
  onPress,
}: SelectionProps) => (
  <TouchableOpacity style={styles.container} onPress={onPress}>
    <View>{image}</View>
    <Typography variant="h2">{title}</Typography>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 375,
    height: 58,
    paddingHorizontal: 16,
  },
});
