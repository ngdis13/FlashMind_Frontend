import React from 'react';
import { ImageStyle, Image } from 'react-native';
import { Icons } from '..';

interface CloseEyesIconProps {
  size?: number;
  style?: ImageStyle;
}

export const CloseEyesIcon = ({
  size = 24,
  style,
}: CloseEyesIconProps) => (
  <Image
    source={Icons.CloseEyesIcon}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);
