import {NextApiRequest, NextApiResponse} from 'next';
import {getCollections, getNfts} from '../../lib/mongodb/collections';
import {RankedNft} from '../../types/RankedNft';
import {Collection} from 'soonaverse/dist/interfaces/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse<(Collection | RankedNft)[]>) {
  const {query: {q: search}} = req;
  const filter = {$or: ['name', 'uid', 'description'].map(field => ({[field]: {$regex: search, $options: 'i'}}))};
  const collections = await getCollections(undefined, undefined, undefined, undefined, filter);
  console.log(collections[0]);
  const {total, items: nfts} = await getNfts(undefined, undefined, undefined, undefined, undefined, filter);
  console.log(nfts[0]);
  res.status(200).json([
    ...collections.map((c: Collection) => ({groupBy: 'collections', ...c})),
    ...nfts.map((n: RankedNft) => ({groupBy: 'nfts', ...n})),
  ]);
};
