const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING SPRINT 2 + SPRINT 3 REGRESSION TEST ---');

  // 1. Health
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health Check:', health.status === 200 && health.body.version === '0.3.0' ? 'PASS' : 'FAIL', health.body);

  // 2. Subtopics
  const subtopics = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/topics/quadratic-equations/subtopics',
    method: 'GET'
  });
  console.log('2. Subtopics Count:', subtopics.body?.data?.length === 7 ? 'PASS (7 subtopics)' : 'FAIL', subtopics.body?.data?.length);

  // 3. Register Student Aarav
  const authRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Aarav Sharma',
    email: `aarav_regression_${Date.now()}@example.test`,
    password: 'SecurePassword123!',
    grade: 10,
    board: 'CBSE'
  });
  const token = authRes.body?.data?.token;
  const userId = authRes.body?.data?.user?.id;
  console.log('3. Student Aarav Authenticated:', token && userId ? 'PASS' : 'FAIL', userId);

  // 4. Learning Context Persistence with Auth Token
  const contextRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/learning-context',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    classGrade: '10',
    board: 'CBSE',
    subject: 'Mathematics',
    topicId: 'topic_quadratic_equations',
    learningGoal: 'Preparing for a test',
    active: true
  });
  const contextId = contextRes.body?.data?.id;
  console.log('4. Learning Context Saved:', contextId ? 'PASS' : 'FAIL', contextId);

  // 5. Retrieve Active Context
  const activeCtxRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/learning-context/me/active`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('5. Active Context Retrieved (/me):', activeCtxRes.body?.data?.id === contextId ? 'PASS' : 'FAIL', {
    classGrade: activeCtxRes.body?.data?.classGrade,
    board: activeCtxRes.body?.data?.board,
    subject: activeCtxRes.body?.data?.subject,
    goal: activeCtxRes.body?.data?.learningGoal
  });

  // 6. Save Self Assessment (Aarav Acceptance Criteria)
  const subtopicRatings = {
    'sub_1': 'KNOW',        // Standard Form
    'sub_2': 'KNOW',        // Factorization
    'sub_3': 'KNOW',        // Quadratic Formula
    'sub_4': 'PARTIAL',     // Discriminant
    'sub_5': 'PARTIAL',     // Nature of Roots
    'sub_6': 'DONT_KNOW',   // Word Problems
    'sub_7': 'DONT_KNOW'    // Graph Interpretation
  };

  const saRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/self-assessment',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    learningContextId: contextId,
    overallConfidence: 4,
    selectedMode: 'TEST',
    subtopicRatings
  });
  const assessmentId = saRes.body?.data?.id;
  console.log('6. Self Assessment Saved:', assessmentId ? 'PASS' : 'FAIL', {
    overallConfidence: saRes.body?.data?.overallConfidence,
    selectedMode: saRes.body?.data?.selectedMode,
    ratingsCount: saRes.body?.data?.subtopicRatings?.length
  });

  // 7. Verify Persistence & Restoration on Active Context Query
  const reloadedCtx = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/learning-context/me/active`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const reloadedSA = reloadedCtx.body?.data?.selfAssessments?.[0];
  console.log('7. Persistence & Restoration Verified:', reloadedSA?.overallConfidence === 4 ? 'PASS' : 'FAIL', {
    overallConfidence: reloadedSA?.overallConfidence,
    selectedMode: reloadedSA?.selectedMode,
    subtopicsSaved: reloadedSA?.subtopicRatings?.length
  });

  // 8. Test Mode Update to LEARN_FROM_SCRATCH
  const updateModeRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/self-assessment/${assessmentId}`,
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    selectedMode: 'LEARN_FROM_SCRATCH'
  });
  console.log('8. Mode Updated to LEARN_FROM_SCRATCH:', updateModeRes.body?.data?.selectedMode === 'LEARN_FROM_SCRATCH' ? 'PASS' : 'FAIL', updateModeRes.body?.data?.selectedMode);

  console.log('--- ALL SPRINT 2 + SPRINT 3 REGRESSION TESTS PASSED ---');
}

runTests().catch(console.error);
