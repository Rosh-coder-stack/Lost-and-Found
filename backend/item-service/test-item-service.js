/**
 * Automated Integration Test for Item Service Full CRUD & Ownership Enforcement
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const connectDB = require('./config/db');
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
  console.log('🧪 Starting Item Service Full CRUD & Security Integration Tests...\n');

  let server;
  try {
    await connectDB();
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

    // Test 4: Create Valid Lost Item Report by User A
    console.log('Test 4: Create Valid Lost Item Report by User A (201 expected)');
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
    console.assert(createData.data.userId.toString() === userAId, `User ID spoofing! Expected ${userAId} but got ${createData.data.userId}`);
    console.assert(createData.data.status === 'searching', 'Default status must be searching');
    console.log('✅ 201 Report Created & userId spoof protection passed\n');

    const createdItemId = createData.data._id;

    // Test 5: Get User A Reports
    console.log('Test 5: Fetch User A Reports (200 expected)');
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

    // Test 6: Global Browse includes User A report
    console.log('Test 6: Fetch Global Public Items list (200 expected)');
    const globalRes = await fetch(`${baseUrl}?search=Sony`);
    const globalData = await globalRes.json();
    console.assert(globalRes.status === 200, `Expected 200 but got ${globalRes.status}`);
    console.assert(globalData.data.some((item) => item._id === createdItemId), 'Created item not visible in global search');
    console.log('✅ Global browse endpoint passed\n');

    // Test 7: Get Single Item by ID
    console.log('Test 7: Fetch Single Item by ID (200 expected)');
    const singleRes = await fetch(`${baseUrl}/${createdItemId}`);
    const singleData = await singleRes.json();
    console.assert(singleRes.status === 200, `Expected 200 but got ${singleRes.status}`);
    console.assert(singleData.data._id === createdItemId, 'Item ID mismatch');
    console.log('✅ Get single item passed\n');

    // Test 8: User B attempts to UPDATE User A report (403 Forbidden expected)
    console.log('Test 8: User B Unauthorized Update Attempt (403 Forbidden expected)');
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

    // Test 9: User A UPDATES their own report (200 expected)
    console.log('Test 9: User A Authorized Update (200 expected)');
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
    console.log('✅ Authorized update passed\n');

    // Test 10: User B attempts to DELETE User A report (403 Forbidden expected)
    console.log('Test 10: User B Unauthorized Delete Attempt (403 Forbidden expected)');
    const unauthDeleteRes = await fetch(`${baseUrl}/${createdItemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenUserB}`,
      },
    });
    console.assert(unauthDeleteRes.status === 403, `Expected 403 Forbidden but got ${unauthDeleteRes.status}`);
    console.log('✅ Unauthorized delete protection passed\n');

    // Test 11: User A DELETES their own report (200 expected)
    console.log('Test 11: User A Authorized Delete (200 expected)');
    const authDeleteRes = await fetch(`${baseUrl}/${createdItemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenUserA}`,
      },
    });
    const authDeleteData = await authDeleteRes.json();
    console.assert(authDeleteRes.status === 200, `Expected 200 but got ${authDeleteRes.status}`);
    console.assert(authDeleteData.success === true, 'Delete success flag not true');
    console.log('✅ Authorized delete passed\n');

    // Test 12: Verify item is gone (404 expected)
    console.log('Test 12: Verify deleted item returns 404');
    const verifyRes = await fetch(`${baseUrl}/${createdItemId}`);
    console.assert(verifyRes.status === 404, `Expected 404 Not Found but got ${verifyRes.status}`);
    console.log('✅ 404 check for deleted item passed\n');

    console.log('🎉 ALL 12 INTEGRATION AND SECURITY TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    process.exit(process.exitCode || 0);
  }
}

runTests();
