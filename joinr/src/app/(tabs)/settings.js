import AppTextInput from '../../components/AppTextInput';
import AppText from '../../components/AppText';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchUserMetrics, verifyAndUpsertMetrics, mapMetricsToViewModel } from '../../lib/developerMetricsApi';

export default function ProfileScreen() {
  const { session } = useAuthStore();
  const [githubUsername, setGithubUsername] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  // We keep the raw metrics purely in state to pass to upsert if needed,
  // but we drive the UI completely from the view model
  const [rawMetrics, setRawMetrics] = useState(null);
  const [viewModel, setViewModel] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    if (!session?.user) return;
    try {
      const data = await fetchUserMetrics(session.user.id);
      if (data) {
        setRawMetrics(data);
        const vm = mapMetricsToViewModel(data);
        setViewModel(vm);
        if (vm.githubUsername) setGithubUsername(vm.githubUsername);
        if (vm.leetcodeUsername === 'linked') setLeetcodeUsername('linked');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async () => {
    if (!githubUsername && !leetcodeUsername) {
      Alert.alert('Error', 'Please enter at least one username.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyAndUpsertMetrics(
        session.user.id,
        githubUsername,
        leetcodeUsername === 'linked' ? '' : leetcodeUsername, // don't refetch leetcode if it's just 'linked' unless they changed it. Actually let's assume they change it.
        rawMetrics
      );
      
      setRawMetrics(data);
      setViewModel(mapMetricsToViewModel(data));
      Alert.alert('Success', 'Profile verified successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppText style={styles.title}>Developer Profile</AppText>

      {viewModel && viewModel.trustScore > 0 && (
        <View style={styles.scoreContainer}>
          <AppText style={styles.scoreTitle}>Trust Score</AppText>
          <AppText style={styles.scoreValue}>{viewModel.trustScore}</AppText>
          
          {viewModel.topLanguages && viewModel.topLanguages.length > 0 && (
            <View style={styles.languagesWrapper}>
              <AppText style={styles.sectionSubTitle}>Top Languages</AppText>
              <View style={styles.languagesBar}>
                {viewModel.topLanguages.map((lang, idx) => (
                  <View 
                    key={idx} 
                    style={[
                      styles.languageBarSegment, 
                      { 
                        width: `${lang.percentage}%`, 
                        backgroundColor: idx === 0 ? '#deb785' : idx === 1 ? '#deb785' : '#D2A8FF' 
                      }
                    ]} 
                  />
                ))}
              </View>
              <View style={styles.languagesLegend}>
                {viewModel.topLanguages.map((lang, idx) => (
                  <View key={idx} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: idx === 0 ? '#deb785' : idx === 1 ? '#deb785' : '#D2A8FF' }]} />
                    <AppText style={styles.legendText}>{lang.name} {lang.percentage}%</AppText>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.stats}>
             {viewModel.githubUsername !== '' && (
               <>
                 <AppText style={styles.statText}>Repos: {viewModel.githubRepos}</AppText>
                 <AppText style={styles.statText}>Followers: {viewModel.githubFollowers}</AppText>
               </>
             )}
             {viewModel.leetcodeUsername !== '' && (
                <AppText style={styles.statText}>LeetCode Solved: {viewModel.leetcodeSolved}</AppText>
             )}
          </View>
        </View>
      )}

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Verify Accounts</AppText>
        
        <AppText style={styles.label}>GitHub Username</AppText>
        <AppTextInput
          style={styles.input}
          placeholder="e.g. torvalds"
          placeholderTextColor="#666666"
          value={githubUsername}
          onChangeText={setGithubUsername}
          autoCapitalize="none"
        />

        <AppText style={styles.label}>LeetCode Username</AppText>
        <AppTextInput
          style={styles.input}
          placeholder="e.g. neetcode"
          placeholderTextColor="#666666"
          value={leetcodeUsername}
          onChangeText={setLeetcodeUsername}
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={styles.buttonText}>Verify Data</AppText>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 32,  color: '#333333', marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#EBE6DA', marginBottom: 20 },
  cardTitle: { fontSize: 22,  color: '#111111', marginBottom: 15 },
  label: { color: '#666666', marginBottom: 8, fontSize: 18 },
  input: { backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#EBE6DA', borderRadius: 6, color: '#333333', padding: 12, marginBottom: 15 },
  button: { backgroundColor: '#deb785', padding: 15, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff',  fontSize: 20 },
  scoreContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#deb785', marginBottom: 20, alignItems: 'center', shadowColor: '#deb785', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  scoreTitle: { color: '#666666', fontSize: 20, marginBottom: 5 },
  scoreValue: { color: '#deb785', fontSize: 52,  textShadowColor: 'rgba(88, 166, 255, 0.8)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 },
  languagesWrapper: { width: '100%', marginTop: 20, marginBottom: 15 },
  sectionSubTitle: { color: '#666666', fontSize: 18, marginBottom: 10, textAlign: 'center' },
  languagesBar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', width: '100%', marginBottom: 10 },
  languageBarSegment: { height: '100%' },
  languagesLegend: { flexDirection: 'row', justifyContent: 'center', gap: 15, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: '#333333', fontSize: 16 },
  stats: { flexDirection: 'row', gap: 15, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' },
  statText: { color: '#666666', fontSize: 18 },
});
