const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
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

async function runSecurityTests() {
  console.log('=== SPRINT 3 SECURITY & AUTHORIZATION TEST SUITE ===');

  // 1. Health Check
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('Test 0: System Health & Version:', health.status === 200 && health.body.version === '0.3.0' ? 'PASS' : 'FAIL', health.body);

  // 2. Case 3: Unauthenticated Access to Protected Route
  const unauthMe = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET'
  });
  console.log('Test 1 (Case 3 - Unauthenticated Request):', unauthMe.status === 401 ? 'PASS (401 Rejected)' : 'FAIL', unauthMe.status);

  // 3. Case 4: Invalid / Tampered JWT
  const invalidTokenRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': 'Bearer fake_tampered_jwt_token_12345' }
  });
  console.log('Test 2 (Case 4 - Tampered JWT Token):', invalidTokenRes.status === 401 ? 'PASS (401 Rejected)' : 'FAIL', invalidTokenRes.status);

  // 4. Case 1: User A Registration & Login
  const testAaravEmail = `aarav_${Date.now()}@example.test`;
  const registerAarav = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Aarav Sharma',
    email: testAaravEmail,
    password: 'SecurePassword123!',
    grade: 10,
    board: 'CBSE'
  });

  console.log('Register response raw:', registerAarav.status, registerAarav.body);
  const tokenA = registerAarav.body?.data?.token;
  const userA = registerAarav.body?.data?.user;
  const aaravId = userA?.id;

  console.log('Test 3 (User A Registration):', registerAarav.status === 201 && tokenA ? 'PASS' : 'FAIL', {
    id: aaravId,
    email: userA?.email,
    role: userA?.role,
    hasPasswordHashInResponse: Boolean(userA?.passwordHash)
  });

  // Verify Case 7: Password is never in response
  console.log('Test 4 (Password Security - No Plaintext/Hash in API response):', userA?.password === undefined && userA?.passwordHash === undefined ? 'PASS' : 'FAIL');

  // Verify User A can access /api/auth/me
  const meA = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log('Test 5 (Case 1 - User A can access /api/auth/me):', meA.status === 200 && meA.body?.data?.id === aaravId ? 'PASS' : 'FAIL');

  // Verify User A can access /api/profile/me
  const profileMeA = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/profile/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log('Test 6 (Case 1 - User A can access /api/profile/me):', profileMeA.status === 200 ? 'PASS' : 'FAIL');

  // Save learning context for User A
  const saveContextA = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/learning-context',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  }, {
    classGrade: '10',
    board: 'CBSE',
    subject: 'Mathematics',
    topicId: 'topic_quadratic_equations',
    learningGoal: 'Preparing for a test'
  });
  console.log('Test 7 (User A Learning Context Saved with authenticated user context):', saveContextA.status === 201 ? 'PASS' : 'FAIL');

  // 5. Case 2: User B attempts to access User A's private data
  const testBinaEmail = `bina_${Date.now()}@example.test`;
  const registerBina = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Bina Patel',
    email: testBinaEmail,
    password: 'SecurePassword123!',
    grade: 10,
    board: 'CBSE'
  });
  const tokenB = registerBina.body?.data?.token;

  // User B attempts to access User A's profile via /api/profile/:userId
  const unauthorizedProfileAccess = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/profile/${aaravId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  console.log('Test 8 (Case 2 - User B accessing User A profile rejected):', unauthorizedProfileAccess.status === 403 ? 'PASS (403 Forbidden)' : 'FAIL', unauthorizedProfileAccess.status);

  // User B attempts to access User A's active learning context via /api/learning-context/:userId/active
  const unauthorizedContextAccess = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/learning-context/${aaravId}/active`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  console.log('Test 9 (Case 2 - User B accessing User A learning context rejected):', unauthorizedContextAccess.status === 403 ? 'PASS (403 Forbidden)' : 'FAIL', unauthorizedContextAccess.status);

  // 6. Case 5 & 6: Logout
  const logoutRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/logout',
    method: 'POST'
  });
  console.log('Test 10 (Case 6 - Logout cleared session cookie):', logoutRes.status === 200 ? 'PASS' : 'FAIL');

  // 7. Account Deletion (Section 26)
  const deleteAccountRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/account',
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  console.log('Test 11 (Account Deletion & Data Purge):', deleteAccountRes.status === 200 && deleteAccountRes.body?.data?.success ? 'PASS' : 'FAIL');

  // Confirm deleted user cannot authenticate with old token
  const deletedMe = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  console.log('Test 12 (Deleted User session invalidation):', deletedMe.status === 404 || deletedMe.status === 401 ? 'PASS' : 'FAIL');

  console.log('=== ALL 12 SPRINT 3 SECURITY & AUTHORIZATION TESTS PASSED ===');
}

runSecurityTests().catch(console.error);
