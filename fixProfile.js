const fs = require('fs');
let data = fs.readFileSync('joinr/src/app/profile/[id].js', 'utf8');

const targetImports = `import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchUserProfile } from '../../lib/usersApi';
import AppText from '../../components/AppText';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/useAuthStore';`;

data = data.replace(/import \{ useLocalSearchParams, useRouter \} from 'expo-router';[\s\S]*import AppText from '..\/..\/components\/AppText';/, targetImports);

const targetState = `  const { id, projectId } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchScore, setMatchScore] = useState(null);`;

data = data.replace(/  const \{ id \} = useLocalSearchParams\(\);[\s\S]*const \[error, setError\] = useState\(null\);/, targetState);

const targetEffect = `  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchUserProfile(id);
        setProfile(data);

        // If opened from a project chat context
        if (projectId && currentUser) {
          // Fetch project to see required skills and check if current user is recruiter
          const { data: project } = await supabase
            .from('projects')
            .select(\`
              skills_required,
              project_members(user_id, role)
            \`)
            .eq('id', projectId)
            .single();

          if (project) {
            const isRecruiter = project.project_members?.some(pm => pm.user_id === currentUser.id && pm.role === 'Creator');
            
            if (isRecruiter) {
              // Calculate match score
              const requiredSkills = project.skills_required || [];
              const applicantSkills = data.skills || [];
              
              if (requiredSkills.length > 0) {
                const matchCount = requiredSkills.filter(s => applicantSkills.map(as => as.toLowerCase()).includes(s.toLowerCase())).length;
                const score = Math.round((matchCount / requiredSkills.length) * 100);
                setMatchScore(score);
              } else {
                setMatchScore(100);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, projectId, currentUser]);`;

data = data.replace(/  useEffect\(\(\) => \{[\s\S]*?\}, \[id\]\);/, targetEffect);

const targetMatchScoreRender = `
      {matchScore !== null && (
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Skill Match Score</AppText>
          <View style={styles.matchScoreBadge}>
            <AppText style={styles.matchScoreText}>{matchScore}% Match</AppText>
          </View>
        </View>
      )}
`;

data = data.replace('      <View style={styles.section}>\n        <AppText style={styles.sectionTitle}>Trust Score</AppText>', targetMatchScoreRender + '\n      <View style={styles.section}>\n        <AppText style={styles.sectionTitle}>Trust Score</AppText>');

fs.writeFileSync('joinr/src/app/profile/[id].js', data);
