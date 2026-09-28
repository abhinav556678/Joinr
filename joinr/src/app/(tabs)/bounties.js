import AppTextInput from '../../components/AppTextInput';
import AppText from '../../components/AppText';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchBounties, createBounty, resolveBounty, getOrCreateMatch } from '../../lib/bountyApi';
import { startChat } from '../../lib/chatApi';
import CustomModal from '../../components/CustomModal';

export default function BountiesScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const currentUserId = session?.user?.id;

  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  
  // Post Bounty state
  const [bountyTitle, setBountyTitle] = useState('');
  const [bountyDescription, setBountyDescription] = useState('');
  const [posting, setPosting] = useState(false);

  // Connect state
  const [selectedBounty, setSelectedBounty] = useState(null);
  const [introMessage, setIntroMessage] = useState('');
  const [connecting, setConnecting] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchBounties();
      setBounties(data);
    } catch (err) {
      console.error('Failed to fetch bounties:', err);
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

  const handlePostBounty = async () => {
    if (!bountyTitle.trim() || !bountyDescription.trim() || posting) return;
    setPosting(true);
    try {
      await createBounty(currentUserId, bountyTitle, bountyDescription);
      setPostModalVisible(false);
      setBountyTitle('');
      setBountyDescription('');
      loadData();
    } catch (err) {
      console.error('Failed to post bounty:', err);
    } finally {
      setPosting(false);
    }
  };

  const openConnectModal = (bounty) => {
    if (bounty.creator_id === currentUserId) return; // Don't connect to own bounty
    setSelectedBounty(bounty);
    setIntroMessage(`Hey! I saw your bounty "${bounty.title}" and I can help.`);
    setConnectModalVisible(true);
  };

  const handleConnectSubmit = async () => {
    if (!introMessage.trim() || connecting || !selectedBounty) return;
    setConnecting(true);
    try {
      const match = await getOrCreateMatch(currentUserId, selectedBounty.creator_id);
      await startChat(match.id, currentUserId, introMessage);
      setConnectModalVisible(false);
      router.push(`/chat/${match.id}`);
    } catch (err) {
      console.error('Failed to connect:', err);
    } finally {
      setConnecting(false);
      setSelectedBounty(null);
    }
  };

  const renderBounty = ({ item }) => {
    const isMine = item.creator_id === currentUserId;
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => !isMine && openConnectModal(item)}
        disabled={isMine}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <AppText style={styles.title}>{item.title}</AppText>
          {isMine && (
            <View style={styles.mineBadge}>
              <AppText style={styles.mineBadgeText}>Your Bounty</AppText>
            </View>
          )}
        </View>
        <AppText style={styles.description}>{item.description}</AppText>
        <View style={styles.footer}>
          <AppText style={styles.creatorName}>Posted by {item.users?.name || 'Unknown'}</AppText>
          <AppText style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</AppText>
        </View>
        
        {isMine && (
          <TouchableOpacity 
            style={styles.resolveBtn} 
            onPress={async () => {
              try {
                await resolveBounty(item.id);
                loadData();
              } catch (err) {
                console.error('Failed to resolve bounty:', err);
              }
            }}
          >
            <AppText style={styles.resolveBtnText}>Mark as Resolved</AppText>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.headerTitle}>Micro-Bounties</AppText>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#deb785" />
        </View>
      ) : (
        <FlatList
          data={bounties}
          keyExtractor={(item) => item.id}
          renderItem={renderBounty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#deb785"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>No active bounties. Be the first to post one!</AppText>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setPostModalVisible(true)}
      >
        <AppText style={styles.fabText}>+ Post Bounty</AppText>
      </TouchableOpacity>

      {/* Post Bounty Modal */}
      <CustomModal
        visible={postModalVisible}
        onClose={() => setPostModalVisible(false)}
        title="Post a Bounty"
        subtitle="Need help with a small task? Let the community know."
        onConfirm={handlePostBounty}
        confirmText="Post"
        isConfirming={posting}
        confirmDisabled={!bountyTitle.trim() || !bountyDescription.trim()}
      >
        <AppTextInput
          style={styles.input}
          placeholder="What do you need help with?"
          placeholderTextColor="#666666"
          value={bountyTitle}
          onChangeText={setBountyTitle}
        />
        <AppTextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Provide more details so others know how to help..."
          placeholderTextColor="#666666"
          value={bountyDescription}
          onChangeText={setBountyDescription}
        />
      </CustomModal>

      {/* Connect Modal */}
      <CustomModal
        visible={connectModalVisible}
        onClose={() => setConnectModalVisible(false)}
        title="Offer Help"
        subtitle={selectedBounty ? `Send a message to ${selectedBounty.users?.name}` : ''}
        onConfirm={handleConnectSubmit}
        confirmText="Send Message"
        isConfirming={connecting}
        confirmDisabled={!introMessage.trim()}
      >
        <AppTextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Hey, let's build this!"
          placeholderTextColor="#666666"
          value={introMessage}
          onChangeText={setIntroMessage}
        />
      </CustomModal>
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
    paddingBottom: 100, // Make room for FAB
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBE6DA',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    
    color: '#111111',
    flex: 1,
  },
  mineBadge: {
    backgroundColor: 'rgba(222, 183, 133, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#deb785',
    marginLeft: 10,
  },
  mineBadgeText: {
    color: '#deb785',
    fontSize: 16,
    
  },
  description: {
    color: '#333333',
    fontSize: 19,
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorName: {
    color: '#666666',
    fontSize: 17,
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
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#deb785',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 20,
    
  },
  input: {
    backgroundColor: '#FDFBF7',
    color: '#111111',
    borderWidth: 1,
    borderColor: '#EBE6DA',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  resolveBtn: {
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 123, 114, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF7B72',
    alignItems: 'center',
  },
  resolveBtnText: {
    color: '#FF7B72',
    
    fontSize: 18,
  }
});
