const axios = require('axios');
require('dotenv').config();

(async () => {
  try {
    const PORT = process.env.PORT || 5001;
    const base = `http://localhost:${PORT}`;
    // login
    const login = await axios.post(`${base}/api/auth/login`, { email: 'test@example.com', password: 'secret123' }, { withCredentials: true });
    console.log('login response:', login.data);
    const access = login.data.data?.access || login.data?.token || login.data?.data?.token;
    if (!access) return console.error('No access token from login');

    // tiny 1x1 png data URL
    const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR42mP8z/C/HwAGgwJ/l2+VJwAAAABJRU5ErkJggg==';
    const upload = await axios.post(`${base}/api/users/me/profile-picture`, { imageData }, { headers: { Authorization: `Bearer ${access}` } });
    console.log('upload response:', JSON.stringify(upload.data, null, 2));
  } catch (e) {
     if (e.response) console.error('ERR RESPONSE:', JSON.stringify(e.response.data, null, 2));
     else console.error('ERR', e.stack || e.message || e);
    process.exit(1);
  }
})();
