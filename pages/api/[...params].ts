import {NextApiRequest, NextApiResponse} from 'next';
import {Soon} from 'soonaverse';
import {createCollection, getCollection, getCollections} from '../../lib/mongodb/collections';
import {createNfts, getNft, getNfts} from '../../lib/mongodb/nfts';
import {createRarities, getRarities} from '../../lib/mongodb/rarities';
import {buildRarities, buildTotalRarities, enrichNfts} from '../../lib/utils/rarity';
import web3 from 'web3';
import auth0 from '../../lib/auth0';
import {NftDocument, NftDocuments} from '../../lib/mongodb/types/Nft';
import {RankedNftDocuments} from '../../types/api/RankedNftDocuments';
import {RarityDocument} from '../../lib/mongodb/types/Rarities';
import {EnrichedCollectionDocument} from '../../types/api/EnrichedCollectionDocument';

const soon = new Soon();

const getOrCreateCollection = async (isAuthorized: boolean, collectionId: string, filter = {}): Promise<EnrichedCollectionDocument> => {
  let data = await getCollection(collectionId, filter);
  if (!data) {
    const newCollection = await soon.getCollection(collectionId);
    data = await createCollection(newCollection);
  }

  const rarities = await getOrCreateRarities(collectionId, []);
  return {
    totalRarities: rarities && rarities.totalRarities ? rarities.totalRarities : {},
    ...data,
  };
};

const getOrCreateRarities = async (collectionId: string, nfts: NftDocument[]): Promise<RarityDocument> => {
  let rarities = await getRarities(collectionId);
  if (rarities === null && nfts.length !== 0) {
    const builtTotalRarities = buildTotalRarities(nfts);
    const builtRarities = buildRarities(builtTotalRarities, nfts);
    rarities = await createRarities(collectionId, {totalRarities: builtTotalRarities, rarities: builtRarities});
  }
  return rarities;
};

const getOrCreateNfts = async (isAuthorized: boolean, collectionId: string, limit: number, skip: number, sort: string, order: number, filter = {}): Promise<NftDocuments | RankedNftDocuments> => {
  const collection = await getOrCreateCollection(isAuthorized, collectionId);
  if (collection.total !== collection.sold) {
    console.error(collection.name, collection.uid, 'collection not fully minted');
    return {total: 0, items: []};
  }

  // Get NFT data
  let data = await getNfts(collectionId, limit, skip, sort, order, filter);
  if ((!data.items || data.items.length === 0) && Object.keys(filter).length === 0) {
    const newNfts = await soon.getNftsByCollections([collectionId]);
    data = await createNfts(collectionId, newNfts);
  }

  if (!isAuthorized) {
    return data;
  }

  // If user is authorized add rarity data to NFT data
  const rarities = await getOrCreateRarities(collectionId, data.items);
  return {
    total: data.total,
    items: enrichNfts(rarities.rarities!, data.items),
  };
};

const hasSession = async (req: NextApiRequest, res: NextApiResponse): Promise<boolean> => {
  const session = await auth0.getSession(req, res);
  return !(!session || !session.user);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {query: {params, limit, skip, sort, order}, method, body} = req;
  const filter = body ? JSON.parse(body) : {};
  const queryLimit: number = Array.isArray(limit) ? Number(limit[0]) : Number(limit);
  const queryOffset: number = Array.isArray(skip) ? Number(skip[0]) : Number(skip);
  const sortKey: string = Array.isArray(sort) ? sort[0] : sort;
  const sortOrder: number = order === 'asc' ? 1 : -1;
  const isAuthorized: boolean = await hasSession(req, res);

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
        const data = await getOrCreateCollection(isAuthorized, collectionId, filter);
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
        const data = await getOrCreateNfts(isAuthorized, collectionId, queryLimit, queryOffset, sortKey, sortOrder, filter);
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
        if (!isAuthorized) {
          res.status(200).json(data);
        } else {
          const rarities = await getRarities(collectionId);
          const enrichedNft = enrichNfts(rarities.rarities!, [data]);
          res.status(200).json(enrichedNft);
        }
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } else {
    res.status(500).json({});
  }
};
