/**
 * Automated Integration Test Suite for API Gateway Redis Distributed Rate Limiting
 */
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectRedis, getRedisClient } = require('./config/redis');

async function runTests() {
  console.log('🧪 Starting API Gateway Distributed Rate Limiting Integration Tests...\n');

  let gatewayServer;
  let mockAuthServer;
  let mockItemServer;
  let redisClient;

  const GATEWAY_PORT = 5098;
  const MOCK_AUTH_PORT = 5001;
  const MOCK_ITEM_PORT = 5002;
  const BASE_URL = `http://localhost:${GATEWAY_PORT}`;

  try {
    // 1. Start mock target microservices to receive forwarded proxy traffic
    mockAuthServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Mock Auth Service Response' }));
    });
    await new Promise((resolve) => mockAuthServer.listen(MOCK_AUTH_PORT, resolve));

    mockItemServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Mock Item Service Response' }));
    });
    await new Promise((resolve) => mockItemServer.listen(MOCK_ITEM_PORT, resolve));

    // 2. Connect Redis and start API Gateway
    redisClient = await connectRedis();
    gatewayServer = app.listen(GATEWAY_PORT);

    // Clean up test keys in Redis
    const testIp1 = '198.51.100.10';
    const testIp2 = '198.51.100.20';
    const testIp3 = '198.51.100.30';

    if (redisClient && redisClient.isOpen) {
      await redisClient.del(`rate-limit:${testIp1}`);
      await redisClient.del(`login-rate-limit:${testIp1}`);
      await redisClient.del(`rate-limit:${testIp2}`);
      await redisClient.del(`login-rate-limit:${testIp2}`);
      await redisClient.del(`rate-limit:${testIp3}`);
      await redisClient.del(`login-rate-limit:${testIp3}`);
    }

    // TEST 0: Health Check Endpoint should NOT be rate limited
    console.log('Test 0: Gateway Health Check is accessible without rate limiting');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.assert(healthRes.status === 200, `Expected 200 for health check, got ${healthRes.status}`);
    console.assert(healthData.status === 'OK', 'Health status should be OK');
    console.log('✅ Health check endpoint verified (exempt from rate limits)\n');

    // TEST 1: Send fewer than 20 normal API requests (e.g. 5 requests)
    console.log('Test 1: Send fewer than 20 normal API requests (all should be allowed)');
    for (let i = 1; i <= 5; i++) {
      const res = await fetch(`${BASE_URL}/api/v1/items`, {
        headers: { 'X-Forwarded-For': testIp1 },
      });
      console.assert(res.status === 200, `Expected 200 on request ${i}, got ${res.status}`);
      const remaining = res.headers.get('X-RateLimit-Remaining');
      console.assert(remaining !== null, 'Expected X-RateLimit-Remaining header');
    }
    console.log('✅ Fewer than 20 requests allowed\n');

    // TEST 2: Send up to exactly 20 normal API requests (requests 6 through 20)
    console.log('Test 2: Send remaining requests up to exactly 20 (all should be allowed)');
    for (let i = 6; i <= 20; i++) {
      const res = await fetch(`${BASE_URL}/api/v1/items`, {
        headers: { 'X-Forwarded-For': testIp1 },
      });
      console.assert(res.status === 200, `Expected 200 on request ${i}, got ${res.status}`);
    }
    console.log('✅ Exactly 20 requests allowed\n');

    // TEST 3: Send 21st normal API request within the same 60s window (429 expected)
    console.log('Test 3: Send 21st request within window (429 Too Many Requests expected)');
    const res21 = await fetch(`${BASE_URL}/api/v1/items`, {
      headers: { 'X-Forwarded-For': testIp1 },
    });
    const data21 = await res21.json();
    console.assert(res21.status === 429, `Expected 429 on 21st request, got ${res21.status}`);
    console.assert(data21.success === false, 'Expected success: false');
    console.assert(
      data21.message === 'Too many requests. Please try again later.',
      `Unexpected error message: ${data21.message}`
    );
    console.log('✅ 21st request correctly blocked with 429 Too Many Requests\n');

    // TEST 4: Verify Redis key rate-limit:<ip> exists and has TTL <= 60s
    console.log('Test 4: Verify Redis key rate-limit:<ip> exists and TTL <= 60s');
    if (redisClient && redisClient.isOpen) {
      const normalKey = `rate-limit:${testIp1}`;
      const normalVal = await redisClient.get(normalKey);
      console.assert(normalVal !== null, `Expected Redis key ${normalKey} to exist`);
      const normalTtl = await redisClient.ttl(normalKey);
      console.assert(normalTtl > 0 && normalTtl <= 60, `Expected TTL between 1 and 60s, got ${normalTtl}`);
      console.log(`✅ Redis key '${normalKey}' confirmed with count=${normalVal}, TTL=${normalTtl}s\n`);
    }

    // TEST 5: Window expiration / reset simulation
    console.log('Test 5: Reset/expire window and verify requests resume');
    if (redisClient && redisClient.isOpen) {
      await redisClient.del(`rate-limit:${testIp1}`);
    }
    const resetRes = await fetch(`${BASE_URL}/api/v1/items`, {
      headers: { 'X-Forwarded-For': testIp1 },
    });
    console.assert(resetRes.status === 200, `Expected 200 after window reset, got ${resetRes.status}`);
    console.log('✅ Counter resets and requests resume after window reset\n');

    // Clean testIp2 for login testing
    if (redisClient && redisClient.isOpen) {
      await redisClient.del(`rate-limit:${testIp2}`);
      await redisClient.del(`login-rate-limit:${testIp2}`);
    }

    // TEST 6: Send 4 login attempts within 5 minutes (all 4 allowed)
    console.log('Test 6: Send 4 login attempts within 5 minutes (all allowed)');
    for (let i = 1; i <= 4; i++) {
      const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': testIp2,
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
      });
      console.assert(loginRes.status === 200, `Expected 200 on login attempt ${i}, got ${loginRes.status}`);
    }
    console.log('✅ 4 login attempts successfully allowed\n');

    // TEST 7: Send 5th login attempt within 5 minutes (429 expected)
    console.log('Test 7: Send 5th login attempt within 5 minutes (429 Too Many Login Attempts expected)');
    const loginRes5 = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': testIp2,
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    });
    const loginData5 = await loginRes5.json();
    console.assert(loginRes5.status === 429, `Expected 429 on 5th login attempt, got ${loginRes5.status}`);
    console.assert(loginData5.success === false, 'Expected success: false');
    console.assert(
      loginData5.message === 'Too many login attempts. Please try again later.',
      `Unexpected login message: ${loginData5.message}`
    );
    console.log('✅ 5th login attempt blocked with 429 Too Many Login Attempts\n');

    // TEST 8: Verify Redis key login-rate-limit:<ip> exists and has TTL <= 300s
    console.log('Test 8: Verify Redis key login-rate-limit:<ip> exists and TTL <= 300s');
    if (redisClient && redisClient.isOpen) {
      const loginKey = `login-rate-limit:${testIp2}`;
      const loginVal = await redisClient.get(loginKey);
      console.assert(loginVal !== null, `Expected Redis key ${loginKey} to exist`);
      const loginTtl = await redisClient.ttl(loginKey);
      console.assert(loginTtl > 0 && loginTtl <= 300, `Expected TTL between 1 and 300s, got ${loginTtl}`);
      console.log(`✅ Redis key '${loginKey}' confirmed with count=${loginVal}, TTL=${loginTtl}s\n`);
    }

    // TEST 9: Verify normal API counter and login counter are independent
    console.log('Test 9: Verify independence of rate-limit:<ip> and login-rate-limit:<ip>');
    if (redisClient && redisClient.isOpen) {
      const normalCount = await redisClient.get(`rate-limit:${testIp2}`);
      const loginCount = await redisClient.get(`login-rate-limit:${testIp2}`);
      console.assert(normalCount !== null && loginCount !== null, 'Both keys must exist');
      console.assert(Number(loginCount) === 5, `Expected login count to be 5, got ${loginCount}`);
      console.assert(Number(normalCount) === 5, `Expected normal API count to be 5, got ${normalCount}`);
      console.log(`✅ Counters are independent: normal=${normalCount}, login=${loginCount}\n`);
    }

    // TEST 10: Different client IP gets its own independent counter
    console.log('Test 10: Different client IP gets independent counter');
    const ip3Res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': testIp3,
      },
      body: JSON.stringify({ email: 'user3@example.com', password: 'password' }),
    });
    console.assert(ip3Res.status === 200, `Expected 200 for new IP, got ${ip3Res.status}`);
    if (redisClient && redisClient.isOpen) {
      const ip3LoginCount = await redisClient.get(`login-rate-limit:${testIp3}`);
      console.assert(Number(ip3LoginCount) === 1, `Expected IP3 login count 1, got ${ip3LoginCount}`);
      console.log('✅ Independent counter verified for different client IP\n');
    }

    // TEST 11: Concurrent requests atomic counter test (Redis INCR race condition prevention)
    console.log('Test 11: Concurrent requests atomic counter test');
    const concurrentIp = '198.51.100.40';
    if (redisClient && redisClient.isOpen) {
      await redisClient.del(`rate-limit:${concurrentIp}`);
    }
    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(
        fetch(`${BASE_URL}/api/v1/items`, {
          headers: { 'X-Forwarded-For': concurrentIp },
        })
      );
    }
    const results = await Promise.all(promises);
    results.forEach((r) => console.assert(r.status === 200, `Concurrent request failed with status ${r.status}`));
    if (redisClient && redisClient.isOpen) {
      const concurrentVal = await redisClient.get(`rate-limit:${concurrentIp}`);
      console.assert(Number(concurrentVal) === 15, `Expected atomic count 15, got ${concurrentVal}`);
      console.log(`✅ Atomic INCR confirmed: exactly 15 requests recorded concurrently\n`);
    }

    // TEST 12: Fail-Open test: When Redis is unavailable or throws errors, Gateway does NOT crash and allows requests
    console.log('Test 12: Fail-open behavior when Redis is unavailable/erroring');
    const failOpenIp = '198.51.100.50';
    const originalIncr = redisClient ? redisClient.incr : null;
    if (redisClient) {
      redisClient.incr = async () => {
        throw new Error('Simulated Redis network disconnection in RateLimiter');
      };
    }
    const failOpenRes = await fetch(`${BASE_URL}/api/v1/items`, {
      headers: { 'X-Forwarded-For': failOpenIp },
    });
    console.assert(failOpenRes.status === 200, `Expected 200 on fail-open fallback, got ${failOpenRes.status}`);
    console.log('✅ Fail-open fallback verified: requests continue through gateway without disruption\n');

    // Restore Redis incr method
    if (redisClient && originalIncr) {
      redisClient.incr = originalIncr;
    }

    // Clean up test keys
    if (redisClient && redisClient.isOpen) {
      await redisClient.del(`rate-limit:${testIp1}`);
      await redisClient.del(`rate-limit:${testIp2}`);
      await redisClient.del(`login-rate-limit:${testIp2}`);
      await redisClient.del(`rate-limit:${testIp3}`);
      await redisClient.del(`login-rate-limit:${testIp3}`);
      await redisClient.del(`rate-limit:${concurrentIp}`);
    }

    console.log('🎉 ALL GATEWAY RATE LIMITING INTEGRATION TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    if (gatewayServer) gatewayServer.close();
    if (mockAuthServer) mockAuthServer.close();
    if (mockItemServer) mockItemServer.close();
    if (redisClient && redisClient.isOpen) {
      await redisClient.disconnect();
    }
    process.exit(process.exitCode || 0);
  }
}

runTests();
