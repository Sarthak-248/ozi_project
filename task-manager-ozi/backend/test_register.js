const axios = require('axios');
require('dotenv').config();

(async () => {
  try {
    const PORT = process.env.PORT || 5000;
    const r = await axios.post(`http://localhost:${PORT}/api/auth/register`, { name: 'Test User', email: 'test@example.com', password: 'secret123' });
    console.log(JSON.stringify(r.data, null, 2));
  } catch (e) {
    if (e.response) console.error(JSON.stringify(e.response.data, null, 2));
    else console.error(e.message);
    process.exit(1);
  }
})();
