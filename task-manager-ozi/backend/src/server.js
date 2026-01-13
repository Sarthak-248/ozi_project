const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

async function start() {
  await connectDB();
  const server = http.createServer(app);
  server.listen(port, () => {
    // server started
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}

start().catch((err) => { process.exit(1); });
