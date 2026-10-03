import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import AppTextInput from '../../components/AppTextInput';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import ScreenContainer from '../../components/ScreenContainer';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
    }
    setLoading(false);
  }

  return (
    <ScreenContainer useSafeArea style={styles.container}>
      <View style={styles.content}>
        <AppText variant="heading" style={styles.title}>Joinr</AppText>
        <AppText style={styles.subtitle}>Welcome back, developer.</AppText>

        <AppTextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <AppTextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <AppButton 
          title="Log In" 
          onPress={handleLogin} 
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.secondaryAction}>
          <AppText style={styles.secondaryActionText}>Don't have an account? Sign Up</AppText>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  secondaryAction: {
    marginTop: 24,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#C05C41',
    fontSize: 14,
    fontWeight: '600',
  }
});
