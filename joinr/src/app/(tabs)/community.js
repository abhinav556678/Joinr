import AppText from '../../components/AppText';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { fetchProjects } from '../../lib/projectApi';

export default function CommunityFeed() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch community projects:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderProject = ({ item }) => {
    // Determine members
    const members = item.project_members?.map(m => m.users?.name).filter(Boolean) || [];
    const membersText = members.length > 0 ? members.join(' and ') : 'Unknown Developers';

    return (
      <View style={styles.projectCard}>
        <View style={styles.announcementHeader}>
          <AppText style={styles.rocket}>🚀</AppText>
          <AppText style={styles.announcementText}>
            <AppText style={styles.bold}>{membersText}</AppText> are building <AppText style={styles.bold}>{item.title}</AppText>
          </AppText>
        </View>
        
        {item.description ? (
          <AppText style={styles.description}>{item.description}</AppText>
        ) : null}
        
        <View style={styles.footer}>
          <View style={styles.badge}>
            <AppText style={styles.badgeText}>{item.status === 'IN_PROGRESS' ? 'In Progress' : item.status}</AppText>
          </View>
          <AppText style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString()}
          </AppText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.headerTitle}>Community Feed</AppText>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#deb785" />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderProject}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#deb785"
              colors={["#deb785"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>No projects have been formed yet. Be the first!</AppText>
            </View>
          }
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
  },
  headerTitle: {
    fontSize: 28,
    
    color: '#111111',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE6DA',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBE6DA',
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rocket: {
    fontSize: 24,
    marginRight: 10,
    marginTop: 2,
  },
  announcementText: {
    flex: 1,
    fontSize: 20,
    color: '#111111',
    lineHeight: 24,
  },
  bold: {
    
    color: '#deb785',
  },
  description: {
    color: '#333333',
    fontSize: 18,
    lineHeight: 20,
    marginBottom: 16,
    paddingLeft: 30, // Aligns with text after rocket
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 30,
  },
  badge: {
    backgroundColor: 'rgba(46, 160, 67, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#deb785',
  },
  badgeText: {
    color: '#deb785',
    fontSize: 16,
    
  },
  dateText: {
    color: '#666666',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666666',
    fontSize: 20,
    textAlign: 'center',
  }
});
