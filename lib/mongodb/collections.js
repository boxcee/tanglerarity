import clientPromise from './client';

const DB_NAME = 'tanglerarity';
const COLLECTION_NAME = 'collections';

const getCollection = async (uid) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  return collection.findOne({ uid });
};

const createCollection = async (document) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  await collection.insertOne({ _id: document.uid, ...document });
  return document;
};

const getNfts = async (uid, limit, skip) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(uid);
  const cursor = await collection.find({ collection: uid }, { skip }).limit(limit);
  return { total: await collection.countDocuments(), nfts: await cursor.toArray() };
};

const createNfts = async (uid, documents) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(uid);
  await collection.insertMany(documents.map(document => ({ _id: document.uid, ...document })));
  return documents;
};

export { getCollection, createCollection, getNfts, createNfts };
