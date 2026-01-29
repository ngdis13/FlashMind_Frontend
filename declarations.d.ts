// declarations.d.ts

// Для импорта SVG как React-компонента (когда заработает transformer)
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Для импорта SVG как строки с ?raw (то, что тебе сейчас нужно)
declare module '*.svg?raw' {
  const content: string;
  export default content;
}
