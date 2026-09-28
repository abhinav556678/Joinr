const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ixjciapukdtlveusjpmj.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4amNpYXB1a2R0bHZldXNqcG1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDQyMzIzNSwiZXhwIjoyMTA1OTk5MjM1fQ.JtJ-JiCzKjmk4jtEGuxBCiqLlcQRUBlgail14QJ2_Yk";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seed() {
  console.log('Starting seed process using admin API...');
  
  const usersToCreate = [
    { email: 'alex@startup.io', password: 'password123', name: 'Alex Rivera', bio: 'Frontend wizard. I make things look good and run fast.', intent: 'LOOKING_TO_JOIN', score: 85 },
    { email: 'sarah@build.inc', password: 'password123', name: 'Sarah Chen', bio: 'Founder @ Stealth. Looking for a technical cofounder.', intent: 'RECRUITING', score: 92 },
    { email: 'mike@backend.dev', password: 'password123', name: 'Mike Johnson', bio: 'Rust and Node.js backend engineer. Performance is a feature.', intent: 'WORKING', score: 78 },
    { email: 'emily@design.co', password: 'password123', name: 'Emily Davis', bio: 'UI/UX Designer getting into code. Let\'s build beautiful things.', intent: 'LOOKING_TO_JOIN', score: 45 },
    { email: 'david@venture.vc', password: 'password123', name: 'David Kim', bio: 'Building the next big thing. Need engineers who can ship.', intent: 'RECRUITING', score: 99 },
  ];

  const createdUsers = [];

  for (const u of usersToCreate) {
    console.log(`Admin creating ${u.email}...`);
    // Admin API bypasses rate limits and email confirmation
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true
    });
    
    let userId;

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`${u.email} already exists.`);
        // Try to fetch user id by getting users list, wait, we can just login or query auth.users?
        // Admin can list users.
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData.users.find(x => x.email === u.email);
        if (existing) userId = existing.id;
      } else {
        console.error('Error creating user', u.email, authError);
        continue;
      }
    } else {
      userId = authData.user.id;
    }

    if (!userId) continue;

    const { error: dbError } = await supabase.from('users').upsert({
      id: userId,
      email: u.email,
      name: u.name,
      manual_bio: u.bio,
      intent_status: u.intent
    });

    if (dbError) console.error('Error inserting into users', dbError);

    await supabase.from('developer_metrics').upsert({
      user_id: userId,
      trust_score: u.score
    });

    createdUsers.push({ ...u, id: userId });
  }

  console.log('Users ready:', createdUsers.length);

  const sarah = createdUsers.find(u => u.name === 'Sarah Chen');
  const david = createdUsers.find(u => u.name === 'David Kim');
  const alex = createdUsers.find(u => u.name === 'Alex Rivera');

  if (sarah && alex) {
    console.log('Creating project for Sarah and Alex...');
    const { data: projData, error: projError } = await supabase.from('projects').insert({
      title: 'Supabase Analytics Tool',
      description: 'A dashboard to visualize your Supabase project metrics in real time.',
      status: 'IN_PROGRESS'
    }).select().single();

    if (!projError && projData) {
      await supabase.from('project_members').insert([
        { project_id: projData.id, user_id: sarah.id, role: 'Founder' },
        { project_id: projData.id, user_id: alex.id, role: 'Developer' }
      ]);
    }
  }

  if (david) {
    console.log('Creating project for David...');
    const { data: projData2, error: projError2 } = await supabase.from('projects').insert({
      title: 'Expo Web3 Starter',
      description: 'Boilerplate for building mobile dApps using Expo and wagmi.',
      status: 'IN_PROGRESS'
    }).select().single();

    if (!projError2 && projData2) {
      await supabase.from('project_members').insert([
        { project_id: projData2.id, user_id: david.id, role: 'Creator' }
      ]);
    }
  }

  if (sarah) {
    console.log('Creating bounty for Sarah...');
    await supabase.from('bounties').insert({
      creator_id: sarah.id,
      title: 'Need help writing SQL migration for auth',
      description: 'I am struggling with RLS policies in Supabase. Need a quick 20 min pair programming session to lock down my users table.',
      is_resolved: false
    });
  }

  if (david) {
    console.log('Creating bounties for David...');
    await supabase.from('bounties').insert([
      {
        creator_id: david.id,
        title: 'Help me debug React Native Reanimated issue',
        description: 'My shared element transition is glitching on Android. Looking for an animation expert.',
        is_resolved: false
      },
      {
        creator_id: david.id,
        title: 'Looking for someone to design 3 SVGs',
        description: 'Need a rocket, a brain, and a magnifying glass designed in a clean, minimalist style.',
        is_resolved: false
      }
    ]);
  }

  console.log('Seed complete!');
}

seed().catch(console.error);
