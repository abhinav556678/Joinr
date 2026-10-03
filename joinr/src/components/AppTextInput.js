import React from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';

export default function AppTextInput({ style, ...props }) {
  let fontFamily = 'Inter_400Regular';
  
  const flattenedStyle = style ? (Array.isArray(style) ? Object.assign({}, ...style) : style) : {};
  if (flattenedStyle.fontWeight === 'bold' || flattenedStyle.fontWeight === '700' || flattenedStyle.fontWeight === '600' || flattenedStyle.fontWeight === '800' || flattenedStyle.fontWeight === '900') {
    fontFamily = 'Inter_700Bold';
  }

  return (
    <RNTextInput 
      placeholderTextColor="#A0988F"
      style={[styles.input, { fontFamily }, style]} 
      {...props} 
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8E2D9',
    borderWidth: 1,
    color: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  }
});
