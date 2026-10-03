import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';

export default function Badge({ label, variant = 'default', dot = false }) {
  const isPrimary = variant === 'primary';
  const backgroundColor = isPrimary ? '#FBEBE6' : '#F5F5F5';
  const textColor = isPrimary ? '#C05C41' : '#666666';
  
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      {dot && <View style={[styles.dot, { backgroundColor: textColor }]} />}
      <AppText style={[styles.text, { color: textColor }]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  }
});
