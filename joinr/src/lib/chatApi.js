import { supabase } from './supabase';

const insertMessage = async (matchId, senderId, text) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: senderId, text })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getOrCreateProjectMatch = async (userId, recruiterId, projectId) => {
  // Check if it exists
  const { data: existing } = await supabase
    .from('matches')
    .select('id, status')
    .eq('user_a_id', userId)
    .eq('user_b_id', recruiterId)
    .eq('project_id', projectId)
    .single();

  if (existing) {
    if (existing.status !== 'CONNECTED') {
      await supabase.from('matches').update({ status: 'CONNECTED' }).eq('id', existing.id);
    }
    return existing;
  }

  // Check reverse direction just in case
  const { data: existingReverse } = await supabase
    .from('matches')
    .select('id, status')
    .eq('user_a_id', recruiterId)
    .eq('user_b_id', userId)
    .eq('project_id', projectId)
    .single();

  if (existingReverse) {
    if (existingReverse.status !== 'CONNECTED') {
      await supabase.from('matches').update({ status: 'CONNECTED' }).eq('id', existingReverse.id);
    }
    return existingReverse;
  }

  // Create new match
  const { data: newMatch, error: createError } = await supabase
    .from('matches')
    .insert({
      user_a_id: userId,
      user_b_id: recruiterId,
      project_id: projectId,
      status: 'CONNECTED'
    })
    .select('id')
    .single();

  if (createError) throw createError;
  return newMatch;
};

export const startChat = async (matchId, senderId, text) => {
  // Update match status to CONNECTED
  const { error: matchError } = await supabase
    .from('matches')
    .update({ status: 'CONNECTED' })
    .eq('id', matchId);

  if (matchError) throw matchError;
  return insertMessage(matchId, senderId, text);
};

export const sendMessage = async (matchId, senderId, text) => {
  return insertMessage(matchId, senderId, text);
};

export const fetchMessages = async (matchId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const fetchMatchDetails = async (matchId) => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user_a:users!user_a_id(id, name),
      user_b:users!user_b_id(id, name)
    `)
    .eq('id', matchId)
    .single();

  if (error) throw error;
  return data;
};

export const fetchUserMatches = async (userId) => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user_a:users!user_a_id(id, name),
      user_b:users!user_b_id(id, name),
      messages(text, created_at)
    `)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .eq('status', 'CONNECTED');

  if (error) throw error;

  const matchesWithDetails = data.map((match) => {
    const otherUser = match.user_a_id === userId ? match.user_b : match.user_a;
    const sortedMessages = (match.messages || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const latestMessage = sortedMessages.length > 0 ? sortedMessages[0] : null;

    return {
      ...match,
      otherUser: otherUser || { name: 'Unknown' },
      latestMessage,
    };
  });

  matchesWithDetails.sort((a, b) => {
    const dateA = a.latestMessage ? new Date(a.latestMessage.created_at).getTime() : new Date(a.created_at).getTime();
    const dateB = b.latestMessage ? new Date(b.latestMessage.created_at).getTime() : new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  return matchesWithDetails;
};
