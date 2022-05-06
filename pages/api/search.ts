import {NextApiRequest, NextApiResponse} from 'next';
import {getCollections} from '../../lib/mongodb/collections';
import {getNfts} from '../../lib/mongodb/nfts';
import {Collection} from 'soonaverse/dist/interfaces/models';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';

type GroupedNft = Nft & {
  groupBy: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<(Collection | GroupedNft)[]>) {
  const {query: {q: search}} = req;
  const filter = {$or: ['name', 'uid', 'description'].map(field => ({[field]: {$regex: search, $options: 'i'}}))};
  const {
    total: totalCollections,
    items: collections,
  } = await getCollections(undefined, undefined, undefined, undefined, filter);
  const {total, items: nfts} = await getNfts(undefined, undefined, undefined, undefined, undefined, filter);
  res.status(200).json([
    ...collections.map((c: Collection) => ({groupBy: 'collections', ...c})),
    ...nfts.map((n: Nft) => ({groupBy: 'nfts', ...n})),
  ]);
};
