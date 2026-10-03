import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import ScreenContainer from '../../components/ScreenContainer';
import Pill from '../../components/Pill';
import FeedCard from '../../components/FeedCard';
import { fetchProjects } from '../../lib/projectApi';

const CATEGORIES = ['All', 'Building', 'Design', 'Looking for', 'Completed'];

export default function CommunityFeed() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchProjects();
      const mapped = data.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        tags: p.skills_required || [],
        status: p.status,
        members: p.project_members?.map(m => m.users?.name).filter(Boolean) || []
      }));
      setFeed(mapped);
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
          <TouchableOpacity style={styles.iconButtonPrimary}>
            <Feather name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C05C41" />
        </View>
      ) : (
        <FlatList
          data={feed}
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
      )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  }
});
