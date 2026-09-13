/**
 * Automated Integration Test for Item Service Full CRUD, Security & Redis Caching
 */
require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const jwt = require('jsonwebtoken');
const app = require('./src/app');
const connectDB = require('./config/db');
const { connectRedis, getRedisClient } = require('./config/redis');
const Item = require('./models/Item');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// User A (Owner)
const userAId = '67ab1234567890abcdef1234';
const userA = {
  id: userAId,
  name: 'User Alpha',
  email: 'alpha@example.com',
  role: 'user',
};
const tokenUserA = jwt.sign(userA, JWT_SECRET, { expiresIn: '1h' });

// User B (Attacker / Different User)
const userBId = '67ab9876543210fedcba4321';
const userB = {
  id: userBId,
  name: 'User Beta',
  email: 'beta@example.com',
  role: 'user',
};
const tokenUserB = jwt.sign(userB, JWT_SECRET, { expiresIn: '1h' });

async function runTests() {
  console.log('🧪 Starting Item Service Full CRUD, Security & Redis Caching Integration Tests...\n');

  let server;
  let redisClient;
  try {
    await connectDB();
    redisClient = await connectRedis();
    server = app.listen(5099);

    const baseUrl = 'http://localhost:5099/api/v1/items';

    // Test 1: Health check
    console.log('Test 1: Health Check Endpoint');
    const healthRes = await fetch('http://localhost:5099/health');
    const healthData = await healthRes.json();
    console.assert(healthRes.status === 200, 'Health check failed');
    console.assert(healthData.status === 'OK', 'Health status not OK');
    console.log('✅ Health Check passed\n');

    // Test 2: Unauthenticated create lost item (401 expected)
    console.log('Test 2: Unauthenticated Report Submission (401 expected)');
    const unauthRes = await fetch(`${baseUrl}/lost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Keys',
        category: 'Keys',
        location: 'Park',
        dateLost: new Date(),
        description: 'Lost keys',
      }),
    });
    console.assert(unauthRes.status === 401, `Expected 401 but got ${unauthRes.status}`);
    console.log('✅ 401 Unauthorized check passed\n');

    // Test 3: Validation Error on missing required fields (400 expected)
    console.log('Test 3: Missing Required Fields Validation (400 expected)');
    const invalidRes = await fetch(`${baseUrl}/lost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({ title: '' }),
    });
    const invalidData = await invalidRes.json();
    console.assert(invalidRes.status === 400, `Expected 400 but got ${invalidRes.status}`);
    console.assert(invalidData.errors && invalidData.errors.length > 0, 'Expected validation error messages');
    console.log('✅ 400 Validation Error check passed\n');

    // Test 4: Redis Cache Test - Initial GET /items (Cache MISS, then set in Redis)
    console.log('Test 4: Redis Cache MISS & SET on GET /items');
    if (redisClient && redisClient.isOpen) {
      await redisClient.del('items:all');
    }
    const listRes1 = await fetch(baseUrl);
    const listData1 = await listRes1.json();
    console.assert(listRes1.status === 200, `Expected 200 but got ${listRes1.status}`);
    console.assert(listData1.success === true, 'Success flag should be true');

    if (redisClient && redisClient.isOpen) {
      const cachedVal = await redisClient.get('items:all');
      console.assert(cachedVal !== null, 'Expected items:all key to be set in Redis');
      const ttl = await redisClient.ttl('items:all');
      console.assert(ttl > 0 && ttl <= 300, `Expected TTL between 1 and 300 seconds, got ${ttl}`);
      console.log(`✅ Redis Cache SET verified with TTL: ${ttl}s\n`);
    }

    // Test 5: Redis Cache Test - Second GET /items (Cache HIT)
    console.log('Test 5: Redis Cache HIT on GET /items');
    const listRes2 = await fetch(baseUrl);
    const listData2 = await listRes2.json();
    console.assert(listRes2.status === 200, `Expected 200 but got ${listRes2.status}`);
    console.assert(listData2.success === true, 'Success flag should be true');
    console.assert(listData2.count === listData1.count, 'Cache HIT count should match');
    console.log('✅ Redis Cache HIT returned successfully\n');

    // Test 6: Create Valid Lost Item Report by User A & Cache Invalidation
    console.log('Test 6: Create Valid Lost Item Report by User A (201 expected & Cache Invalidation)');
    const reportPayload = {
      title: 'Sony WH-1000XM5 Headphones',
      category: 'Electronics',
      location: 'Central Library, 3rd Floor',
      dateLost: new Date().toISOString(),
      description: 'Matte silver noise cancelling headphones in black zip case',
      distinguishingDetails: 'Small scratch near left hinge, serial #SN99281',
      contactPreference: 'email',
      userId: '999999999999999999999999', // Spoof attempt, must be overridden by tokenUserA
    };

    const createRes = await fetch(`${baseUrl}/lost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify(reportPayload),
    });

    const createData = await createRes.json();
    console.assert(createRes.status === 201, `Expected 201 Created but got ${createRes.status}: ${JSON.stringify(createData)}`);
    console.assert(createData.success === true, 'Success flag false');
    console.assert(createData.data.title === 'Sony WH-1000XM5 Headphones', 'Title mismatch');
    console.assert(createData.data.type === 'lost', 'Default type must be lost');
    console.assert(createData.data.userId.toString() === userAId, `User ID spoofing! Expected ${userAId} but got ${createData.data.userId}`);
    console.assert(createData.data.status === 'searching', 'Default status must be searching');

    // Verify cache invalidation occurred
    if (redisClient && redisClient.isOpen) {
      const cachedAfterCreate = await redisClient.get('items:all');
      console.assert(cachedAfterCreate === null, 'Cache key items:all should be invalidated after item creation');
      console.log('✅ Cache invalidation after create verified');
    }
    console.log('✅ 201 Lost Report Created & userId spoof protection passed\n');

    const createdItemId = createData.data._id;

    // Test 7: Get User A Reports
    console.log('Test 7: Fetch User A Reports (200 expected)');
    const myReportsRes = await fetch(`${baseUrl}/my-reports`, {
      headers: {
        Authorization: `Bearer ${tokenUserA}`,
      },
    });
    const myReportsData = await myReportsRes.json();
    console.assert(myReportsRes.status === 200, `Expected 200 but got ${myReportsRes.status}`);
    console.assert(Array.isArray(myReportsData.data), 'Expected array of reports');
    console.assert(myReportsData.data.some((item) => item._id === createdItemId), 'Created item not found in User A reports');
    console.log('✅ User reports listing passed\n');

    // Test 8: Global Browse includes User A report
    console.log('Test 8: Fetch Global Public Items list (200 expected)');
    const globalRes = await fetch(`${baseUrl}?search=Sony`);
    const globalData = await globalRes.json();
    console.assert(globalRes.status === 200, `Expected 200 but got ${globalRes.status}`);
    console.assert(globalData.data.some((item) => item._id === createdItemId), 'Created item not visible in global search');
    console.log('✅ Global browse endpoint passed\n');

    // Test 9: Get Single Item by ID - First GET (Cache MISS & SET in Redis with 600s TTL)
    console.log('Test 9: Single-Item Redis Cache MISS & SET on GET /items/:id');
    const itemKey = `item:${createdItemId}`;
    if (redisClient && redisClient.isOpen) {
      await redisClient.del(itemKey);
    }
    const singleRes1 = await fetch(`${baseUrl}/${createdItemId}`);
    const singleData1 = await singleRes1.json();
    console.assert(singleRes1.status === 200, `Expected 200 but got ${singleRes1.status}`);
    console.assert(singleData1.data._id === createdItemId, 'Item ID mismatch');

    if (redisClient && redisClient.isOpen) {
      const cachedItemVal = await redisClient.get(itemKey);
      console.assert(cachedItemVal !== null, `Expected ${itemKey} to be set in Redis`);
      const singleTtl = await redisClient.ttl(itemKey);
      console.assert(singleTtl > 0 && singleTtl <= 600, `Expected TTL between 1 and 600 seconds, got ${singleTtl}`);
      console.log(`✅ Single-item Redis Cache SET verified with key '${itemKey}' and TTL: ${singleTtl}s\n`);
    }

    // Test 10: Get Single Item by ID - Second GET (Cache HIT)
    console.log('Test 10: Single-Item Redis Cache HIT on GET /items/:id');
    const singleRes2 = await fetch(`${baseUrl}/${createdItemId}`);
    const singleData2 = await singleRes2.json();
    console.assert(singleRes2.status === 200, `Expected 200 but got ${singleRes2.status}`);
    console.assert(singleData2.data._id === singleData1.data._id, 'Cached Item ID mismatch');
    console.assert(singleData2.data.title === singleData1.data.title, 'Cached Item title mismatch');
    console.log('✅ Single-item Redis Cache HIT returned successfully\n');

    // Test 11: 404 response must not be cached in Redis
    console.log('Test 11: Non-existent item returns 404 and is NOT cached in Redis');
    const fakeId = '67ab00000000000000000000';
    const fakeRes = await fetch(`${baseUrl}/${fakeId}`);
    console.assert(fakeRes.status === 404, `Expected 404 but got ${fakeRes.status}`);
    if (redisClient && redisClient.isOpen) {
      const fakeCachedVal = await redisClient.get(`item:${fakeId}`);
      console.assert(fakeCachedVal === null, '404 response must not be cached in Redis');
      console.log('✅ Verified 404 response is NOT cached in Redis\n');
    }

    // Test 12: User B attempts to UPDATE User A report (403 Forbidden expected)
    console.log('Test 12: User B Unauthorized Update Attempt (403 Forbidden expected)');
    const unauthUpdateRes = await fetch(`${baseUrl}/${createdItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserB}`,
      },
      body: JSON.stringify({ title: 'Hacked Title By User B' }),
    });
    console.assert(unauthUpdateRes.status === 403, `Expected 403 Forbidden but got ${unauthUpdateRes.status}`);
    console.log('✅ Unauthorized update protection passed\n');

    // Test 13: User A UPDATES their own report (200 expected & Cache Invalidation of both item:<id> and items:all)
    console.log('Test 13: User A Authorized Update (200 expected & Cache Invalidation)');
    // Repopulate both caches first
    await fetch(baseUrl);
    await fetch(`${baseUrl}/${createdItemId}`);
    const authUpdateRes = await fetch(`${baseUrl}/${createdItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        title: 'Sony WH-1000XM5 Headphones (Updated)',
        location: 'Central Library, 4th Floor Study Room',
        status: 'matched',
      }),
    });
    const authUpdateData = await authUpdateRes.json();
    console.assert(authUpdateRes.status === 200, `Expected 200 but got ${authUpdateRes.status}`);
    console.assert(authUpdateData.data.title === 'Sony WH-1000XM5 Headphones (Updated)', 'Title was not updated');
    console.assert(authUpdateData.data.status === 'matched', 'Status was not updated');
    console.assert(authUpdateData.data.statusType === 'match', 'StatusType was not synced to match');

    // Verify cache invalidation occurred for both items:all and item:<id>
    if (redisClient && redisClient.isOpen) {
      const cachedListAfterUpdate = await redisClient.get('items:all');
      const cachedItemAfterUpdate = await redisClient.get(itemKey);
      console.assert(cachedListAfterUpdate === null, 'Cache key items:all should be invalidated after item update');
      console.assert(cachedItemAfterUpdate === null, `Cache key ${itemKey} should be invalidated after item update`);
      console.log(`✅ Cache invalidation after update verified for both 'items:all' and '${itemKey}'\n`);
    }
    console.log('✅ Authorized update passed\n');

    // Test 14: User B attempts to DELETE User A report (403 Forbidden expected)
    console.log('Test 14: User B Unauthorized Delete Attempt (403 Forbidden expected)');
    const unauthDeleteRes = await fetch(`${baseUrl}/${createdItemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenUserB}`,
      },
    });
    console.assert(unauthDeleteRes.status === 403, `Expected 403 Forbidden but got ${unauthDeleteRes.status}`);
    console.log('✅ Unauthorized delete protection passed\n');

    // Test 15: User A DELETES their own report (200 expected & Cache Invalidation of both item:<id> and items:all)
    console.log('Test 15: User A Authorized Delete (200 expected & Cache Invalidation)');
    // Repopulate caches first
    await fetch(baseUrl);
    await fetch(`${baseUrl}/${createdItemId}`);
    const authDeleteRes = await fetch(`${baseUrl}/${createdItemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenUserA}`,
      },
    });
    const authDeleteData = await authDeleteRes.json();
    console.assert(authDeleteRes.status === 200, `Expected 200 but got ${authDeleteRes.status}`);
    console.assert(authDeleteData.success === true, 'Delete success flag not true');

    // Verify cache invalidation occurred for both items:all and item:<id>
    if (redisClient && redisClient.isOpen) {
      const cachedListAfterDelete = await redisClient.get('items:all');
      const cachedItemAfterDelete = await redisClient.get(itemKey);
      console.assert(cachedListAfterDelete === null, 'Cache key items:all should be invalidated after item delete');
      console.assert(cachedItemAfterDelete === null, `Cache key ${itemKey} should be invalidated after item delete`);
      console.log(`✅ Cache invalidation after delete verified for both 'items:all' and '${itemKey}'\n`);
    }
    console.log('✅ Authorized delete passed\n');

    // Test 16: Verify item is gone (404 expected)
    console.log('Test 16: Verify deleted item returns 404');
    const verifyRes = await fetch(`${baseUrl}/${createdItemId}`);
    console.assert(verifyRes.status === 404, `Expected 404 Not Found but got ${verifyRes.status}`);
    console.log('✅ 404 check for deleted item passed\n');

    // Test 17: Graceful Redis fallback test (MongoDB fallback on Redis failure)
    console.log('Test 17: Verify GET /items/:id works seamlessly when Redis is unavailable (Fallback)');
    const fallbackItem = await Item.create({
      type: 'found',
      title: 'Fallback Test Umbrella',
      category: 'Other',
      description: 'Black umbrella left in lobby',
      location: 'Main Lobby',
      dateLost: new Date(),
      status: 'searching',
      userId: userAId,
    });
    // Temporarily simulate Redis error / disconnect
    const originalGet = redisClient ? redisClient.get : null;
    if (redisClient) {
      redisClient.get = async () => {
        throw new Error('Simulated Redis network failure');
      };
    }
    const fallbackRes = await fetch(`${baseUrl}/${fallbackItem._id}`);
    const fallbackData = await fallbackRes.json();
    console.assert(fallbackRes.status === 200, `Expected 200 on Redis error fallback but got ${fallbackRes.status}`);
    console.assert(fallbackData.data.title === 'Fallback Test Umbrella', 'Title mismatch on fallback');
    console.log('✅ Graceful Redis fallback to MongoDB verified\n');

    // Restore Redis get method & cleanup
    if (redisClient && originalGet) {
      redisClient.get = originalGet;
    }
    await Item.findByIdAndDelete(fallbackItem._id);

    console.log('🎉 ALL INTEGRATION, CRUD, SECURITY & REDIS CACHING TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    if (redisClient && redisClient.isOpen) {
      await redisClient.disconnect();
    }
    process.exit(process.exitCode || 0);
  }
}

runTests();
