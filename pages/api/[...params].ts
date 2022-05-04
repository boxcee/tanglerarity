import {NextApiRequest, NextApiResponse} from 'next';
import {Soon} from 'soonaverse';
import {
  createCollection,
  createNfts,
  getCollection,
  getCollections,
  getNft,
  getNfts,
  updateCollection,
} from '../../lib/mongodb/collections';
import {enrichNftsWithRarityScores, getTotalRarityScores} from '../../lib/utils/rarity';
import web3 from 'web3';

const soon = new Soon();

const getOrCreateCollection = async (collectionId: string, filter = {}): Promise<any> => {
  let data = await getCollection(collectionId, filter);
  if (!data) {
    const newCollection = await soon.getCollection(collectionId);
    data = await createCollection(newCollection);
  }
  return data;
};

const getOrCreateNfts = async (collectionId: string, limit: number, skip: number, sort: string, order: number, filter = {}): Promise<{} | undefined> => {
  const collection = await getOrCreateCollection(collectionId);
  if (collection.total !== collection.sold) {
    console.error(collection.name, collection.uid, 'collection not fully minted');
    return {total: 0, items: []};
  }
  let data = await getNfts(collectionId, limit, skip, sort, order, filter);
  if ((!data.items || data.items.length === 0)) {
    const newNfts = await soon.getNftsByCollections([collectionId]);
    const totalRarityScores = getTotalRarityScores(newNfts);
    await updateCollection(collectionId, {rarities: totalRarityScores});
    const enrichedNfts = enrichNftsWithRarityScores(totalRarityScores, newNfts);
    data = {
      total: enrichedNfts.length,
      items: await createNfts(collectionId, enrichedNfts),
    };
  }
  return data;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {query: {params, limit, skip, sort, order}, method, body: filter} = req;

  const queryLimit: number = Array.isArray(limit) ? Number(limit[0]) : Number(limit);
  const queryOffset: number = Array.isArray(skip) ? Number(skip[0]) : Number(skip);
  const sortKey: string = Array.isArray(sort) ? sort[0] : sort;
  const sortOrder: number = order === 'asc' ? 1 : -1;

  // Path is '/api/collections'
  if (params.length === 1 && params[0] === 'collections') {
    switch (method) {
      case 'GET':
      case 'POST':
        const data = await getCollections(queryLimit, queryOffset, sortKey, sortOrder, filter);
        res.status(200).json(data);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  }

  // Path is '/api/collections/[id]'
  else if (params.length === 2 && params[0] === 'collections' && web3.utils.isAddress(params[1])) {
    const collectionId = params[1];
    switch (method) {
      case 'GET':
      case 'POST':
        const data = await getOrCreateCollection(collectionId, filter);
        res.status(200).json(data);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  }

  // Path is '/api/collections/[id]/nfts'
  else if (params.length === 3 && params[0] === 'collections' && web3.utils.isAddress(params[1]) && params[2] === 'nfts') {
    const collectionId = params[1];
    switch (method) {
      case 'GET':
      case 'POST':
        const data = await getOrCreateNfts(collectionId, queryLimit, queryOffset, sortKey, sortOrder, filter);
        res.status(200).json(data);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  }

  // Path is '/api/collections/[id]/nfts/[id]'
  else if (params.length === 4 && params[0] === 'collections' && web3.utils.isAddress(params[1]) && params[2] === 'nfts' && web3.utils.isAddress(params[3])) {
    const collectionId = params[1];
    const nftId = params[3];
    switch (method) {
      case 'GET':
      case 'POST':
        const data = await getNft(collectionId, nftId);
        res.status(200).json(data);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } else {
    res.status(500).json({});
  }
};
