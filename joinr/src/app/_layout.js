import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

export default function RootLayout() {
  const { session, isInitialized, setSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session ?? null);
    }).catch((err) => {
      console.warn("Auth initialization error:", err);
      setSession(null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = !segments.length || segments[0] === 'index';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && (inAuthGroup || isRoot)) {
      router.replace('/(tabs)');
    }
  }, [session, isInitialized, segments]);

  if (!isInitialized || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FDFBF7', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#deb785" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FDFBF7' } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}
