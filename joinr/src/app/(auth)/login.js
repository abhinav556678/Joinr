import AppTextInput from '../../components/AppTextInput';
import AppText from '../../components/AppText';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

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
    <View style={styles.container}>
      <AppText style={styles.title}>Joinr</AppText>
      <AppText style={styles.subtitle}>Welcome back, developer.</AppText>

      <AppTextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666666"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <AppTextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#FDFBF7" /> : <AppText style={styles.primaryButtonText}>Log In</AppText>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.secondaryButton}>
        <AppText style={styles.secondaryButtonText}>Don't have an account? Sign Up</AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 44,
    
    color: '#deb785',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EBE6DA',
    borderWidth: 1,
    color: '#333333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 20,
  },
  primaryButton: {
    backgroundColor: '#deb785',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FDFBF7',
    
    fontSize: 20,
  },
  secondaryButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#deb785',
    fontSize: 18,
  }
});
