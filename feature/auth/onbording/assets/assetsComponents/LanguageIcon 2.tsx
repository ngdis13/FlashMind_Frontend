import React from 'react';
import { ImageStyle, Image } from 'react-native';
import { Icons } from '..';

interface IconProps {
  size?: number;
  style?: ImageStyle;
}

export const LanguageIcon = ({ size = 24, style }: IconProps) => (
  <Image
    source={Icons.Language}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);
