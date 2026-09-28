import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchUserProfile } from '../../lib/usersApi';
import AppText from '../../components/AppText';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/useAuthStore';

export default function ProfileScreen() {
  const { id, projectId } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchScore, setMatchScore] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchUserProfile(id);
        setProfile(data);

        // If opened from a project chat context
        if (projectId && currentUser) {
          // Fetch project to see required skills and check if current user is recruiter
          const { data: project } = await supabase
            .from('projects')
            .select(`
              skills_required,
              project_members(user_id, role)
            `)
            .eq('id', projectId)
            .single();

          if (project) {
            const isRecruiter = project.project_members?.some(pm => pm.user_id === currentUser.id && pm.role === 'Creator');
            
            if (isRecruiter) {
              // Calculate match score
              const requiredSkills = project.skills_required || [];
              const applicantSkills = data.skills || [];
              
              if (requiredSkills.length > 0) {
                const matchCount = requiredSkills.filter(s => applicantSkills.map(as => as.toLowerCase()).includes(s.toLowerCase())).length;
                const score = Math.round((matchCount / requiredSkills.length) * 100);
                setMatchScore(score);
              } else {
                setMatchScore(100);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, projectId, currentUser]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#deb785" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centerContainer}>
        <AppText style={styles.errorText}>{error || 'Profile not found.'}</AppText>
        <AppText style={styles.backButton} onPress={() => router.back()}>Go Back</AppText>
      </View>
    );
  }

  // Parse GitHub info if available
  const metrics = Array.isArray(profile.developer_metrics) 
    ? profile.developer_metrics[0] 
    : profile.developer_metrics;
  
  const githubUsername = metrics?.github_json?.login;
  const githubChartUrl = githubUsername 
    ? `https://ghchart.rshah.org/${githubUsername}` 
    : null;

  let computedTrustScore = 0;
  if (metrics) {
     const github = metrics.github_json?.raw || {};
     const leetcode = metrics.leetcode_json || {};
     const repos = github.public_repos || 0;
     const followers = github.followers || 0;
     const solved = leetcode.totalSolved || 0;
     computedTrustScore = Math.min(100, repos + followers * 5 + Math.floor(solved / 5));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppText style={styles.backButtonTop} onPress={() => router.back()}>← Back</AppText>
      
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <AppText style={styles.avatarInitial}>{profile.name.charAt(0).toUpperCase()}</AppText>
        </View>
        <AppText style={styles.name}>{profile.name}</AppText>
        <AppText style={styles.intent}>{profile.intent_status}</AppText>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>About</AppText>
        <AppText style={styles.bio}>
          {profile.manual_bio || 'No bio provided.'}
        </AppText>
      </View>


      {matchScore !== null && (
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Skill Match Score</AppText>
          <View style={styles.matchScoreBadge}>
            <AppText style={styles.matchScoreText}>{matchScore}% Match</AppText>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Trust Score</AppText>
        <View style={styles.scoreBadge}>
          <AppText style={styles.scoreText}>🏆 {computedTrustScore}</AppText>
        </View>
      </View>

      {githubUsername && (
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>GitHub Contributions</AppText>
          <AppText style={styles.githubUsername}>@{githubUsername}</AppText>
          <Image 
            source={{ uri: githubChartUrl }} 
            style={styles.githubChart} 
            resizeMode="contain"
          />
        </View>
      )}
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  content: {
    padding: 24,
    paddingTop: 60, // for SafeArea manually
  },
  backButton: {
    color: '#deb785',
    fontSize: 18,
    marginTop: 20,
  },
  backButtonTop: {
    color: '#deb785',
    fontSize: 18,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF7B72',
    fontSize: 18,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#deb785',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInitial: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 8,
  },
  intent: {
    fontSize: 16,
    color: '#666666',
    backgroundColor: '#EBE6DA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  bio: {
    fontSize: 18,
    color: '#666666',
    lineHeight: 26,
  },
  matchScoreBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(46, 160, 67, 0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#2ea043' },
  matchScoreText: { color: '#2ea043', fontSize: 20, fontWeight: 'bold' },
  githubUsername: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  githubChart: {
    width: width - 48,
    height: 120,
  }
});
