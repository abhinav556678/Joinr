import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import ScreenContainer from '../../components/ScreenContainer';
import Pill from '../../components/Pill';
import BountyCard from '../../components/BountyCard';
import { fetchBounties } from '../../lib/bountyApi';

const CATEGORIES = ['All', 'React Native', 'Supabase', 'Architecture'];

export default function BountiesScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBounties();
  }, []);

  const loadBounties = async () => {
    try {
      setLoading(true);
      const data = await fetchBounties();
      const mapped = data.map(b => ({
        id: b.id,
        type: 'BOUNTY',
        duration: 'TBD',
        title: b.title,
        price: '--',
        description: b.description,
        tags: [],
        user: {
          name: b.users?.name || 'Unknown',
          role: 'Developer',
          verified: true
        }
      }));
      setBounties(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C05C41" />
        </View>
      ) : (
        <FlatList
          data={bounties}
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
      )}

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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  }
});
