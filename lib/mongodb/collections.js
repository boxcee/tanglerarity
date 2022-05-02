import clientPromise from './client';

const DB_NAME = 'tanglerarity';
const COLLECTION_NAME = 'collections';
const NFT_NAME = 'nfts';

const getCollection = async (uid) => {
  console.log('getCollection');
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  return collection.findOne({ uid });
};

const createCollection = async (document) => {
  console.log('createCollection');
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  await collection.insertOne({ _id: document.uid, ...document });
  return document;
};

const getNfts = async (uid, limit, skip) => {
  console.log('getNfts');
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(NFT_NAME);
  const cursor = await collection.find({ collection: uid }, { skip }).limit(limit);
  return { total: await collection.countDocuments(), nfts: await cursor.toArray() };
};

const createNfts = async (documents) => {
  console.log('createNfts');
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(NFT_NAME);
  await collection.insertMany(documents.map(document => ({ _id: document.uid, ...document })));
  return documents;
};

export { getCollection, createCollection, getNfts, createNfts };
