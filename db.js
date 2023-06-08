const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://council:council@citycouncil.lqxedkb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function connect() {
  try {
    await client.connect();
    db = client.db("councildb");
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  }
}

function getDB() {
  return db;
}

module.exports = {
  client,
  connect,
  getDB,
};
