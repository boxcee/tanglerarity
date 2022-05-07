import clientPromise from './client';
import {Collection} from 'mongodb';
import {CollectionDocument} from './types/Collection';
import {createCollection, getCollection} from './collections';
import {Soon} from 'soonaverse';

const soon = new Soon();

async function collectionHelper<T>(databaseName: string, collectionName: string): Promise<Collection<T>> {
  const client = await clientPromise;
  const db = client.db(databaseName);
  return db.collection(collectionName);
}

const getOrCreateCollection = async (isAuthorized: boolean, collectionId: string, filter = {}): Promise<CollectionDocument | null> => {
  const projection = !isAuthorized ? {rarities: 0, rarityMap: 0} : {};
  let data = await getCollection(collectionId, filter, projection);
  if (!data) {
    const newCollection = await soon.getCollection(collectionId);
    if (!newCollection) {
      console.error(collectionId, 'collection is not a soonaverse collection');
      return null;
    }
    data = await createCollection(newCollection, projection);
  }
  return data;
};

export {collectionHelper, getOrCreateCollection};
