import {Document, Filter, ObjectId, Sort} from 'mongodb';
import {CollectionDocument, CollectionDocuments} from './types/Collection';
import config from './config';
import * as utils from './utils';

const collectionHelper = utils.collectionHelper<CollectionDocument>(config.DB_NAME, config.COLLECTIONS_COLLECTION_NAME);

const getCollections = async (limit?: number, skip?: number, sort?: string, order?: number | undefined, filter = {}): Promise<CollectionDocuments> => {
  const mongo = await collectionHelper;
  let cursor = mongo.find(filter);
  if (limit) {
    cursor.limit(limit);
  }
  if (skip) {
    cursor.skip(skip);
  }
  if (sort && order) {
    cursor.sort({[sort]: order} as Sort);
  }
  const collections = await cursor.toArray() as CollectionDocument[];
  return {total: await mongo.countDocuments(), items: collections};
};

const getCollection = async (uid: string, filter = {}, projection = {}): Promise<CollectionDocument> => {
  const mongo = await collectionHelper;
  const collection = await mongo.findOne({uid, ...filter}, {projection});
  return collection as CollectionDocument;
};

const createCollection = async (document: Document, projection = {}): Promise<CollectionDocument> => {
  //TODO: Filter projection fields
  const mongo = await collectionHelper;
  const createdDocument = document as CollectionDocument;
  await mongo.insertOne(createdDocument);
  return createdDocument as CollectionDocument;
};

const updateCollection = async (collection: CollectionDocument, update: Document): Promise<void> => {
  const mongo = await collectionHelper;
  await mongo.updateOne(collection as Filter<CollectionDocument>, {$set: update});
};

export {createCollection, getCollections, updateCollection, getCollection};
