import clientPromise from './client';

const DB_NAME = 'tanglerarity';
const COLLECTION_NAME = 'rarities';

const getDocuments = async (uid, filter = {}) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  const cursor = collection.find(filter);
  return cursor.toArray();
};

const createDocument = async (uid, document) => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  const { insertedId } = await collection.insertOne(document);
  return insertedId;
};

export { getDocuments, createDocument };
