import { supabase } from './supabase';

export const fetchBounties = async () => {
  const { data, error } = await supabase
    .from('bounties')
    .select(`
      *,
      users!creator_id (
        id,
        name
      )
    `)
    .eq('is_resolved', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createBounty = async (creatorId, title, description) => {
  const { data, error } = await supabase
    .from('bounties')
    .insert({ creator_id: creatorId, title, description })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const resolveBounty = async (bountyId) => {
  const { data, error } = await supabase
    .from('bounties')
    .update({ is_resolved: true })
    .eq('id', bountyId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Helper to ensure a match exists without needing AI calculation
export const getOrCreateMatch = async (userA, userB) => {
  const { data: m1 } = await supabase.from('matches').select('*').eq('user_a_id', userA).eq('user_b_id', userB).maybeSingle();
  if (m1) return m1;
  
  const { data: m2 } = await supabase.from('matches').select('*').eq('user_a_id', userB).eq('user_b_id', userA).maybeSingle();
  if (m2) return m2;

  // Create new direct match
  const { data: newMatch, error: insertError } = await supabase
    .from('matches')
    .insert({
      user_a_id: userA,
      user_b_id: userB,
      status: 'PENDING',
      ai_match_score: 100, // Direct connection bypasses AI scoring
      ai_reasoning: 'Direct connection via Micro-Bounty.'
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return newMatch;
};
