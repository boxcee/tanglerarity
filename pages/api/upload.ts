import {NextApiRequest, NextApiResponse} from 'next';
import {parse} from 'csv-parse/sync';
import {buildTotalRarities} from '../../lib/utils/rarity';

type Properties = {
  [key: string]: { label: string, value: string }
}

type NftType = {
  properties: Properties
  [key: string]: string | Properties
}

type CsvType = {
  [key: string]: string
}

const recordMapper = (record: CsvType) => {
  return Object.keys(record).reduce((acc: NftType, key: string) => {
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
      return acc;
    }
  }, {} as NftType);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsed = parse(req.body, {columns: true, skip_empty_lines: true, on_record: recordMapper});
  const total = buildTotalRarities(parsed);
  res.status(200).json(total);
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
