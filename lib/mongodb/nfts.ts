import {NftDocument, NftDocuments} from './types/Nft';
import {Document, Filter, ObjectId, Sort} from 'mongodb';
import config from './config';
import * as utils from './utils';

const collectionHelper = utils.collectionHelper<NftDocument>(config.DB_NAME, config.NFTS_COLLECTION_NAME);

const getNfts = async (uid?: string, limit?: number, skip?: number, sort?: string, order?: number, filter = {}): Promise<NftDocuments> => {
  const mongo = await collectionHelper;
  let cursor;
  if (uid) {
    cursor = await mongo.find({collection: uid, ...filter});
  } else {
    cursor = await mongo.find(filter);
  }
  if (limit) {
    cursor.limit(limit);
  }
  if (skip) {
    cursor.skip(skip);
  }
  if (sort && order) {
    cursor.sort({[sort]: order} as Sort);
  }
  const nfts = await cursor.toArray() as NftDocument[];
  return {total: await mongo.countDocuments({collection: uid}), items: nfts};
};

const getNft = async (collectionUid: string, uid: string): Promise<NftDocument> => {
  const mongo = await collectionHelper;
  const nft = await mongo.findOne({_id: new ObjectId(uid), collection: collectionUid} as Filter<NftDocument>);
  return nft as NftDocument;
};

const createNfts = async (uid: string, documents: Document[]): Promise<NftDocuments> => {
  const mongo = await collectionHelper;
  const createdDocuments = documents.map(document => ({_id: document.uid, ...document}));
  await mongo.insertMany(createdDocuments as NftDocument[]);
  return {total: createdDocuments.length, items: createdDocuments as NftDocument[]};
};

export {
  getNfts,
  createNfts,
  getNft,
};
