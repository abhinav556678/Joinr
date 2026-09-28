import AppTextInput from '../../components/AppTextInput';
import AppText from '../../components/AppText';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email || !password || !name || !bio) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    setLoading(true);

    // 1. Create the user in Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      Alert.alert('Signup Failed', authError.message);
      setLoading(false);
      return;
    }

    // 2. Insert the manual profile into our public 'users' table
    if (data.user) {
      const { error: dbError } = await supabase.from('users').insert({
        id: data.user.id,
        email: email,
        name: name,
        manual_bio: bio,
        intent_status: 'LOOKING_TO_JOIN'
      });

      if (dbError) {
        Alert.alert('Profile Error', dbError.message);
      } else {
        Alert.alert('Success!', 'Account created successfully. Please log in.');
        router.push('/(auth)/login');
      }
    }
    
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <AppText style={styles.title}>Create Profile</AppText>
        <AppText style={styles.subtitle}>Let's build your developer identity.</AppText>

        <AppTextInput style={styles.input} placeholder="Email" placeholderTextColor="#666666" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <AppTextInput style={styles.input} placeholder="Password (min 6 chars)" placeholderTextColor="#666666" secureTextEntry value={password} onChangeText={setPassword} />
        <AppTextInput style={styles.input} placeholder="Full Name or Handle" placeholderTextColor="#666666" value={name} onChangeText={setName} />
        <AppTextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Short Bio (e.g., 'React Developer looking for a UI designer...')" placeholderTextColor="#666666" multiline value={bio} onChangeText={setBio} />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#FDFBF7" /> : <AppText style={styles.primaryButtonText}>Create Account</AppText>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.secondaryButton}>
          <AppText style={styles.secondaryButtonText}>Already have an account? Log In</AppText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FDFBF7', padding: 20, justifyContent: 'center' },
  title: { fontSize: 36,  color: '#deb785', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 20, color: '#333333', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#EBE6DA', borderWidth: 1, color: '#333333', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 20 },
  primaryButton: { backgroundColor: '#deb785', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#FDFBF7',  fontSize: 20 },
  secondaryButton: { marginTop: 20, alignItems: 'center' },
  secondaryButtonText: { color: '#deb785', fontSize: 18 }
});
