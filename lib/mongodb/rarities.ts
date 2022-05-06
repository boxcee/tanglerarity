import {Document, WithId} from 'mongodb';
import config from './config';
import * as utils from './utils';
import {RarityDocument} from './types/Rarities';

const collectionHelper = utils.collectionHelper<RarityDocument>(config.DB_NAME, config.RARITIES_COLLECTION_NAME);

const getRarities = async (collectionUid: string, filter = {}): Promise<RarityDocument> => {
  const mongo = await collectionHelper;
  const document = await mongo.findOne({collection: collectionUid, ...filter});
  return document as RarityDocument;
};

const createRarities = async (collectionUid: string, document: Document): Promise<RarityDocument> => {
  const mongo = await collectionHelper;
  const createdDocument = {collection: collectionUid, ...document} as WithId<{ collection: string }>;
  await mongo.insertOne(createdDocument);
  return createdDocument as RarityDocument;
};

export {createRarities, getRarities};
