import {NextApiRequest, NextApiResponse} from 'next';
import {parse} from 'csv-parse/sync';
import {
  getRarities,
  buildTotalRarities,
  getEnrichedNfts,
  sortEnrichedNfts,
  getRankedNfts,
} from '../../lib/utils/rarity';
import web3 from 'web3';
import {getOrCreateCollection} from '../../lib/mongodb/utils';
import {updateCollection} from '../../lib/mongodb/collections';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';
import formidable from 'formidable';

type CsvType = {
  [key: string]: string
}

const recordMapper = (record: CsvType) => {
  return Object.keys(record).reduce((acc: Nft, key: string) => {
    const label = key.indexOf('label') > -1 ? record[key] : record[key.replace('value', 'label')];
    const value = key.indexOf('value') > -1 ? record[key] : record[key.replace('label', 'value')];
    if (key.startsWith('prop')) {
      if (!acc.properties) {
        acc.properties = {};
      }
      if (!acc.properties[label]) {
        acc.properties[label] = {
          label,
          value,
        };
      }
      return acc;
    } else {
      return {
        [key]: record[key],
        ...acc,
      };
    }
  }, {} as Nft);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {query: {collection: collectionParam}} = req;
  const data: { originalFilename: string | null, mimetype: string | null, buffer: Buffer } = await new Promise((resolve, reject) => {
    const form = formidable();
    let buffer = Buffer.from('');
    form.onPart = (part => {
      const {originalFilename, mimetype} = part;
      part.on('data', data => buffer += data);
      part.on('end', () => {
        resolve({originalFilename, mimetype, buffer});
      });
    });
    form.parse(req);
  });
  const collectionId = Array.isArray(collectionParam) ? collectionParam[0] : collectionParam;
  if (!collectionParam || !web3.utils.isAddress(collectionId)) {
    res.status(400).send('collection id is missing');
  } else {
    const collection = await getOrCreateCollection(true, collectionId);
    if (collection && !collection.rarities) {
      const parsed: Nft[] = parse(data.buffer, {
        columns: true,
        skip_empty_lines: true,
        on_record: recordMapper,
      });
      const rarities = buildTotalRarities(parsed);
      const enrichedNfts = getEnrichedNfts(rarities, parsed);
      const sortedEnrichedNfts = sortEnrichedNfts(enrichedNfts);
      const rankedNfts = getRankedNfts(sortedEnrichedNfts);
      const rarityMap = getRarities(rankedNfts);
      await updateCollection(collection, {rarities, rarityMap});
      res.status(200).json(rarities);
    } else if (collection) {
      res.status(409).send('collection was already uploaded');
    } else {
      //TODO: Collections uploaded, but not existent on Soonaverse
      res.status(500).send('not implemented');
    }
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
