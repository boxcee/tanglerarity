import {NextApiRequest, NextApiResponse} from 'next';
import {parse} from 'csv-parse/sync';
import {buildRarities, buildTotalRarities} from '../../lib/utils/rarity';
import web3 from 'web3';
import {getOrCreateCollection} from '../../lib/mongodb/utils';
import {updateCollection} from '../../lib/mongodb/collections';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';

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
  const {body, query: {collection: collectionParam}} = req;
  const collectionId = Array.isArray(collectionParam) ? collectionParam[0] : collectionParam;
  if (!collectionParam || !web3.utils.isAddress(collectionId)) {
    res.status(400).send('collection id is missing');
  } else {
    const collection = await getOrCreateCollection(true, collectionId);
    if (collection && !collection.rarities) {
      const parsed = parse(body, {columns: true, skip_empty_lines: true, on_record: recordMapper});
      const rarities = buildTotalRarities(parsed);
      const rarityMap = buildRarities(rarities, parsed);
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
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
