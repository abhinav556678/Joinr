import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import AppTextInput from '../../components/AppTextInput';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import ScreenContainer from '../../components/ScreenContainer';

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

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      Alert.alert('Signup Failed', authError.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
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
    <ScreenContainer useSafeArea>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <AppText variant="heading" style={styles.title}>Joinr</AppText>
            <AppText style={styles.subtitle}>Create your developer identity.</AppText>

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
              placeholder="Password (min 6 chars)" 
              secureTextEntry 
              value={password} 
              onChangeText={setPassword} 
            />
            <AppTextInput 
              style={styles.input} 
              placeholder="Full Name or Handle" 
              value={name} 
              onChangeText={setName} 
            />
            <AppTextInput 
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
              placeholder="Short Bio (e.g., 'React Developer looking for a UI designer...')" 
              multiline 
              value={bio} 
              onChangeText={setBio} 
            />

            <AppButton 
              title="Create Account" 
              onPress={handleSignup} 
              loading={loading}
              style={styles.button}
            />

            <TouchableOpacity onPress={() => router.back()} style={styles.secondaryAction}>
              <AppText style={styles.secondaryActionText}>Already have an account? Log In</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 24 
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: { 
    fontSize: 48, 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666666', 
    textAlign: 'center', 
    marginBottom: 40 
  },
  input: { 
    marginBottom: 16 
  },
  button: {
    marginTop: 8
  },
  secondaryAction: { 
    marginTop: 24, 
    alignItems: 'center' 
  },
  secondaryActionText: { 
    color: '#C05C41', 
    fontSize: 14,
    fontWeight: '600'
  }
});
