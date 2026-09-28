import AppTextInput from '../../components/AppTextInput';
import AppText from '../../components/AppText';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { fetchMessages, sendMessage, fetchMatchDetails } from '../../lib/chatApi';
import { proposeTeam, acceptTeam } from '../../lib/projectApi';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import CustomModal from '../../components/CustomModal';

export default function ChatScreen() {
  const { id: matchId } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuthStore();
  const user = session?.user;
  const [messages, setMessages] = useState([]);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  
  // Propose Team state
  const [proposeModalVisible, setProposeModalVisible] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [proposing, setProposing] = useState(false);
  
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`chat_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const loadMessages = async () => {
    try {
      const data = await fetchMessages(matchId);
      setMessages(data);
      const details = await fetchMatchDetails(matchId);
      setMatchDetails(details);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      await sendMessage(matchId, user.id, textToSend);
    } catch (err) {
      console.error('Failed to send message', err);
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const handleProposeTeam = async () => {
    if (!projectTitle.trim() || proposing) return;
    setProposing(true);
    try {
      await proposeTeam(matchId, user.id, projectTitle, projectDesc);
      setProposeModalVisible(false);
    } catch (err) {
      console.error('Failed to propose team:', err);
    } finally {
      setProposing(false);
      setProjectTitle('');
      setProjectDesc('');
    }
  };

  const handleAcceptTeam = async (title, desc) => {
    try {
      await acceptTeam(matchId, title, desc);
    } catch (err) {
      console.error('Failed to accept team:', err);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender_id === user.id;

    if (item.text.startsWith('[SYSTEM]')) {
      return (
        <View style={styles.systemMessageWrapper}>
          <AppText style={styles.systemMessageText}>{item.text.replace('[SYSTEM] ', '')}</AppText>
        </View>
      );
    }

    if (item.text.startsWith('[PROPOSAL]')) {
      const payloadStr = item.text.replace('[PROPOSAL]', '');
      let payload = { title: 'Unknown', description: '' };
      try { payload = JSON.parse(payloadStr); } catch (e) {}

      return (
        <View style={[styles.messageWrapper, isMine ? styles.messageMineWrapper : styles.messageTheirsWrapper]}>
          <View style={[styles.messageBubble, styles.proposalBubble, isMine ? styles.messageMine : styles.messageTheirs]}>
            <AppText style={styles.proposalHeader}>🚀 Team Proposal</AppText>
            <AppText style={styles.proposalTitle}>{payload.title}</AppText>
            {payload.description ? <AppText style={styles.proposalDesc}>{payload.description}</AppText> : null}
            
            {!isMine && (
              <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptTeam(payload.title, payload.description)}>
                <AppText style={styles.acceptBtnText}>Accept & Form Team</AppText>
              </TouchableOpacity>
            )}
            {isMine && <AppText style={styles.pendingText}>Waiting for them to accept...</AppText>}
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageWrapper, isMine ? styles.messageMineWrapper : styles.messageTheirsWrapper]}>
        <View style={[styles.messageBubble, isMine ? styles.messageMine : styles.messageTheirs]}>
          <AppText style={styles.messageText}>{item.text}</AppText>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerTitle: () => (
            <TouchableOpacity onPress={() => {
              if (matchDetails) {
                const otherUserId = matchDetails.user_a_id === user.id ? matchDetails.user_b_id : matchDetails.user_a_id;
                router.push(`/profile/${otherUserId}${matchDetails.project_id ? '?projectId=' + matchDetails.project_id : ''}`);
              }
            }}>
              <AppText style={{ fontSize: 18, fontWeight: 'bold' }}>
                {matchDetails ? (matchDetails.user_a_id === user.id ? matchDetails.user_b.name : matchDetails.user_a.name) : 'Chat'}
              </AppText>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => setProposeModalVisible(true)} style={styles.headerBtn}>
              <AppText style={styles.headerBtnText}>Propose Team</AppText>
            </TouchableOpacity>
          )
        }}
      />
      {/* <Stack.Screen 
        options={{ 
          title: matchDetails ? (matchDetails.user_a_id === user.id ? matchDetails.user_b.name : matchDetails.user_a.name) : 'Chat',
          headerRight: () => (
            <TouchableOpacity onPress={() => setProposeModalVisible(true)} style={styles.headerBtn}>
              <AppText style={styles.headerBtnText}>Propose Team</AppText>
            </TouchableOpacity>
          )
        }} 
      /> */} 
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#deb785" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.inputContainer}>
        <AppTextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#666666"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!inputText.trim() || sending}>
          <AppText style={[styles.sendButtonText, (!inputText.trim() || sending) && styles.sendButtonDisabled]}>Send</AppText>
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={proposeModalVisible}
        onClose={() => setProposeModalVisible(false)}
        title="Propose a Team"
        subtitle="Ready to collaborate? Send a team proposal to make it official."
        onConfirm={handleProposeTeam}
        confirmText="Send Proposal"
        isConfirming={proposing}
        confirmDisabled={!projectTitle.trim()}
      >
        <AppTextInput
          style={styles.modalInput}
          placeholder="Project Name (e.g., Joinr)"
          placeholderTextColor="#666666"
          value={projectTitle}
          onChangeText={setProjectTitle}
        />
        <AppTextInput
          style={[styles.modalInput, styles.textArea]}
          multiline
          placeholder="Brief description of what you're building..."
          placeholderTextColor="#666666"
          value={projectDesc}
          onChangeText={setProjectDesc}
        />
      </CustomModal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBtn: {
    backgroundColor: 'rgba(222, 183, 133, 0.2)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 6, borderWidth: 1, borderColor: '#deb785',
  },
  headerBtnText: { color: '#deb785',  fontSize: 18 },
  listContent: { padding: 16, gap: 8 },
  messageWrapper: { flexDirection: 'row', marginBottom: 8 },
  messageMineWrapper: { justifyContent: 'flex-end' },
  messageTheirsWrapper: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  messageMine: { backgroundColor: '#deb785', borderBottomRightRadius: 4 },
  messageTheirs: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#EBE6DA' },
  messageText: { color: '#111111', fontSize: 20, lineHeight: 22 },
  
  systemMessageWrapper: { alignItems: 'center', marginVertical: 8 },
  systemMessageText: { color: '#666666', fontSize: 16, fontStyle: 'italic', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  
  proposalBubble: { minWidth: '60%' },
  proposalHeader: { color: '#deb785',  marginBottom: 4 },
  proposalTitle: { color: '#111111', fontSize: 22,  },
  proposalDesc: { color: '#333333', fontSize: 18, marginTop: 4, marginBottom: 12 },
  acceptBtn: { backgroundColor: '#deb785', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  acceptBtnText: { color: '#FFF',  },
  pendingText: { color: '#666666', fontSize: 16, fontStyle: 'italic', marginTop: 8, textAlign: 'center' },
  
  inputContainer: { flexDirection: 'row', padding: 12, paddingBottom: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EBE6DA', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#FDFBF7', color: '#111111', borderWidth: 1, borderColor: '#EBE6DA', borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, maxHeight: 100, minHeight: 40 },
  sendButton: { marginLeft: 12, marginBottom: 10 },
  sendButtonText: { color: '#deb785',  fontSize: 20 },
  sendButtonDisabled: { color: '#999999' },
  
  modalInput: { backgroundColor: '#FDFBF7', color: '#111111', borderWidth: 1, borderColor: '#EBE6DA', borderRadius: 6, padding: 12, marginBottom: 16 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});
