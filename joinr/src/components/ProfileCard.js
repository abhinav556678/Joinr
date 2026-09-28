import AppTextInput from '../components/AppTextInput';
import AppText from '../components/AppText';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { calculateMatch } from '../lib/usersApi';
import { startChat } from '../lib/chatApi';
import { useRouter } from 'expo-router';
import CustomModal from './CustomModal';

export default function ProfileCard({ user, currentUserId }) {
  const router = useRouter();
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [introMessage, setIntroMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handlePress = async () => {
    if (matchData || loading) return;

    setLoading(true);
    setError(null);
    try {
      const data = await calculateMatch(currentUserId, user.id);
      setMatchData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to calculate match');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSubmit = async () => {
    if (!introMessage.trim() || sending || !matchData?.id) return;
    setSending(true);
    try {
      await startChat(matchData.id, currentUserId, introMessage);
      setModalVisible(false);
      router.push(`/chat/${matchData.id}`);
    } catch (err) {
      console.error('Failed to send connect message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress} 
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={(e) => { e.stopPropagation(); router.push(/profile/); }}
            style={styles.avatarPlaceholder}
          >
            <AppText style={styles.avatarInitial}>{user.name.charAt(0).toUpperCase()}</AppText>
          </TouchableOpacity>
          <AppText style={styles.name}>{user.name}</AppText>
        </View>
        {user.trustScore > 0 && (
          <View style={styles.scoreBadge}>
            <AppText style={styles.scoreText}>🏆 {user.trustScore}</AppText>
          </View>
        )}
      </View>
      
      <View style={styles.tagsContainer}>
        <AppText style={styles.intent}>{user.intent_status === 'LOOKING_TO_JOIN' ? 'Looking to Join' : 'Recruiting'}</AppText>
        {user.currentProject && (
          <View style={styles.projectBadge}>
            <AppText style={styles.projectBadgeText}>Building: {user.currentProject}</AppText>
          </View>
        )}
      </View>
      
      {user.manual_bio ? (
        <AppText style={styles.bio}>{user.manual_bio}</AppText>
      ) : (
        <AppText style={styles.emptyBio}>No bio provided.</AppText>
      )}

      {(loading || matchData || error) && (
        <View style={styles.matchSection}>
          <View style={styles.divider} />
          
          {loading && (
            <View style={styles.skeletonContainer}>
              <View style={styles.skeletonScoreRow}>
                <View style={styles.skeletonLabel} />
                <View style={styles.skeletonValue} />
              </View>
              <View style={styles.skeletonReasoning} />
              <View style={[styles.skeletonReasoning, { width: '80%' }]} />
            </View>
          )}

          {error && (
            <AppText style={styles.errorText}>{error}</AppText>
          )}

          {matchData && !loading && (
            <View style={styles.matchResult}>
              <View style={styles.matchScoreContainer}>
                <AppText style={styles.matchScoreLabel}>Match Score</AppText>
                <View style={styles.glowWrapper}>
                  <AppText style={styles.matchScoreValue}>{matchData.ai_match_score}/100</AppText>
                </View>
              </View>
              <AppText style={styles.matchReasoning}>{matchData.ai_reasoning}</AppText>
              
              <TouchableOpacity 
                style={styles.connectBtn} 
                onPress={() => setModalVisible(true)}
              >
                <AppText style={styles.connectBtnText}>Connect</AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Introduce Yourself"
        subtitle={`Send a message to ${user.name}`}
        onConfirm={handleConnectSubmit}
        confirmText="Send"
        isConfirming={sending}
        confirmDisabled={!introMessage.trim()}
      >
        <AppTextInput
          style={styles.textInput}
          multiline
          placeholder="Hey, let's build this!"
          placeholderTextColor="#666666"
          value={introMessage}
          onChangeText={setIntroMessage}
        />
      </CustomModal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#EBE6DA', marginBottom: 16, width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#deb785', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold' },
  name: { fontSize: 24,  color: '#111111' },
  tagsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  intent: { color: '#666666', fontSize: 18,  },
  projectBadge: { backgroundColor: 'rgba(222, 183, 133, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1, borderColor: '#deb785' },
  projectBadgeText: { color: '#deb785', fontSize: 16,  },
  bio: { color: '#333333', fontSize: 20, lineHeight: 24 },
  emptyBio: { color: '#999999', fontStyle: 'italic', fontSize: 20 },
  matchSection: { marginTop: 16 },
  divider: { height: 1, backgroundColor: '#EBE6DA', marginBottom: 16 },
  skeletonContainer: { padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 8 },
  skeletonScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  skeletonLabel: { width: 100, height: 20, backgroundColor: '#EBE6DA', borderRadius: 4 },
  skeletonValue: { width: 60, height: 28, backgroundColor: '#EBE6DA', borderRadius: 4 },
  skeletonReasoning: { width: '100%', height: 16, backgroundColor: '#EBE6DA', borderRadius: 4, marginBottom: 8 },
  errorText: { color: '#FF7B72', textAlign: 'center', fontSize: 18 },
  matchResult: { backgroundColor: 'rgba(46, 160, 67, 0.1)', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(46, 160, 67, 0.4)' },
  matchScoreContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  matchScoreLabel: { color: '#deb785',  fontSize: 20 },
  glowWrapper: { shadowColor: '#deb785', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 15, elevation: 8 },
  matchScoreValue: { color: '#deb785',  fontSize: 30, textShadowColor: 'rgba(222, 183, 133, 0.8)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 },
  matchReasoning: { color: '#333333', fontSize: 18, lineHeight: 20 },
  connectBtn: { backgroundColor: '#deb785', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 16 },
  connectBtnText: { color: '#FFFFFF',  fontSize: 20 },
  textInput: { backgroundColor: '#FDFBF7', color: '#333333', borderWidth: 1, borderColor: '#EBE6DA', borderRadius: 6, padding: 12, minHeight: 100, textAlignVertical: 'top', marginBottom: 16 },
});
