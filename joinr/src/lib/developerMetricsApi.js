import { supabase } from './supabase';

export async function fetchUserMetrics(userId) {
  const { data, error } = await supabase
    .from('developer_metrics')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data || null;
}

export async function verifyAndUpsertMetrics(userId, githubUsername, leetcodeUsername, existingMetrics) {
  let githubPayload = existingMetrics?.github_json || null;
  let leetcodeData = existingMetrics?.leetcode_json || null;
  

  // 1. Fetch GitHub
  if (githubUsername) {
    const ghRes = await fetch(`https://api.github.com/users/${githubUsername}`);
    if (!ghRes.ok) throw new Error('Could not fetch GitHub profile.');
    const rawGhData = await ghRes.json();
    
    // Fetch repos for top languages
    let topLanguages = [];
    const reposRes = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100`);
    if (reposRes.ok) {
      const repos = await reposRes.json();
      const counts = {};
      let total = 0;
      repos.forEach(repo => {
        if (repo.language) {
          counts[repo.language] = (counts[repo.language] || 0) + 1;
          total++;
        }
      });
      topLanguages = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({
          name,
          percentage: Math.round((count / total) * 100)
        }));
    }

    // Encapsulate the raw data while adding our computed top languages so we don't mutate raw
    githubPayload = {
      raw: rawGhData,
      top_languages: topLanguages
    };
  }

  // 2. Fetch LeetCode
  if (leetcodeUsername) {
    const lcRes = await fetch(`https://leetcode-stats-api.herokuapp.com/${leetcodeUsername}`);
    if (!lcRes.ok) throw new Error('Could not fetch LeetCode profile.');
    const json = await lcRes.json();
    if (json.status !== 'success') throw new Error('Could not fetch LeetCode profile.');
    leetcodeData = json;
  } // 4. Upsert
  const { data, error } = await supabase
    .from('developer_metrics')
    .upsert({
      user_id: userId,
      github_json: githubPayload,
      leetcode_json: leetcodeData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  
  return data;
}

// Map the raw JSON to a clean view model so UI doesn't chain messages
export function mapMetricsToViewModel(metrics) {
  if (!metrics) return null;
  
  const github = metrics.github_json?.raw;
  const leetcode = metrics.leetcode_json;
  
  const githubRepos = github?.public_repos || 0;
  const githubFollowers = github?.followers || 0;
  const leetcodeSolved = leetcode?.totalSolved || 0;
  const trustScore = Math.min(100, githubRepos + githubFollowers * 5 + Math.floor(leetcodeSolved / 5));

  return {
    githubUsername: github?.login || '',
    leetcodeUsername: leetcode?.status === 'success' ? 'linked' : (leetcode?.message === 'success' ? 'linked' : ''),
    githubRepos,
    githubFollowers,
    leetcodeSolved,
    topLanguages: metrics.github_json?.top_languages || [],
    trustScore
  };
}
