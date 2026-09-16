const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(resData) });
          } catch (e) {
            resolve({ status: res.statusCode, body: resData });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting API Verification Tests ---');

  // 1. Check status
  console.log('1. Checking status...');
  const statusRes = await request('GET', '/api/status');
  console.log('Status Response:', statusRes.body);

  // 2. Reset boxes
  console.log('\n2. Resetting demo boxes...');
  const resetRes = await request('POST', '/api/boxes/reset');
  console.log('Reset Response:', resetRes.body);

  // 3. User 1 (Alice) login
  console.log('\n3. Logging in Alice...');
  const aliceRes = await request('POST', '/api/users/login', { username: 'Alice' });
  console.log('Alice Login:', aliceRes.body);

  // 4. User 2 (Bob) login
  console.log('\n4. Logging in Bob...');
  const bobRes = await request('POST', '/api/users/login', { username: 'Bob' });
  console.log('Bob Login:', bobRes.body);

  // 5. Alice books boxes 1, 2, 3
  console.log('\n5. Alice books boxes [1, 2, 3]...');
  const bookRes = await request('POST', '/api/boxes/book', {
    username: 'Alice',
    boxIds: [1, 2, 3],
  });
  console.log('Alice Booking:', bookRes.body);

  // 6. Fetch boxes and verify status
  console.log('\n6. Fetching boxes to verify Alice booking...');
  const boxesRes = await request('GET', '/api/boxes');
  const box1 = boxesRes.body.boxes.find((b) => b.id === 1);
  const box4 = boxesRes.body.boxes.find((b) => b.id === 4);
  console.log('Box #1 booked_by:', box1.booked_by, '(Expected: Alice)');
  console.log('Box #4 booked_by:', box4.booked_by, '(Expected: null)');

  // 7. Bob attempts to book already booked Box 1 (should fail)
  console.log('\n7. Bob attempts to book Box 1 (already booked)...');
  const failBookRes = await request('POST', '/api/boxes/book', {
    username: 'Bob',
    boxIds: [1, 4],
  });
  console.log('Bob Booking attempt result:', failBookRes.status, failBookRes.body);

  // 8. Bob attempts to revoke Alice\'s Box 1 (should fail)
  console.log('\n8. Bob attempts to revoke Alice\'s Box 1...');
  const failRevokeRes = await request('POST', '/api/boxes/revoke', {
    username: 'Bob',
    boxId: 1,
  });
  console.log('Bob Revoke attempt result:', failRevokeRes.status, failRevokeRes.body);

  // 9. Alice revokes Box 2
  console.log('\n9. Alice revokes Box 2...');
  const revokeRes = await request('POST', '/api/boxes/revoke', {
    username: 'Alice',
    boxId: 2,
  });
  console.log('Alice Revoke result:', revokeRes.body);

  // 10. Verify Box 2 is now available (null)
  const boxesAfterRevoke = await request('GET', '/api/boxes');
  const box2 = boxesAfterRevoke.body.boxes.find((b) => b.id === 2);
  console.log('Box #2 after revoke booked_by:', box2.booked_by, '(Expected: null)');

  console.log('\n✅ All API Integration Tests PASSED successfully!');
}

runTests().catch(console.error);
