import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export default function Index() {
  const { session } = useAuthStore();

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

