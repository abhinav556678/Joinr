import AppText from '../../components/AppText';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchUser, updateUserIntent, fetchDiscoveryFeed } from '../../lib/usersApi';
import ProfileCard from '../../components/ProfileCard';
import ProjectCard from '../../components/ProjectCard';
import { createProjectPost, fetchRecruitmentPosts } from '../../lib/projectApi';

export default function HomeScreen() {
  const { session, signOut } = useAuthStore();
  const [currentUser, setCurrentUser] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingIntent, setUpdatingIntent] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postPosition, setPostPosition] = useState('');
  const [postSkills, setPostSkills] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);

  const loadData = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const user = await fetchUser(session.user.id);
      setCurrentUser(user);
      let feedData;
      if (user.intent_status === 'LOOKING_TO_JOIN') {
        feedData = await fetchRecruitmentPosts();
      } else {
        feedData = await fetchDiscoveryFeed(session.user.id, user.intent_status);
      }
      setFeed(feedData);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleIntent = async () => {
    if (!currentUser || updatingIntent) return;
    const newIntent = currentUser.intent_status === 'LOOKING_TO_JOIN' ? 'RECRUITING' : 'LOOKING_TO_JOIN';
    setUpdatingIntent(true);
    
    try {
      const updatedUser = await updateUserIntent(session.user.id, newIntent);
      setCurrentUser(updatedUser);
      // Refetch feed with new intent
      setLoading(true);
      let feedData;
      if (updatedUser.intent_status === 'LOOKING_TO_JOIN') {
        feedData = await fetchRecruitmentPosts();
      } else {
        feedData = await fetchDiscoveryFeed(session.user.id, updatedUser.intent_status);
      }
      setFeed(feedData);
    } catch (error) {
      console.error('Error updating intent:', error);
    } finally {
      setLoading(false);
      setUpdatingIntent(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postTitle || !postPosition || !postSkills) {
      Alert.alert('Error', 'Please fill in Topic, Position, and Skills Required.');
      return;
    }
    setCreatingPost(true);
    try {
      const skillsArray = postSkills.split(',').map(s => s.trim()).filter(s => s);
      await createProjectPost(session.user.id, postTitle, postDescription, skillsArray, postPosition);
      setModalVisible(false);
      setPostTitle('');
      setPostPosition('');
      setPostSkills('');
      setPostDescription('');
      Alert.alert('Success', 'Recruitment post created!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post.');
    } finally {
      setCreatingPost(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C05C41" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="heading" style={styles.logo}>Joinr</AppText>
        <TouchableOpacity onPress={signOut} style={styles.avatarPlaceholder}>
          <AppText style={styles.avatarInitials}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </AppText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.heroSection}>
        <AppText variant="heading" style={styles.heroTitle}>
          Hello, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Developer'}
        </AppText>
        <AppText style={styles.heroSubtitle}>Discover builders. Build together.</AppText>
      </View>

      {currentUser && (
        <View style={styles.toggleWrapper}>
          <View style={[styles.sliderTrack, updatingIntent && styles.sliderTrackDisabled]}>
            <TouchableOpacity 
              style={[
                styles.sliderOption, 
                currentUser.intent_status === 'LOOKING_TO_JOIN' && styles.sliderOptionActive
              ]} 
              onPress={() => currentUser.intent_status !== 'LOOKING_TO_JOIN' && toggleIntent()}
              disabled={updatingIntent}
            >
              <AppText style={[
                styles.sliderText, 
                currentUser.intent_status === 'LOOKING_TO_JOIN' && styles.sliderTextActive
              ]}>Looking to Join</AppText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.sliderOption, 
                currentUser.intent_status === 'RECRUITING' && styles.sliderOptionActive
              ]} 
              onPress={() => currentUser.intent_status !== 'RECRUITING' && toggleIntent()}
              disabled={updatingIntent}
            >
              <AppText style={[
                styles.sliderText, 
                currentUser.intent_status === 'RECRUITING' && styles.sliderTextActive
              ]}>Recruiting</AppText>
            </TouchableOpacity>
          </View>
          {updatingIntent && <ActivityIndicator style={styles.updatingSpinner} size="small" color="#C05C41" />}
        </View>
      )}

      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => 
          currentUser?.intent_status === 'LOOKING_TO_JOIN' 
            ? <ProjectCard project={item} currentUserId={session.user.id} />
            : <ProfileCard user={item} currentUserId={session.user.id} />
        }
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C05C41" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>
              {currentUser?.intent_status === 'LOOKING_TO_JOIN' 
                ? 'No recruitment posts found right now.'
                : 'No developers found with complementary intents right now.'}
            </AppText>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <AppText style={styles.fabIcon}>+</AppText>
      </TouchableOpacity>
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <AppText variant="heading" style={styles.modalTitle}>Create Recruitment Post</AppText>
            <TextInput style={styles.input} placeholder="Topic / Project Title" placeholderTextColor="#A0988F" value={postTitle} onChangeText={setPostTitle} />
            <TextInput style={styles.input} placeholder="Position (e.g. Frontend Developer)" placeholderTextColor="#A0988F" value={postPosition} onChangeText={setPostPosition} />
            <TextInput style={styles.input} placeholder="Skills Required (comma separated)" placeholderTextColor="#A0988F" value={postSkills} onChangeText={setPostSkills} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Description" placeholderTextColor="#A0988F" value={postDescription} onChangeText={setPostDescription} multiline numberOfLines={4} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)} disabled={creatingPost}>
                <AppText style={styles.cancelButtonText}>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleCreatePost} disabled={creatingPost}>
                {creatingPost ? <ActivityIndicator color="#fff" /> : <AppText style={styles.submitButtonText}>Post</AppText>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#1A1A1A' 
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 40,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#A0988F',
  },
  toggleWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrack: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F5',
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    width: '100%',
  },
  sliderTrackDisabled: {
    opacity: 0.7,
  },
  sliderOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  sliderOptionActive: {
    backgroundColor: '#C05C41',
  },
  sliderText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '600',
  },
  sliderTextActive: {
    color: '#ffffff',
  },
  updatingSpinner: {
    position: 'absolute',
    right: 32,
  },
  feedContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666666',
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#deb785',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 30,
    color: '#fff',
    lineHeight: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FDFBF7',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EBE6DA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#deb785',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
