import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getOrCreateProjectMatch } from '../lib/chatApi';
import AppText from './AppText';

export default function ProjectCard({ project, currentUserId }) {
  const router = useRouter();
  const [floatAnim] = useState(() => new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const handleStartChat = async () => {
    if (startingChat) return;
    setStartingChat(true);
    try {
      const recruiterId = project.project_members?.[0]?.user_id;
      if (!recruiterId) throw new Error('No recruiter found');
      
      const match = await getOrCreateProjectMatch(currentUserId, recruiterId, project.id);
      setModalVisible(false);
      router.push(`/chat/${match.id}`);
    } catch (error) {
      console.error('Failed to start chat', error);
    } finally {
      setStartingChat(false);
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setModalVisible(true)}>
        <Animated.View style={[styles.card, { transform: [{ translateY }] }]}>
          <AppText style={styles.title}>{project.title}</AppText>
          <AppText style={styles.position}>
            Recruiting for: <AppText style={styles.positionHighlight}>{project.recruiting_for}</AppText>
          </AppText>
          {project.skills_required && project.skills_required.length > 0 && (
            <View style={styles.skillsContainer}>
              {project.skills_required.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <AppText style={styles.skillText}>{skill}</AppText>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <AppText style={styles.modalTitle}>{project.title}</AppText>
              <AppText style={styles.modalPosition}>Recruiting: {project.recruiting_for}</AppText>
              
              <AppText style={styles.sectionTitle}>Description</AppText>
              <AppText style={styles.modalDescription}>{project.description || 'No description provided.'}</AppText>
              
              {project.skills_required && project.skills_required.length > 0 && (
                <>
                  <AppText style={styles.sectionTitle}>Required Skills</AppText>
                  <View style={styles.skillsContainer}>
                    {project.skills_required.map((skill, index) => (
                      <View key={index} style={styles.skillBadge}>
                        <AppText style={styles.skillText}>{skill}</AppText>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <AppText style={styles.closeButtonText}>Close</AppText>
              </TouchableOpacity>
              
              {project.project_members?.[0]?.user_id !== currentUserId && (
                <TouchableOpacity style={styles.chatButton} onPress={handleStartChat} disabled={startingChat}>
                  {startingChat ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <AppText style={styles.chatButtonText}>Chat</AppText>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EBE6DA',
    shadowColor: '#deb785',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  position: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  positionHighlight: {
    fontWeight: 'bold',
    color: '#deb785',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBE6DA',
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    color: '#333333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FDFBF7',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  modalPosition: {
    fontSize: 18,
    color: '#deb785',
    fontWeight: '600',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#EBE6DA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#deb785',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
