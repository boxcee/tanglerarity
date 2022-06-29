import {NftDocument, NftDocuments} from './types/Nft';
import {AnyBulkWriteOperation, Document, Filter, Sort} from 'mongodb';
import config from './config';
import * as utils from './utils';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';

const collectionHelper = utils.collectionHelper<NftDocument>(config.DB_NAME, config.NFTS_COLLECTION_NAME);

const getNfts = async (collectionId?: string, limit?: number, skip?: number, sort?: string, order?: number, filter = {}, projection = {}): Promise<NftDocuments> => {
  const mongo = await collectionHelper;
  let cursor;
  if (collectionId) {
    cursor = await mongo.find({collection: collectionId, ...filter}, {projection});
  } else {
    cursor = await mongo.find(filter, {projection});
  }
  if (limit) {
    cursor.limit(limit);
  }
  if (skip) {
    cursor.skip(skip);
  }
  if (sort && order) {
    cursor.sort({[sort]: order} as Sort);
  } else {
    cursor.sort({rank: -1});
  }
  const nfts = await cursor.toArray() as NftDocument[];
  return {
    total: await mongo.countDocuments({collection: collectionId}),
    filtered: await mongo.countDocuments({collection: collectionId, ...filter}),
    items: nfts,
  };
};

const getNft = async (collectionUid: string, uid: string, projection = {}): Promise<NftDocument> => {
  const mongo = await collectionHelper;
  const nft = await mongo.findOne({
    uid,
    collection: collectionUid,
  } as Filter<NftDocument>, {projection});
  return nft as NftDocument;
};

const createNfts = async (uid: string, documents: Document[]): Promise<NftDocuments> => {
  const mongo = await collectionHelper;
  const createdDocuments = documents as NftDocument[];
  await mongo.insertMany(createdDocuments);
  return {total: createdDocuments.length, filtered: createdDocuments.length, items: createdDocuments as NftDocument[]};
};

const updateNfts = async (collectionId: string, nfts: Nft[]) => {
  const mongo = await collectionHelper;
  const bulkWriteOperations: AnyBulkWriteOperation<NftDocument>[] = nfts.map(nft => ({
    updateOne: {
      filter: {collection: collectionId, uid: nft.uid},
      update: {$set: {availablePrice: nft.availablePrice}},
    },
  }));
  await mongo.bulkWrite(bulkWriteOperations);
};

export {
  getNfts,
  createNfts,
  getNft,
  updateNfts,
};
