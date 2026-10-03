import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import ScreenContainer from '../../components/ScreenContainer';
import Pill from '../../components/Pill';
import FeedCard from '../../components/FeedCard';

// Dummy Data exactly like the design
const DUMMY_FEED = [
  {
    id: '1',
    members: ['David Kim', 'Alex Rivera'],
    title: 'Expo Web3 Starter',
    description: 'A modern starter kit for building Web3 mobile apps with Expo. Includes wallet connection, onchain data hooks, and a clean, scalable project structure.',
    tags: ['Expo', 'Wagmi', 'Solidity'],
    status: 'IN_PROGRESS'
  },
  {
    id: '2',
    members: ['Sarah Chen', 'Mark Lin'],
    title: 'Supabase Analytics',
    description: 'Open source analytics dashboard for Supabase projects. Real-time metrics, beautiful charts, and easy setup for indie hackers.',
    tags: ['Supabase', 'Next.js', 'TypeScript'],
    status: 'IN_PROGRESS'
  }
];

const CATEGORIES = ['All', 'Building', 'Design', 'Looking for', 'Completed'];

export default function CommunityFeed() {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="heading" style={styles.logo}>Joinr</AppText>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="search" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButtonPrimary}>
            <Feather name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={DUMMY_FEED}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedCard item={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.titleArea}>
              <AppText variant="heading" style={styles.title}>Community Feed</AppText>
              <AppText style={styles.subtitle}>Collaborations & Projects</AppText>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {CATEGORIES.map(cat => (
                <Pill 
                  key={cat} 
                  label={cat} 
                  active={activeCategory === cat} 
                  onPress={() => setActiveCategory(cat)} 
                />
              ))}
            </ScrollView>
          </>
        }
      />
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  iconButtonPrimary: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C05C41',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0988F',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  listContent: {
    paddingBottom: 100,
  }
});
