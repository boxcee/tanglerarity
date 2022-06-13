import {NextApiRequest, NextApiResponse} from 'next';
import {parse} from 'csv-parse/sync';
import {
  buildTotalRarities,
  enrichNfts,
  getEnrichedNfts,
  getRankedNfts,
  getRarities,
  sortEnrichedNfts,
} from '../../lib/utils/rarity';
import web3 from 'web3';
import {createCollection, updateCollection} from '../../lib/mongodb/collections';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';
import formidable from 'formidable';
import {getOrCreateCollection} from '../../lib/api';
import {createNfts} from '../../lib/mongodb/nfts';
import {RankedNft} from '../../types/RankedNft';

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
  const {
    query: {
      collection: collectionParam,
      type: typeParam,
      name: nameParam,
      description: descriptionParam,
      bannerUrl: bannerUrlParam,
    },
  } = req;

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
    return;
  }

  const collectionType = Array.isArray(typeParam) ? typeParam[0] : typeParam;
  const collectionName = Array.isArray(nameParam) ? nameParam[0] : nameParam;
  if (collectionType === 'ERC721' && !collectionName) {
    res.status(400).send('ERC721 collections need a name');
    return;
  }

  const collectionDescription = Array.isArray(descriptionParam) ? descriptionParam[0] : descriptionParam;
  if (collectionType === 'ERC721' && !collectionDescription) {
    res.status(400).send('ERC721 collections need a description');
    return;
  }

  const collectionBannerUrl = Array.isArray(bannerUrlParam) ? bannerUrlParam[0] : bannerUrlParam;
  if (collectionType === 'ERC721' && !collectionBannerUrl) {
    res.status(400).send('ERC721 collections need a bannerUrl');
    return;
  }

  const collection = await getOrCreateCollection(true, collectionId);
  if (collection && collection.rarities) {
    res.status(409).send('collection was already uploaded');
    return;
  }

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

  if (collection && collectionType === 'SOONAVERSE') {
    await updateCollection(collection, {rarities, rarityMap});
    res.status(200).json(rarities);
    return;
  }

  if (!collection && collectionType === 'ERC721') {
    await createCollection({
      uid: collectionId,
      name: collectionName,
      description: collectionDescription,
      bannerUrl: collectionBannerUrl,
      rarities,
      rarityMap,
      uploadType: 'ERC721',
      total: parsed.length,
      sold: parsed.length,
    });
    const nfts = rankedNfts.map((nft: RankedNft, idx: number) => ({
      ...nft,
      uid: nft.uid ? nft.uid : `${idx}`,
      collection: collectionId,
    }));
    await createNfts(collectionId, enrichNfts(rarityMap, nfts, {uploadType: 'ERC721'}));
    res.status(200).json(rarities);
    return;
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
