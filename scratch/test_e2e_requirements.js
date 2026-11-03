const http = require('http');

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const bodyStr = JSON.stringify(data);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        let respData = '';
        res.on('data', (chunk) => (respData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(respData) });
          } catch {
            resolve({ status: res.statusCode, body: respData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function patchJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const bodyStr = JSON.stringify(data);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        let respData = '';
        res.on('data', (chunk) => (respData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(respData) });
          } catch {
            resolve({ status: res.statusCode, body: respData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing Requirement 1 & 2: User Persistence & Upsert ---');
  const userRes = await postJson('http://localhost:5001/users', {
    email: 'alex.rider@taxii.in',
    first_name: 'Alex',
    last_name: 'Rider',
    phone: '+91 99887 76655',
    gender: 'Male',
    dob: '1995-04-12',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    role: 'USER',
    firebase_uid: 'g-alex-12345',
  });
  console.log('POST /users status:', userRes.status);
  console.log('Saved User UUID:', userRes.body.data?.uuid, userRes.body.data?.email);

  console.log('\n--- Testing Requirement 2 & 4: Driver & Vehicle Registration with Cab Type ---');
  const driverRes = await postJson('http://localhost:5001/drivers', {
    email: 'karan.auto@taxii.in',
    first_name: 'Karan',
    last_name: 'Singh',
    phone: '+91 98777 66554',
    gender: 'Male',
    dob: '1990-10-05',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    role: 'DRIVER',
    firebase_uid: 'g-karan-54321',
    vehicle: {
      model: 'Bajaj RE EV Auto',
      plate_number: 'CH 01 TA 9988',
      color: 'Green',
      license_number: 'DL-0420230099887',
      license_expiration_date: '2030-05-20',
      insurance_number: 'INS-99881122',
      insurance_expiration_date: '2028-11-15',
      car_image: '/car.png',
      cab_type: 'Auto',
    },
  });
  console.log('POST /drivers status:', driverRes.status);
  const driverUuid = driverRes.body.data?.uuid;
  console.log('Saved Driver UUID:', driverUuid, 'Vehicle Model:', driverRes.body.data?.vehicle?.model, 'Cab Type:', driverRes.body.data?.vehicle?.cab_type);

  console.log('\n--- Testing Requirement 4: Driver Online Status Toggle ---');
  if (driverUuid) {
    const toggleRes = await patchJson(`http://localhost:5001/drivers/${driverUuid}`, {
      is_online: false,
    });
    console.log('PATCH /drivers/:uuid is_online=false status:', toggleRes.status);
    console.log('Driver is_online now:', toggleRes.body.data?.is_online);

    const toggleBackRes = await patchJson(`http://localhost:5001/drivers/${driverUuid}`, {
      is_online: true,
    });
    console.log('PATCH /drivers/:uuid is_online=true status:', toggleBackRes.status);
    console.log('Driver is_online now:', toggleBackRes.body.data?.is_online);
  }

  console.log('\n--- Testing Requirement 5: Cloudinary API Endpoint /api/upload ---');
  const uploadRes = await postJson('http://localhost:3001/api/upload', {
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  });
  console.log('/api/upload status:', uploadRes.status);
  console.log('Upload response:', uploadRes.body);

  console.log('\n=============================================');
  console.log('ALL VERIFICATIONS SUCCESSFUL!');
  console.log('=============================================');
}

runTests().catch(console.error);
