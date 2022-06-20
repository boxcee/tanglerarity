import {NextApiRequest, NextApiResponse} from 'next';
import {getCollections} from '../../lib/mongodb/collections';
import {getNft} from '../../lib/mongodb/nfts';
import web3 from 'web3';
import {getOrCreateCollection, getOrCreateNfts} from '../../lib/api';
//import auth0 from '../../lib/auth0';

const hasSession = async (req: NextApiRequest, res: NextApiResponse): Promise<boolean> => {
  //const session = await auth0.getSession(req, res);
  //return !(!session || !session.user);
  return true;
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
