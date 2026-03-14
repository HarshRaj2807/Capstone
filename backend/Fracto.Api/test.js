const http = require('http');

const data = JSON.stringify({
  email: 'admin@fracto.com',
  password: 'AdminPassword123!'
});

const req = http.request({
  hostname: 'localhost',
  port: 5104,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => {
    const json = JSON.parse(body);
    const token = json.token;
    
    // Now request appointments with filter
    const req2 = http.request({
      hostname: 'localhost',
      port: 5104,
      path: '/api/appointments?status=Booked',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, res2 => {
      let body2 = '';
      res2.on('data', d => { body2 += d; });
      res2.on('end', () => {
        console.log(body2);
      });
    });
    req2.end();
  });
});
req.write(data);
req.end();
