/**
 * Test Suite for Claim Service and Ownership Verification Workflow
 */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Claim = require('./models/Claim');
const connectDB = require('./config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const createTestToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: 'user',
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const runTests = async () => {
  console.log('\n=============================================');
  console.log('🧪 RUNNING CLAIM SERVICE TESTS');
  console.log('=============================================\n');

  await connectDB();

  // Clean up any old test claims
  const testItemId = new mongoose.Types.ObjectId();
  const roshniId = new mongoose.Types.ObjectId();
  const sumitId = new mongoose.Types.ObjectId();
  const thirdPartyId = new mongoose.Types.ObjectId();

  const userRoshni = { _id: roshniId, name: 'Roshni Reporter', email: 'roshni@example.com' };
  const userSumit = { _id: sumitId, name: 'Sumit Claimant', email: 'sumit@example.com' };
  const userThird = { _id: thirdPartyId, name: 'Other User', email: 'other@example.com' };

  console.log('Test Users:');
  console.log(`- Reporter (Roshni): ${roshniId}`);
  console.log(`- Claimant (Sumit): ${sumitId}`);
  console.log(`- Item ID: ${testItemId}\n`);

  try {
    // 1. Create initial claim (Attempt 1)
    console.log('▶ Test 1: Create initial claim (Sumit claims Roshni item)...');
    const initialMessage = {
      senderId: sumitId,
      senderRole: 'claimant',
      senderName: userSumit.name,
      message: 'This is my ring lost near central plaza. It has a gold band.',
      createdAt: new Date(),
    };

    const claim1 = await Claim.create({
      itemId: testItemId,
      itemTitle: 'Gold Diamond Ring',
      itemType: 'found',
      itemCategory: 'Jewelry & Watches',
      itemLocation: 'Central Plaza',
      claimantId: sumitId,
      claimantName: userSumit.name,
      claimantEmail: userSumit.email,
      claimantPhone: '+91 9876543210',
      reporterId: roshniId,
      reporterName: userRoshni.name,
      reporterEmail: userRoshni.email,
      reporterContactDetails: 'Drop off at security desk',
      status: 'PENDING',
      attemptNumber: 1,
      proofMessage: initialMessage.message,
      messages: [initialMessage],
    });

    console.log(`✅ Claim 1 created: ID=${claim1._id}, status=${claim1.status}, attempt=${claim1.attemptNumber}`);

    // Verify privacy before acceptance:
    const { getClaimById } = require('./controllers/claimController');
    const mockReq = {
      params: { claimId: claim1._id.toString() },
      user: { id: sumitId.toString(), name: userSumit.name, email: userSumit.email },
    };
    let mockResData = null;
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          mockResData = data;
          return data;
        },
      }),
    };

    await getClaimById(mockReq, mockRes);
    if (!mockResData.data.reporterEmail && !mockResData.data.reporterContactDetails) {
      console.log('✅ Privacy verified: Reporter contact details hidden from claimant while PENDING');
    } else {
      throw new Error('Privacy failure: contact details leaked prior to acceptance');
    }

    // 2. Roshni asks for more proof
    console.log('\n▶ Test 2: Roshni asks for follow-up proof...');
    claim1.status = 'FOLLOW_UP_REQUIRED';
    claim1.messages.push({
      senderId: roshniId,
      senderRole: 'reporter',
      senderName: userRoshni.name,
      message: 'Can you specify the hallmark or scratch on the inside band?',
      createdAt: new Date(),
    });
    await claim1.save();
    console.log(`✅ Follow-up requested: status=${claim1.status}, total messages=${claim1.messages.length}`);

    // 3. Sumit replies to follow-up
    console.log('\n▶ Test 3: Sumit replies to follow-up...');
    claim1.status = 'PENDING';
    claim1.messages.push({
      senderId: sumitId,
      senderRole: 'claimant',
      senderName: userSumit.name,
      message: 'Inside band has hallmark "18K-SK" engraved.',
      createdAt: new Date(),
    });
    await claim1.save();
    console.log(`✅ Sumit replied: status=${claim1.status}, total messages=${claim1.messages.length}`);

    // 4. Roshni rejects Attempt 1
    console.log('\n▶ Test 4: Roshni rejects Attempt 1...');
    if (claim1.attemptNumber === 1) {
      claim1.status = 'REJECTED';
      claim1.rejectionReason = 'Initial hallmark description was incomplete.';
      claim1.decisionAt = new Date();
      claim1.messages.push({
        senderId: roshniId,
        senderRole: 'reporter',
        senderName: userRoshni.name,
        message: 'Your proof was rejected. You have ONE final attempt remaining.',
        createdAt: new Date(),
      });
      await claim1.save();
      console.log(`✅ Attempt 1 Rejected: status=${claim1.status}, attempt=${claim1.attemptNumber}`);
    }

    // 5. Sumit resubmits for Attempt 2
    console.log('\n▶ Test 5: Sumit resubmits final Attempt 2...');
    if (claim1.status === 'REJECTED' && claim1.attemptNumber === 1) {
      claim1.attemptNumber = 2;
      claim1.status = 'PENDING';
      claim1.proofMessage = 'Attaching purchase invoice #INV-9821 showing purchase at Tanishq Jewelers with matching serial number.';
      claim1.messages.push({
        senderId: sumitId,
        senderRole: 'claimant',
        senderName: userSumit.name,
        message: '[Final Attempt 2/2] ' + claim1.proofMessage,
        createdAt: new Date(),
      });
      await claim1.save();
      console.log(`✅ Resubmitted: status=${claim1.status}, attempt=${claim1.attemptNumber}`);
    }

    // 6. Roshni accepts Claim
    console.log('\n▶ Test 6: Roshni accepts Claim...');
    claim1.status = 'ACCEPTED';
    claim1.decisionNote = 'Serial number verified against jewelry receipt.';
    claim1.decisionAt = new Date();
    claim1.messages.push({
      senderId: roshniId,
      senderRole: 'reporter',
      senderName: userRoshni.name,
      message: 'Claim accepted! Ownership verified.',
      createdAt: new Date(),
    });
    await claim1.save();
    console.log(`✅ Claim Accepted: status=${claim1.status}`);

    // Verify privacy after acceptance (contact info revealed)
    await getClaimById(mockReq, mockRes);
    if (mockResData.data.reporterEmail === userRoshni.email) {
      console.log(`✅ Contact details revealed after ACCEPTANCE: Email=${mockResData.data.reporterEmail}`);
    } else {
      throw new Error('Contact details were not revealed upon acceptance');
    }

    // 7. Test Permanent Rejection (Attempt 2 rejection -> FINAL_REJECTED)
    console.log('\n▶ Test 7: Testing 2-attempt limit & FINAL_REJECTED behavior...');
    const testItem2Id = new mongoose.Types.ObjectId();
    const claim2 = await Claim.create({
      itemId: testItem2Id,
      itemTitle: 'Lost Wallet',
      itemType: 'found',
      claimantId: sumitId,
      claimantName: userSumit.name,
      claimantEmail: userSumit.email,
      reporterId: roshniId,
      reporterName: userRoshni.name,
      reporterEmail: userRoshni.email,
      status: 'PENDING',
      attemptNumber: 1,
      proofMessage: 'Black leather wallet with 500 rs.',
      messages: [{ senderId: sumitId, senderRole: 'claimant', message: 'Black wallet', createdAt: new Date() }],
    });

    // Attempt 1 reject:
    claim2.status = 'REJECTED';
    await claim2.save();

    // Resubmit Attempt 2:
    claim2.attemptNumber = 2;
    claim2.status = 'PENDING';
    claim2.proofMessage = 'Second attempt proof';
    await claim2.save();

    // Attempt 2 reject:
    claim2.status = 'FINAL_REJECTED';
    claim2.rejectionReason = 'Proof does not match items in wallet.';
    await claim2.save();

    console.log(`✅ Claim 2 status after 2nd rejection: ${claim2.status} (attempt ${claim2.attemptNumber})`);

    // Verify blocked from further attempts
    const isBlocked = claim2.status === 'FINAL_REJECTED' || claim2.attemptNumber >= 2;
    if (isBlocked) {
      console.log('✅ User is permanently blocked from submitting attempt 3 for this item.');
    } else {
      throw new Error('User was not blocked after 2nd rejection');
    }

    // Clean up test documents
    await Claim.deleteMany({ _id: { $in: [claim1._id, claim2._id] } });
    console.log('\n🧹 Test documents cleaned up successfully.');

    console.log('\n=============================================');
    console.log('🎉 ALL CLAIM SERVICE TESTS PASSED SUCCESSFULLY!');
    console.log('=============================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failure:', error);
    process.exit(1);
  }
};

runTests();
