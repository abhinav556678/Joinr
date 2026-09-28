import { supabase } from './supabase';

const encodeProjectMeta = (description, skills_required, recruiting_for) => {
  const meta = { skills_required, recruiting_for };
  return `${description || ''}\n\n---META---\n${JSON.stringify(meta)}`;
};

const decodeProjectMeta = (project) => {
  if (!project || !project.description) return { ...project, skills_required: [], recruiting_for: '' };
  const parts = project.description.split('\n\n---META---\n');
  if (parts.length === 2) {
    try {
      const meta = JSON.parse(parts[1]);
      return {
        ...project,
        description: parts[0],
        skills_required: meta.skills_required || [],
        recruiting_for: meta.recruiting_for || ''
      };
    } catch (e) {
      // Ignore
    }
  }
  return { ...project, skills_required: [], recruiting_for: '' };
};

export const fetchProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, title, description, status, created_at,
      project_members (
        user_id, role, users ( name )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(decodeProjectMeta);
};

export const fetchRecruitmentPosts = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, title, description, status, created_at,
      project_members (
        user_id, role, users ( name )
      )
    `)
    .eq('status', 'OPEN')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(decodeProjectMeta);
};

export const createProjectPost = async (userId, title, description, skillsRequired, recruitingFor) => {
  // 1. Create project
  const encodedDescription = encodeProjectMeta(description, skillsRequired, recruitingFor);
  const { data: project, error: projError } = await supabase
    .from('projects')
    .insert({ 
      title, 
      description: encodedDescription, 
      status: 'OPEN' 
    })
    .select()
    .single();

  if (projError) throw projError;

  // 2. Add creator as a member
  const { error: membersError } = await supabase
    .from('project_members')
    .insert({ project_id: project.id, user_id: userId, role: 'Creator' });

  if (membersError) throw membersError;

  return decodeProjectMeta(project);
};

export const proposeTeam = async (matchId, senderId, title, description) => {
  // Instead of forming the team, we insert a structured proposal message
  const payload = JSON.stringify({ title, description });
  const text = `[PROPOSAL]${payload}`;
  
  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: senderId, text })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const acceptTeam = async (matchId, title, description) => {
  // 1. Fetch match to get user_a_id and user_b_id
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();
  
  if (matchError) throw matchError;

  // 2. Update match status
  await supabase
    .from('matches')
    .update({ status: 'TEAM_FORMED' })
    .eq('id', matchId);

  // 3. Create project
  const { data: project, error: projError } = await supabase
    .from('projects')
    .insert({ title, description, status: 'IN_PROGRESS' })
    .select()
    .single();
    
  if (projError) throw projError;

  // 4. Add both users as members
  const { error: membersError } = await supabase
    .from('project_members')
    .insert([
      { project_id: project.id, user_id: match.user_a_id, role: 'Co-Founder' },
      { project_id: project.id, user_id: match.user_b_id, role: 'Co-Founder' }
    ]);
    
  if (membersError) throw membersError;

  // Insert a system message that it was accepted
  await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: match.user_b_id, text: `[SYSTEM] Team '${title}' has been formed! 🚀` });

  return project;
};
