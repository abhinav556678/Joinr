import { supabase } from './supabase';
import { Platform } from 'react-native';
export const fetchUser = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const fetchUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      developer_metrics (
        github_json,
        leetcode_json
      )
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserIntent = async (userId, intentStatus) => {
  const { data, error } = await supabase
    .from('users')
    .update({ intent_status: intentStatus })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchDiscoveryFeed = async (currentUserId, currentUserIntent) => {
  // Complementary intents
  let targetIntent = 'LOOKING_TO_JOIN';
  if (currentUserIntent === 'LOOKING_TO_JOIN') {
    targetIntent = 'RECRUITING';
  } else if (currentUserIntent === 'RECRUITING') {
    targetIntent = 'LOOKING_TO_JOIN';
  } else {
    // Default or 'WORKING'
    targetIntent = 'LOOKING_TO_JOIN';
  }

  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      manual_bio,
      intent_status,
      developer_metrics(github_json, leetcode_json),
      project_members(projects(title, status))
    `)
    .eq('intent_status', targetIntent)
    .neq('id', currentUserId);

  if (error) throw error;
  
  // Transform the data slightly for easier UI consumption
  return data.map(user => {
    // Supabase returns related table as an array or object depending on relationship.
    const activeProject = user.project_members?.find(pm => pm.projects?.status === 'IN_PROGRESS')?.projects?.title || null;
    
    let trustScore = 0;
    if (user.developer_metrics) {
       const github = user.developer_metrics.github_json?.raw || {};
       const leetcode = user.developer_metrics.leetcode_json || {};
       const repos = github.public_repos || 0;
       const followers = github.followers || 0;
       const solved = leetcode.totalSolved || 0;
       trustScore = Math.min(100, repos + followers * 5 + Math.floor(solved / 5));
    }
    
    return {
      ...user,
      currentProject: activeProject,
      trustScore
    };
  });
};


export const calculateMatch = async (user1_id, user2_id) => {
  // Use localhost or emulator IP depending on environment. For now, try localhost.
  const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');
  
  const response = await fetch(`${API_URL}/calculate-match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user1_id,
      user2_id,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to calculate match');
  }

  return response.json();
};
