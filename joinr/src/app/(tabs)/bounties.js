import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import ScreenContainer from '../../components/ScreenContainer';
import Pill from '../../components/Pill';
import BountyCard from '../../components/BountyCard';

const DUMMY_BOUNTIES = [
  {
    id: '1',
    type: 'BUG FIX',
    duration: '30m',
    title: 'Debug React Native Reanimated issue',
    price: '150',
    description: 'App throws "worklet value cannot be shared across threads" when using Reanimated 3. Need help identifying and fixing the issue.',
    tags: ['React Native', 'Reanimated', 'TypeScript'],
    user: {
      name: 'Daniel Kim',
      role: 'Product Engineer @ Vercel',
      verified: true
    }
  },
  {
    id: '2',
    type: 'REVIEW',
    duration: '30m',
    title: 'Supabase RLS Policy Review',
    price: '90',
    description: "Looking for a review of our RLS policies for a multi-tenant SaaS app. Want to make sure we're not missing any edge cases.",
    tags: ['Supabase', 'PostgreSQL', 'Security'],
    user: {
      name: 'Priya Sharma',
      role: 'CTO @ Steady',
      verified: true
    }
  }
];

const CATEGORIES = ['All', 'React Native', 'Supabase', 'Architecture'];

export default function BountiesScreen() {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="heading" style={styles.logo}>Joinr</AppText>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="search" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bell" size={24} color="#1A1A1A" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={DUMMY_BOUNTIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BountyCard bounty={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.titleArea}>
              <AppText variant="heading" style={styles.title}>Micro-Bounties</AppText>
              <AppText style={styles.subtitle}>Find quick tasks, earn bounties, and build credibility.</AppText>
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

      <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
        <Feather name="plus" size={20} color="#FFFFFF" />
        <AppText style={styles.fabText}>Post</AppText>
      </TouchableOpacity>
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
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C05C41',
    borderWidth: 1,
    borderColor: '#FAF8F5',
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
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#C05C41',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});
