import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText';

export default function Pill({ label, active = false, onPress }) {
  return (
    <TouchableOpacity 
      style={[styles.pill, active && styles.pillActive]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <AppText style={[styles.text, active && styles.textActive]}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FAF8F5',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#C05C41',
  },
  text: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  textActive: {
    color: '#FFFFFF',
  }
});
