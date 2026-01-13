const mongoose = require('mongoose');
const { mongoUri } = require('./env');

let mongod = null;

async function startInMemory() {
  // lazy-load to avoid heavy deps unless needed
  const { MongoMemoryServer } = require('mongodb-memory-server');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

const connectDB = async () => {
  if (mongoUri) {
    await mongoose.connect(mongoUri, { dbName: 'task_manager_ozi' });
    return;
  }

}

connectDB.stop = async function stop() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};

module.exports = connectDB;
