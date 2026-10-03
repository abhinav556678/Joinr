import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchUserMatches } from '../../lib/chatApi';
import AppText from '../../components/AppText';
import ScreenContainer from '../../components/ScreenContainer';

const MatchCard = ({ match, onPress }) => {
  const otherName = match.otherUser?.name || 'Developer';
  const snippet = match.latestMessage ? match.latestMessage.text : 'Start a conversation';
  // Mock unread state for demonstration if we don't have it in data
  const isUnread = match.hasUnread || false; 

  return (
    <TouchableOpacity style={styles.matchCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <AppText style={styles.avatarText}>{otherName.charAt(0)}</AppText>
      </View>
      <View style={styles.matchInfo}>
        <AppText variant="heading" style={styles.matchName}>{otherName}</AppText>
        <AppText style={[styles.matchSnippet, isUnread && styles.matchSnippetUnread]} numberOfLines={1}>
          {snippet}
        </AppText>
      </View>
      <View style={styles.metaInfo}>
        <AppText style={styles.timeText}>2h</AppText>
        {isUnread && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
};

export default function MessagesScreen() {
  const { session } = useAuthStore();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchUserMatches(session.user.id);
      setMatches(data);
    } catch (err) {
      console.error('Failed to load matches', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [session])
  );

  if (loading) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color="#C05C41" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="heading" style={styles.logo}>Joinr</AppText>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="edit" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MatchCard match={item} onPress={() => router.push(`/chat/${item.id}`)} />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.titleArea}>
            <AppText variant="heading" style={styles.title}>Messages</AppText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>No conversations yet.</AppText>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  titleArea: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    color: '#1A1A1A',
  },
  listContent: {
    paddingBottom: 100,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
  },
  matchName: {
    fontSize: 22,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  matchSnippet: {
    fontSize: 15,
    color: '#A0988F',
  },
  matchSnippetUnread: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  metaInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 13,
    color: '#A0988F',
    marginBottom: 6,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C05C41',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#A0988F',
    textAlign: 'center',
  }
});
