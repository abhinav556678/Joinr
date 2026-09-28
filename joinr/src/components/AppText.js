import React from 'react';
import { Text } from 'react-native';

export default function AppText({ style, ...props }) {
  let fontFamily = 'Inter_400Regular';
  
  const flattenedStyle = style ? (Array.isArray(style) ? Object.assign({}, ...style) : style) : {};
  if (flattenedStyle.fontWeight === 'bold' || flattenedStyle.fontWeight === '700' || flattenedStyle.fontWeight === '600' || flattenedStyle.fontWeight === '800' || flattenedStyle.fontWeight === '900') {
    fontFamily = 'Inter_700Bold';
  }

  return <Text style={[{ fontFamily }, style]} {...props} />;
}
