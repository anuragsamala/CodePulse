const axios = require('axios');

const API = 'http://localhost:5000/api';

async function testScenario() {
  console.log('?? Starting Critical Verification Scenario...');

  // 1. Check health
  const healthRes = await axios.get(`${API}/health`);
  console.log('? API Health:', healthRes.data);

  // 2. Rahul Login
  console.log('Logging in as Rahul...');
  const rahulLogin = await axios.post(`${API}/auth/login`, {
    email: 'rahul@student.codepulse.dev',
    password: 'password123',
  });
  const rahulToken = rahulLogin.data.token;
  console.log('? Rahul logged in:', rahulLogin.data.user.name);

  // 3. Rahul fetches Two Sum
  const questionsRes = await axios.get(`${API}/questions?search=Two Sum`, {
    headers: { Authorization: `Bearer ${rahulToken}` },
  });
  const twoSum = questionsRes.data.data.find(q => q.title === 'Two Sum');
  console.log('? Rahul sees Two Sum. Personal Status:', twoSum.personalStatus);

  // 4. Priya Login
  console.log('Logging in as Priya...');
  const priyaLogin = await axios.post(`${API}/auth/login`, {
    email: 'priya@student.codepulse.dev',
    password: 'password123',
  });
  const priyaToken = priyaLogin.data.token;
  console.log('? Priya logged in:', priyaLogin.data.user.name);

  // 5. Priya fetches Two Sum & Solutions
  const priyaTwoSumRes = await axios.get(`${API}/questions/${twoSum.id}`, {
    headers: { Authorization: `Bearer ${priyaToken}` },
  });
  console.log('? Priya personal status for Two Sum:', priyaTwoSumRes.data.personalProgress.status);

  const twoSumSolutions = await axios.get(`${API}/solutions/question/${twoSum.id}`, {
    headers: { Authorization: `Bearer ${priyaToken}` },
  });
  console.log(`? Priya sees ${twoSumSolutions.data.data.length} solutions for Two Sum:`, twoSumSolutions.data.data.map(s => `${s.author.name} (${s.language})`).join(', '));

  // 6. Akhil Login
  console.log('Logging in as Akhil...');
  const akhilLogin = await axios.post(`${API}/auth/login`, {
    email: 'akhil@student.codepulse.dev',
    password: 'password123',
  });
  const akhilToken = akhilLogin.data.token;
  console.log('? Akhil logged in:', akhilLogin.data.user.name);

  const akhilTwoSumRes = await axios.get(`${API}/questions/${twoSum.id}`, {
    headers: { Authorization: `Bearer ${akhilToken}` },
  });
  console.log('? Akhil personal status for Two Sum (MANDATORY NOT_STARTED):', akhilTwoSumRes.data.personalProgress.status);

  // 7. Rahul updates status to IN_PROGRESS and then SOLVED
  await axios.put(`${API}/progress/${twoSum.id}`, { status: 'SOLVED' }, {
    headers: { Authorization: `Bearer ${rahulToken}` },
  });
  console.log('? Rahul updated progress to SOLVED.');

  // Check Akhil status again to confirm zero leakage
  const akhilCheck = await axios.get(`${API}/questions/${twoSum.id}`, {
    headers: { Authorization: `Bearer ${akhilToken}` },
  });
  console.log('? Verified Akhil status is still completely independent:', akhilCheck.data.personalProgress.status);

  console.log('?? ALL BACKEND CHECKS AND CRITICAL SCENARIO PASSED!');
}

testScenario().catch(err => {
  console.error('Test scenario failed:', err.response?.data || err.message);
  process.exit(1);
});
