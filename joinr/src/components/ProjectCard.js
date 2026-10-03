import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getOrCreateProjectMatch } from '../lib/chatApi';
import AppText from './AppText';
import AppButton from './AppButton';
import Card from './Card';

export default function ProjectCard({ project, currentUserId }) {
  const router = useRouter();
  const [startingChat, setStartingChat] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleStartChat = async () => {
    if (startingChat) return;
    setStartingChat(true);
    try {
      const recruiterId = project.project_members?.[0]?.user_id;
      if (!recruiterId) throw new Error('No recruiter found');
      
      const match = await getOrCreateProjectMatch(currentUserId, recruiterId, project.id);
      router.push(`/chat/${match.id}`);
    } catch (error) {
      console.error('Failed to start chat', error);
    } finally {
      setStartingChat(false);
    }
  };

  const isOwner = project.project_members?.[0]?.user_id === currentUserId;

  return (
    <Card style={styles.container}>
      <AppText style={styles.label}>PROJECT</AppText>
      <AppText variant="heading" style={styles.title}>{project.title}</AppText>
      
      <View style={styles.userInfoRow}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>
            {project.title ? project.title.charAt(0).toUpperCase() : 'P'}
          </AppText>
        </View>
        <View style={styles.userInfoText}>
          <AppText style={styles.userName}>{project.recruiting_for || 'Developer'}</AppText>
          {project.skills_required && project.skills_required.length > 0 && (
            <AppText style={styles.userRole}>{project.skills_required.join(', ')}</AppText>
          )}
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color="#A0988F" />
            <AppText style={styles.locationText}>Remote</AppText>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.descriptionContainer}>
        <AppText 
          style={styles.description} 
          numberOfLines={expanded ? undefined : 4}
        >
          {project.description || 'No description provided for this project.'}
        </AppText>
        {project.description && project.description.length > 100 && !expanded && (
          <TouchableOpacity onPress={() => setExpanded(true)}>
            <AppText style={styles.readMore}>Read more ↓</AppText>
          </TouchableOpacity>
        )}
      </View>

      {!isOwner && (
        <View style={styles.actionRow}>
          <AppButton 
            title="Pass" 
            variant="secondary" 
            style={styles.passButton} 
            onPress={() => {}} 
          />
          <AppButton 
            title="Connect" 
            variant="primary" 
            style={styles.connectButton} 
            onPress={handleStartChat} 
            loading={startingChat}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0988F',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    lineHeight: 36,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#A0988F',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#FAF8F5', // very subtle divider
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#666666',
  },
  readMore: {
    fontSize: 15,
    color: '#C05C41',
    marginTop: 8,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  passButton: {
    flex: 1,
  },
  connectButton: {
    flex: 1,
  }
});
