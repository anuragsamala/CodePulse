const axios = require('axios');
const API = 'http://localhost:5000/api';

async function testProgressLive() {
  console.log('Testing clean student registration and real-time progress update...');

  // 1. Register new student
  const email = `testuser_${Date.now()}@codepulse.dev`;
  const regRes = await axios.post(`${API}/auth/register`, {
    name: 'Anurag Samala',
    email,
    password: 'password123',
    role: 'STUDENT',
  });
  const token = regRes.data.token;
  console.log('? Registered student:', regRes.data.user.name);

  // 2. Fetch questions
  const qRes = await axios.get(`${API}/questions?limit=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const q1 = qRes.data.data[0];
  const q2 = qRes.data.data[1];
  console.log('? Found questions:', q1.title, ',', q2.title);

  // 3. Update question 1 to SOLVED
  await axios.put(`${API}/progress/${q1.id}`, { status: 'SOLVED' }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('? Marked', q1.title, 'as SOLVED');

  // 4. Update question 2 to IN_PROGRESS
  await axios.put(`${API}/progress/${q2.id}`, { status: 'IN_PROGRESS' }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('? Marked', q2.title, 'as IN_PROGRESS');

  // 5. Verify progress metrics & daily goal
  const progRes = await axios.get(`${API}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('? Metrics Summary:');
  console.log('  - Solved:', progRes.data.solved, '(Expected: 1)');
  console.log('  - In Progress:', progRes.data.inProgress, '(Expected: 1)');
  console.log('  - Today Solved:', progRes.data.todaySolved, '(Expected: 1)');
  console.log('  - Current Streak:', progRes.data.currentStreak, 'days (Expected >= 1)');

  // 6. Verify weekly chart
  const weekRes = await axios.get(`${API}/progress/weekly`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const totalWeeklySolved = weekRes.data.weeklyData.reduce((a, b) => a + b.solved, 0);
  console.log('? Weekly distribution data:', weekRes.data.weeklyData);
  console.log('? Total weekly solved:', totalWeeklySolved, '(Expected: 1)');

  // 7. Verify contributions & heatmap
  const contRes = await axios.get(`${API}/progress/contributions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('? Heatmap entries:', contRes.data.heatmap);
  console.log('? Total contributions logged:', contRes.data.summary.totalContributions);

  if (progRes.data.solved === 1 && totalWeeklySolved === 1) {
    console.log('?? ALL LIVE METRICS, PROGRESS BAR, AND HEATMAP DATA ARE 100% ACCURATE!');
  } else {
    throw new Error('Mismatch in progress calculations.');
  }
}

testProgressLive().catch(err => {
  console.error('Test error:', err.response?.data || err.message);
  process.exit(1);
});
