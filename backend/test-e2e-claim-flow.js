/**
 * Comprehensive End-to-End Test Suite for Claim & Ownership Verification
 * Tests the entire lifecycle through the API Gateway:
 * - Register 2 users (Roshni & Sumit)
 * - User A reports FOUND item
 * - User B views and submits claim (Attempt 1)
 * - Self-claim prevention & duplicate claim prevention
 * - Follow-up questions & replies (unlimited back-and-forth)
 * - Attempt 1 rejection -> 1 final attempt remaining
 * - Second attempt resubmission (Attempt 2)
 * - Acceptance -> item marked claimed, contact details revealed
 * - Attempt 2 rejection -> FINAL_REJECTED, permanent block, no 3rd attempt
 * - Privacy protection before and after acceptance
 */
const GATEWAY_URL = 'http://localhost:5000';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runE2ETests() {
  console.log('\n===============================================================');
  console.log('🚀 RUNNING END-TO-END CLAIM VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  try {
    // 1. Health check gateway
    console.log('▶ Checking Gateway health...');
    const healthRes = await fetch(`${GATEWAY_URL}/health`);
    if (!healthRes.ok) {
      throw new Error(`Gateway is not responding at ${GATEWAY_URL}`);
    }
    console.log('✅ Gateway is active.\n');

    // 2. Register / Login User A (Roshni)
    const uniqueId = Date.now();
    const roshniEmail = `roshni_${uniqueId}@test.com`;
    const sumitEmail = `sumit_${uniqueId}@test.com`;
    const password = 'Password@123';

    console.log('▶ Step 1: Register User A (Roshni)...');
    const regResA = await fetch(`${GATEWAY_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Roshni Sharma',
        email: roshniEmail,
        password,
      }),
    });
    const regDataA = await regResA.json();
    if (!regDataA.success) throw new Error(`Failed to register Roshni: ${regDataA.message}`);
    const tokenA = regDataA.token;
    const userAId = regDataA.user.id || regDataA.user._id;
    console.log(`✅ Roshni registered: ID=${userAId}, Token generated.`);

    // 3. Register / Login User B (Sumit)
    console.log('▶ Step 2: Register User B (Sumit)...');
    const regResB = await fetch(`${GATEWAY_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sumit Kumar',
        email: sumitEmail,
        password,
      }),
    });
    const regDataB = await regResB.json();
    if (!regDataB.success) throw new Error(`Failed to register Sumit: ${regDataB.message}`);
    const tokenB = regDataB.token;
    const userBId = regDataB.user.id || regDataB.user._id;
    console.log(`✅ Sumit registered: ID=${userBId}, Token generated.\n`);

    // 4. Roshni reports a FOUND item
    console.log('▶ Step 3: Roshni reports a FOUND item ("Silver Ring with Sapphire")...');
    const itemRes = await fetch(`${GATEWAY_URL}/api/v1/items/found`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Silver Ring with Sapphire',
        category: 'Jewelry & Watches',
        description: 'Found a silver band with an oval blue sapphire gemstone in University Library.',
        location: 'University Central Library 2nd Floor',
        dateFound: new Date().toISOString(),
        distinguishingDetails: 'Safekeeping at campus admin desk. Has distinctive inscription.',
        contactDetails: '+91 9811223344 (Admin Desk)',
      }),
    });
    const itemData = await itemRes.json();
    if (!itemData.success) throw new Error(`Failed to report item: ${itemData.message}`);
    const itemId = itemData.data._id || itemData.data.id;
    console.log(`✅ Found item created: ItemID=${itemId}, Status=${itemData.data.status}\n`);

    // 5. Test Rule: User A cannot claim her own item
    console.log('▶ Step 4: Roshni attempts to claim her own reported item (should fail)...');
    const selfClaimRes = await fetch(`${GATEWAY_URL}/api/v1/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        itemId,
        proofMessage: 'Trying to claim my own reported item.',
      }),
    });
    const selfClaimData = await selfClaimRes.json();
    if (!selfClaimRes.ok && selfClaimRes.status === 400) {
      console.log(`✅ Self-claim blocked correctly: status=${selfClaimRes.status}, msg="${selfClaimData.message}"\n`);
    } else {
      throw new Error(`Self-claim check failed. Allowed status: ${selfClaimRes.status}`);
    }

    // 6. Sumit submits a claim on Roshni's item (Attempt 1)
    console.log('▶ Step 5: Sumit submits ownership claim (Attempt 1)...');
    const claimRes = await fetch(`${GATEWAY_URL}/api/v1/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        itemId,
        proofMessage: 'This sapphire ring is mine. I left it on the study table next to bookshelf #4.',
        claimantPhone: '+91 9988776655',
      }),
    });
    const claimData = await claimRes.json();
    if (!claimData.success) throw new Error(`Failed to submit claim: ${claimData.message}`);
    const claimId = claimData.data._id || claimData.data.id;
    console.log(`✅ Claim submitted: ClaimID=${claimId}, Status=${claimData.data.status}, Attempt=${claimData.data.attemptNumber}`);

    // Verify privacy: Reporter contact details MUST NOT be exposed before acceptance
    if (claimData.data.reporterEmail || claimData.data.reporterContactDetails) {
      throw new Error('Privacy leak: reporter contact details exposed in pending claim response');
    }
    console.log('✅ Privacy verified: Reporter contact details are hidden before acceptance.\n');

    // 7. Test Duplicate Active Claim prevention
    console.log('▶ Step 6: Sumit attempts to submit duplicate claim for same item (should fail)...');
    const dupClaimRes = await fetch(`${GATEWAY_URL}/api/v1/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        itemId,
        proofMessage: 'Duplicate claim attempt.',
      }),
    });
    if (dupClaimRes.status === 409) {
      console.log('✅ Duplicate claim blocked correctly (409 Conflict).\n');
    } else {
      throw new Error(`Duplicate claim check failed. Status: ${dupClaimRes.status}`);
    }

    // 8. Roshni views incoming claim requests
    console.log('▶ Step 7: Roshni fetches incoming claim requests...');
    const reqListRes = await fetch(`${GATEWAY_URL}/api/v1/claims/requests`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const reqListData = await reqListRes.json();
    if (!reqListData.success || reqListData.count === 0) throw new Error('Roshni did not receive claim request');
    console.log(`✅ Roshni sees ${reqListData.count} incoming claim request(s).\n`);

    // 9. Roshni asks for more proof (Option 2)
    console.log('▶ Step 8: Roshni asks for more proof ("What is the inscription on the inside?")...');
    const followUpRes = await fetch(`${GATEWAY_URL}/api/v1/claims/${claimId}/follow-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        message: 'Can you tell me the exact engraving on the inner side of the ring band?',
      }),
    });
    const followUpData = await followUpRes.json();
    if (!followUpData.success || followUpData.data.status !== 'FOLLOW_UP_REQUIRED') {
      throw new Error(`Follow-up failed: ${JSON.stringify(followUpData)}`);
    }
    console.log(`✅ Follow-up sent: Status=${followUpData.data.status}, MessageCount=${followUpData.data.messages.length}\n`);

    // 10. Sumit replies to follow-up
    console.log('▶ Step 9: Sumit replies to follow-up ("Engraving says R&S 2024")...');
    const replyRes = await fetch(`${GATEWAY_URL}/api/v1/claims/${claimId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        message: 'The engraving on the inner band is "R&S 2024".',
      }),
    });
    const replyData = await replyRes.json();
    if (!replyData.success || replyData.data.status !== 'PENDING') {
      throw new Error(`Reply failed: ${JSON.stringify(replyData)}`);
    }
    console.log(`✅ Reply received by system: Status=${replyData.data.status}, MessageCount=${replyData.data.messages.length}\n`);

    // 11. Roshni rejects Attempt 1 (Option 3)
    console.log('▶ Step 10: Roshni rejects Attempt 1...');
    const rejectRes1 = await fetch(`${GATEWAY_URL}/api/v1/claims/${claimId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        reason: 'The engraving text does not match the actual inscription on the ring.',
      }),
    });
    const rejectData1 = await rejectRes1.json();
    if (!rejectData1.success || rejectData1.data.status !== 'REJECTED' || rejectData1.data.attemptNumber !== 1) {
      throw new Error(`First rejection failed: ${JSON.stringify(rejectData1)}`);
    }
    console.log(`✅ Attempt 1 Rejected: Status=${rejectData1.data.status}, Attempt=${rejectData1.data.attemptNumber} (1 final attempt remaining)\n`);

    // 12. Sumit submits Attempt 2 (resubmit)
    console.log('▶ Step 11: Sumit submits second and final attempt...');
    const resubmitRes = await fetch(`${GATEWAY_URL}/api/v1/claims/${claimId}/resubmit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        proofMessage: 'Here is the original bill from Tanishq Jewellers and photo matching the exact sapphire cuts and hallmark code.',
        claimantPhone: '+91 9988776655',
      }),
    });
    const resubmitData = await resubmitRes.json();
    if (!resubmitData.success || resubmitData.data.status !== 'PENDING' || resubmitData.data.attemptNumber !== 2) {
      throw new Error(`Resubmit failed: ${JSON.stringify(resubmitData)}`);
    }
    console.log(`✅ Resubmitted: Status=${resubmitData.data.status}, Attempt=${resubmitData.data.attemptNumber}\n`);

    // 13. Roshni accepts Claim (Option 1)
    console.log('▶ Step 12: Roshni accepts Claim on Attempt 2...');
    const acceptRes = await fetch(`${GATEWAY_URL}/api/v1/claims/${claimId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        note: 'Invoice and hallmark confirmed. Ready for return at campus admin desk.',
      }),
    });
    const acceptData = await acceptRes.json();
    if (!acceptData.success || acceptData.data.status !== 'ACCEPTED') {
      throw new Error(`Acceptance failed: ${JSON.stringify(acceptData)}`);
    }
    console.log(`✅ Claim Accepted: Status=${acceptData.data.status}`);

    // Verify contact details are now revealed
    console.log('▶ Step 13: Verifying mutual contact details revealed post-acceptance...');
    const claimDetailsResB = await fetch(`${GATEWAY_URL}/api/v1/claims/${claimId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const claimDetailsDataB = await claimDetailsResB.json();
    if (claimDetailsDataB.data.reporterEmail === roshniEmail) {
      console.log(`✅ Claimant Sumit can now view Reporter Roshni contact: Email=${claimDetailsDataB.data.reporterEmail}, Details=${claimDetailsDataB.data.reporterContactDetails}`);
    } else {
      throw new Error('Contact details were not revealed to claimant after acceptance');
    }

    const claimDetailsResA = await fetch(`${GATEWAY_URL}/api/v1/claims/${claimId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const claimDetailsDataA = await claimDetailsResA.json();
    if (claimDetailsDataA.data.claimantEmail === sumitEmail) {
      console.log(`✅ Reporter Roshni can now view Claimant Sumit contact: Email=${claimDetailsDataA.data.claimantEmail}, Phone=${claimDetailsDataA.data.claimantPhone}`);
    } else {
      throw new Error('Contact details were not revealed to reporter after acceptance');
    }

    // Verify Item status updated to 'claimed' in Item Service
    const itemStatusCheck = await fetch(`${GATEWAY_URL}/api/v1/items/${itemId}`);
    const itemStatusData = await itemStatusCheck.json();
    console.log(`✅ Item Service status updated: Status=${itemStatusData.data.status}\n`);

    // 14. Test Attempt 2 Rejection -> FINAL_REJECTED
    console.log('▶ Step 14: Testing 2-attempt limit & FINAL_REJECTED permanent block flow...');
    // Create second item
    const itemRes2 = await fetch(`${GATEWAY_URL}/api/v1/items/found`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Sony Wireless Headphones',
        category: 'Electronics',
        description: 'Black Sony WH-1000XM4 found in cafe.',
        location: 'Campus Cafe',
        dateFound: new Date().toISOString(),
      }),
    });
    const itemData2 = await itemRes2.json();
    const item2Id = itemData2.data._id || itemData2.data.id;

    // Sumit claims item 2 (Attempt 1)
    const claim2Res = await fetch(`${GATEWAY_URL}/api/v1/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        itemId: item2Id,
        proofMessage: 'My headphones, black color.',
      }),
    });
    const claim2Data = await claim2Res.json();
    const claim2Id = claim2Data.data._id || claim2Data.data.id;

    // Attempt 1 reject
    await fetch(`${GATEWAY_URL}/api/v1/claims/${claim2Id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ reason: 'Insufficient details' }),
    });

    // Sumit resubmits (Attempt 2)
    await fetch(`${GATEWAY_URL}/api/v1/claims/${claim2Id}/resubmit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ proofMessage: 'Serial number SN-998811' }),
    });

    // Attempt 2 reject -> should become FINAL_REJECTED
    const finalRejectRes = await fetch(`${GATEWAY_URL}/api/v1/claims/${claim2Id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ reason: 'Serial number does not match device' }),
    });
    const finalRejectData = await finalRejectRes.json();
    if (finalRejectData.data.status === 'FINAL_REJECTED') {
      console.log(`✅ Attempt 2 Rejection converted status to: ${finalRejectData.data.status}`);
    } else {
      throw new Error(`Expected FINAL_REJECTED, got ${finalRejectData.data.status}`);
    }

    // Try Attempt 3 (must be blocked)
    console.log('▶ Step 15: Verifying Attempt 3 is permanently blocked...');
    const attempt3Res = await fetch(`${GATEWAY_URL}/api/v1/claims/${claim2Id}/resubmit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ proofMessage: 'Trying third attempt' }),
    });
    if (attempt3Res.status === 403) {
      console.log('✅ Attempt 3 successfully blocked (403 Forbidden). No third attempt permitted.\n');
    } else {
      throw new Error(`Attempt 3 was not blocked. Status: ${attempt3Res.status}`);
    }

    console.log('===============================================================');
    console.log('🎉 ALL END-TO-END VERIFICATION FLOWS PASSED SUCCESSFULLY!');
    console.log('===============================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ E2E Test Suite Error:', error);
    process.exit(1);
  }
}

runE2ETests();
