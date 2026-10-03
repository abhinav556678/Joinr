import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';

export default function ScreenContainer({ children, style, useSafeArea = false }) {
  const Container = useSafeArea ? SafeAreaView : View;
  
  return (
    <Container style={[styles.container, style]}>
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  }
});
