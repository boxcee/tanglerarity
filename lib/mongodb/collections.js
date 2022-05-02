import clientPromise from './client';

const DB_NAME = 'tanglerarity';
const COLLECTION_NAME = 'collections';

const createDocuments = async (documents) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  const { insertedId } = await collection.insertMany(documents);
  return insertedId;
};

const getCollection = async (uid) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  return collection.findOne({ collection: uid });
};

const createCollection = async (document) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  await collection.insertOne(document);
  return document;
};

const getNfts = async (uid, limit, skip) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  const cursor = await collection.find({ collection: uid }, { skip }).limit(limit);
  return cursor.toArray();
};

const createNfts = async (documents) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  await collection.insertMany(documents);
  return documents;
};

export { getCollection, createCollection, getNfts, createNfts };
