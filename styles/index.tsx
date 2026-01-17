import React from 'react'
import { Text, TextProps, TextStyle } from 'react-native'

type TypographyVariant = 'h1' | 'h2' | 'h3'

interface TypographyProps extends TextProps {
  variant?: TypographyVariant
  color?: string
}

const baseStyle: TextStyle = {
  fontFamily: 'MontserratSemiBold',
  fontSize: 16,
  color: '#282B54',
}

const variants: Record<TypographyVariant, TextStyle> = {
  h1: {
    fontSize: 24,
    fontFamily: 'MontserratSemiBold',
    color: '#282B54',
  },
  h2: {
    fontSize: 16,
    fontFamily: 'MontserratSemiBold',
    color: '#282B54',
  },
  h3: {
    fontSize: 12,
    fontFamily: 'MontserratSemiBold',
    color: '#282B54',
  },
}
export const Typography = ({
  variant = 'h2',
  style,
  color,
  children,
  ...props
}: TypographyProps) => {
  return (
    <Text {...props} style={[baseStyle, variants[variant], color ? { color } : {}, style]}>
      {children}
    </Text>
  )
}
