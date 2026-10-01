const { MongoClient } = require('mongodb');

const URL = 'mongodb://localhost';
const DB_NAME = 'organiz_asso';

let client;
let db;

async function connectDB() {
  client = new MongoClient(URL);
  await client.connect();
  db = client.db(DB_NAME);
  console.log("Connecté à MongoDB - base :", DB_NAME);
}

function getDB() {
  if (!db) throw new Error('Base de données non connectée');
  return db;
}

module.exports = { connectDB, getDB };
