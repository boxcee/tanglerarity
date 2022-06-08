import clientPromise from './client';
import {Collection} from 'mongodb';

async function collectionHelper<T>(databaseName: string, collectionName: string): Promise<Collection<T>> {
  const client = await clientPromise;
  const db = client.db(databaseName);
  return db.collection(collectionName);
}

export {collectionHelper};
