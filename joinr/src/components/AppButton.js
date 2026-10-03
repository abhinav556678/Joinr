import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import AppText from './AppText';

export default function AppButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  style, 
  textStyle 
}) {
  const isPrimary = variant === 'primary';
  const buttonStyle = isPrimary ? styles.primaryButton : styles.secondaryButton;
  const tStyle = isPrimary ? styles.primaryText : styles.secondaryText;
  
  return (
    <TouchableOpacity 
      style={[styles.button, buttonStyle, disabled && styles.disabled, style]} 
      onPress={onPress} 
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#FFFFFF" : "#C05C41"} />
      ) : (
        <AppText style={[tStyle, textStyle]}>{title}</AppText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#C05C41',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  }
});
