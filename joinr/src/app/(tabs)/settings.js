import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchDeveloperMetrics } from '../../lib/developerMetricsApi';
import AppText from '../../components/AppText';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import AppButton from '../../components/AppButton';

export default function SettingsScreen() {
  const { session } = useAuthStore();
  const [viewModel, setViewModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    if (!session?.user) return;
    try {
      const data = await fetchDeveloperMetrics(session.user.id);
      setViewModel(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    await loadMetrics();
  };

  const userInitial = session?.user?.email ? session.user.email.charAt(0).toUpperCase() : 'U';

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="heading" style={styles.logo}>Joinr</AppText>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="settings" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleArea}>
          <AppText variant="heading" style={styles.title}>Developer Profile</AppText>
          <AppText style={styles.subtitle}>Verified Developer Identity</AppText>
        </View>

        <Card style={styles.identityCard}>
          <View style={styles.identityHeader}>
            <View style={styles.avatar}>
              <AppText style={styles.avatarText}>{userInitial}</AppText>
            </View>
            <View style={styles.identityInfo}>
              <AppText style={styles.name}>{session?.user?.user_metadata?.full_name || 'Abhinav'}</AppText>
              <View style={styles.verifiedBadgeRow}>
                <View style={styles.verifiedIconContainer}>
                  <Feather name="check" size={10} color="#FFFFFF" />
                </View>
                <AppText style={styles.verifiedText}>Verified Developer</AppText>
              </View>
              <AppText style={styles.bio}>Building thoughtful products at the intersection of design and technology.</AppText>
            </View>
          </View>
          <View style={styles.identityFooter}>
            <View style={styles.footerItem}>
              <Feather name="map-pin" size={14} color="#666666" />
              <AppText style={styles.footerText}>Bengaluru, India</AppText>
            </View>
            <AppText style={styles.footerSeparator}>|</AppText>
            <View style={styles.footerItem}>
              <Feather name="briefcase" size={14} color="#666666" />
              <AppText style={styles.footerText}>Open to opportunities</AppText>
            </View>
          </View>
        </Card>

        <Card style={styles.trustScoreCard}>
          <View style={styles.trustScoreTextCol}>
            <AppText variant="heading" style={styles.cardTitle}>Trust Score</AppText>
            <AppText style={styles.cardSubtitle}>A holistic view of your verified developer identity.</AppText>
          </View>
          <View style={styles.trustScoreCircle}>
            <AppText variant="heading" style={styles.scoreValue}>92</AppText>
            <AppText style={styles.scoreLabel}>/ 100</AppText>
            <AppText style={styles.scoreVerified}>Verified</AppText>
          </View>
        </Card>

        <Card style={styles.languagesCard}>
          <View style={styles.languagesHeader}>
            <AppText variant="heading" style={styles.cardTitle}>Top Languages</AppText>
            <AppText style={styles.viewAllText}>View all ></AppText>
          </View>
          
          <View style={styles.languageRow}>
            <AppText style={styles.languageName}>TypeScript</AppText>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '68%' }]} />
            </View>
            <AppText style={styles.languagePercent}>68%</AppText>
          </View>

          <View style={styles.languageRow}>
            <AppText style={styles.languageName}>Python</AppText>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '22%' }]} />
            </View>
            <AppText style={styles.languagePercent}>22%</AppText>
          </View>

          <View style={styles.languageRow}>
            <AppText style={styles.languageName}>Rust</AppText>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '10%' }]} />
            </View>
            <AppText style={styles.languagePercent}>10%</AppText>
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.gridCard}>
            <View style={styles.gridCardHeader}>
              <View style={styles.iconCircle}>
                <Feather name="github" size={16} color="#FFFFFF" />
              </View>
              <AppText style={styles.gridCardTitle}>GitHub</AppText>
              <Feather name="chevron-right" size={16} color="#A0988F" style={{ marginLeft: 'auto' }} />
            </View>
            <AppText style={styles.gridCardValue}>12 repos</AppText>
            <AppText style={styles.gridCardSubValue}>1.4k contributions</AppText>
          </Card>
          
          <Card style={styles.gridCard}>
            <View style={styles.gridCardHeader}>
              <View style={styles.iconCircleLeetc}>
                <AppText style={styles.leetcodeIcon}>{"<"}</AppText>
              </View>
              <AppText style={styles.gridCardTitle}>LeetCode</AppText>
              <Feather name="chevron-right" size={16} color="#A0988F" style={{ marginLeft: 'auto' }} />
            </View>
            <AppText style={styles.gridCardValue}>450 solved</AppText>
            <AppText style={styles.gridCardSubValue}>Top 4% rating</AppText>
          </Card>
        </View>

        <AppButton 
          title="Sync Live Data" 
          onPress={handleSync}
          loading={loading}
          style={styles.syncButton}
        />
        
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  logo: {
    fontSize: 28,
    color: '#1A1A1A',
  },
  iconButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  titleArea: {
    marginBottom: 24,
  },
  title: {
    fontSize: 40,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  identityCard: {
    padding: 20,
    marginBottom: 16,
  },
  identityHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  identityInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedIconContainer: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#C05C41',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C05C41',
  },
  bio: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  identityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#666666',
  },
  footerSeparator: {
    fontSize: 14,
    color: '#E8E2D9',
    marginHorizontal: 10,
  },
  trustScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  trustScoreTextCol: {
    flex: 1,
    paddingRight: 20,
  },
  cardTitle: {
    fontSize: 22,
    color: '#1A1A1A',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  trustScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#C05C41',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 32,
    lineHeight: 32,
    color: '#1A1A1A',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#1A1A1A',
  },
  scoreVerified: {
    fontSize: 10,
    color: '#C05C41',
    fontWeight: '600',
    marginTop: 2,
  },
  languagesCard: {
    padding: 20,
    marginBottom: 16,
  },
  languagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#C05C41',
    fontSize: 14,
    fontWeight: '500',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageName: {
    width: 80,
    fontSize: 14,
    color: '#1A1A1A',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8E2D9',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C05C41',
  },
  languagePercent: {
    width: 32,
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  gridCard: {
    flex: 1,
    padding: 16,
    marginBottom: 0,
  },
  gridCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconCircleLeetc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFA116',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  leetcodeIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  gridCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  gridCardSubValue: {
    fontSize: 13,
    color: '#666666',
  },
  syncButton: {
    marginBottom: 20,
  }
});
