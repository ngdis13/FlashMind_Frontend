import React from 'react';
import { ImageStyle, Image } from 'react-native';
import { Icons } from '..';

interface OpenEyesIconProps {
  size?: number;
  style?: ImageStyle;
}

export const OpenEyesIcon = ({
  size = 24,
  style,
}: OpenEyesIconProps) => (
  <Image
    source={Icons.OpenEyesIcon}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);
