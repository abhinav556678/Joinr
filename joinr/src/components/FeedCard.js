import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppText from './AppText';
import Card from './Card';
import Badge from './Badge';

export default function FeedCard({ item }) {
  const membersText = item.members?.join(' & ') || 'Developers';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatars}>
          {item.members?.map((m, i) => (
            <View key={i} style={[styles.avatar, { marginLeft: i > 0 ? -12 : 0 }]}>
              <AppText style={styles.avatarText}>{m.charAt(0)}</AppText>
            </View>
          ))}
        </View>
        <View style={styles.headerText}>
          <AppText style={styles.names}>{membersText}</AppText>
          <AppText style={styles.actionText}>are building</AppText>
        </View>
        <TouchableOpacity>
          <Feather name="more-horizontal" size={20} color="#A0988F" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleRow}>
        <AppText variant="heading" style={styles.title}>{item.title}</AppText>
        <Badge label="In Progress" variant="primary" dot />
      </View>

      <AppText style={styles.description}>{item.description}</AppText>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <AppText style={styles.tagText}>{tag}</AppText>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionIcon}>
            <Feather name="heart" size={18} color="#A0988F" />
            <AppText style={styles.actionCount}>42</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Feather name="message-square" size={18} color="#A0988F" />
            <AppText style={styles.actionCount}>12</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Feather name="share-2" size={18} color="#A0988F" />
            <AppText style={styles.actionCount}>6</AppText>
          </TouchableOpacity>
        </View>
        <AppText style={styles.timestamp}>2d ago</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatars: {
    flexDirection: 'row',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  names: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  actionText: {
    fontSize: 14,
    color: '#A0988F',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 14,
    color: '#666666',
  },
  timestamp: {
    fontSize: 14,
    color: '#A0988F',
  }
});
