import clientPromise from './client';

const DB_NAME = 'tanglerarity';
const COLLECTION_NAME = 'collections';
const NFT_NAME = 'nfts';

const getCollections = async (limit, skip, sort, order, filter = {}) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  let cursor = collection.find(filter);
  if (limit) {
    cursor.limit(limit);
  }
  if (skip) {
    cursor.skip(skip);
  }
  if (sort && order) {
    cursor.sort({ [sort]: order });
  }
  return cursor.toArray();
};

const getCollection = async (uid, filter = {}) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  return collection.findOne({ uid, ...filter });
};

const createCollection = async (document) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  await collection.insertOne({ _id: document.uid, ...document });
  return document;
};

const getNfts = async (uid, limit, skip, sort, order, filter = {}) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(NFT_NAME);
  const cursor = await collection.find({ collection: uid, ...filter });
  if (limit) {
    cursor.limit(limit);
  }
  if (skip) {
    cursor.skip(skip);
  }
  if (sort && order) {
    cursor.sort({ [sort]: order });
  }
  return { total: await collection.countDocuments({ collection: uid }), items: await cursor.toArray() };
};

const getNft = async (collectionUid, uid) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(NFT_NAME);
  return collection.findOne({ collection: collectionUid, _id: uid });
};

const createNfts = async (uid, documents) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(NFT_NAME);
  await collection.insertMany(documents.map(document => ({ _id: document.uid, ...document })));
  return documents;
};

export { getCollection, createCollection, getNfts, createNfts, getNft, getCollections };
