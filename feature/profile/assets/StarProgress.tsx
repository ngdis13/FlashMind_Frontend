import React from 'react';
import { ImageStyle, Image } from 'react-native';
import starProgress from '@/assets/images/StarProgress.png'

interface StarProgressProps {
  size?: number;
  style?: ImageStyle;
}

export const StarProgress = ({ size = 24, style }: StarProgressProps) => (
  <Image
    source={starProgress}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);
