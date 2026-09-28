import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchUserMatches } from '../../lib/chatApi';
import AppText from '../../components/AppText';

const MatchCard = ({ match, onPress }) => {
  const otherName = match.otherUser?.name || 'Unknown';
  const snippet = match.latestMessage ? match.latestMessage.text : 'No messages yet';

  return (
    <TouchableOpacity style={styles.matchCard} onPress={onPress}>
      <AppText style={styles.matchName}>{otherName}</AppText>
      <AppText style={styles.matchSnippet} numberOfLines={1}>{snippet}</AppText>
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#deb785" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Messages</AppText>
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyText}>No conversations yet.</AppText>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MatchCard match={item} onPress={() => router.push(`/chat/${item.id}`)} />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
  },
  title: {
    fontSize: 28,
    color: '#333333',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBE6DA',
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 5,
  },
  matchSnippet: {
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999999',
    textAlign: 'center',
  }
});
