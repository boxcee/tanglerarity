import {NextApiRequest, NextApiResponse} from 'next';
import {Soon} from 'soonaverse';
import {getCollections, updateCollection} from '../../lib/mongodb/collections';
import {createNfts, getNft, getNfts} from '../../lib/mongodb/nfts';
import {buildRarities, buildTotalRarities, enrichNfts} from '../../lib/utils/rarity';
import web3 from 'web3';
import auth0 from '../../lib/auth0';
import {NftDocuments} from '../../lib/mongodb/types/Nft';
import {RankedNftDocuments} from '../../types/api/RankedNftDocuments';
import {getOrCreateCollection} from '../../lib/mongodb/utils';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';

const soon = new Soon();

const getOrCreateNfts = async (isAuthorized: boolean, collectionId: string, limit: number, skip: number, sort: string, order: number, filter = {}): Promise<NftDocuments | RankedNftDocuments> => {
  const collection = await getOrCreateCollection(isAuthorized, collectionId);
  if (!collection) {
    return {total: 0, items: []};
  } else if (!collection.rarities && collection.total !== collection.sold) {
    console.error(collection.name, collection.uid, 'collection not fully minted');
    return {total: 0, items: []};
  }

  // Get NFT data
  const projection = !isAuthorized ? {rarity: 0, rank: 0, score: 0} : {};
  let data = await getNfts(collectionId, limit, skip, sort, order, filter, projection);
  const nftsHaveNotBeenLoadedYet = !data.items || data.items.length === 0;
  const nftsHaveOnlyBeenLoadedPartly = data.items.length !== collection.sold;

  console.log(nftsHaveOnlyBeenLoadedPartly, nftsHaveNotBeenLoadedYet);

  if ((nftsHaveNotBeenLoadedYet || nftsHaveOnlyBeenLoadedPartly) && Object.keys(filter).length === 0) {
    let filteredNfts = [] as Nft[];
    if (nftsHaveNotBeenLoadedYet && nftsHaveOnlyBeenLoadedPartly) {
      const newNfts = await soon.getNftsByCollections([collectionId]);
      filteredNfts = newNfts
        .filter(nft => !nft.placeholderNft)
        .filter(nft => !data.items.map(nft => nft.name).includes(nft.name));
    }
    const builtTotalRarities = !collection.rarities ? buildTotalRarities(filteredNfts) : collection.rarities;
    if (nftsHaveNotBeenLoadedYet && !nftsHaveOnlyBeenLoadedPartly) {
      await updateCollection(collection, {rarities: builtTotalRarities});
    }
    const builtRarities = !collection.rarityMap ? buildRarities(builtTotalRarities, filteredNfts) : collection.rarityMap;
    if (filteredNfts.length !== 0) {
      data = await createNfts(collectionId, enrichNfts(builtRarities, filteredNfts), projection);
    }
  }

  return data;
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
  const isAuthorized: boolean = await hasSession(req, res) || true; // TODO: Always true

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
        const projection = !isAuthorized ? {rarity: 0, rank: 0, score: 0} : {};
        const data = await getNft(collectionId, nftId, projection);
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
