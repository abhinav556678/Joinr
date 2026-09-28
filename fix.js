const fs = require('fs');
let data = fs.readFileSync('joinr/src/app/chat/[id].js', 'utf8');
data = data.replace('router.push(`/profile/`);', 'router.push(`/profile/${otherUserId}${matchDetails.project_id ? \'?projectId=\' + matchDetails.project_id : \'\'}`);');
fs.writeFileSync('joinr/src/app/chat/[id].js', data);
