import {NftDocuments} from './mongodb/types/Nft';
import {RankedNftDocuments} from '../types/api/RankedNftDocuments';
import {createNfts, getNfts} from './mongodb/nfts';
import {
  buildTotalRarities,
  enrichNfts,
  getEnrichedNfts,
  getRankedNfts,
  getRarities,
  sortEnrichedNfts,
} from './utils/rarity';
import {createCollection, getCollection, updateCollection} from './mongodb/collections';
import {Soon} from 'soonaverse';
import {CollectionDocument} from './mongodb/types/Collection';
import blacklist from '../blacklist.json';

const soon = new Soon();
const collectionBlacklist = blacklist as { [key: string]: string };

const getOrCreateCollection = async (isAuthorized: boolean, collectionId: string, filter = {}): Promise<CollectionDocument | null> => {
  const projection = !isAuthorized ? {rarities: 0, rarityMap: 0} : {};
  let data = await getCollection(collectionId, filter, projection);
  if (!data) {
    const newCollection = await soon.getCollection(collectionId);
    if (!newCollection) {
      console.error(collectionId, 'collection is not a soonaverse collection');
      return null;
    }
    data = await createCollection({...newCollection, collectionType: 'SOONAVERSE'}, projection);
  }
  return data;
};

const getOrCreateNfts = async (isAuthorized: boolean, collectionId: string, limit: number, skip: number, sort: string, order: number, filter = {}): Promise<NftDocuments | RankedNftDocuments> => {
  const collection = await getOrCreateCollection(isAuthorized, collectionId);
  if (!collection) {
    return {total: 0, filtered: 0, items: [], error: 'Collection does not exist on Soonaverse.'};
  } else if (!collection.rarities && collection.total !== collection.sold) {
    console.error(collection.name, collection.uid, 'collection not fully minted');
    return {
      total: 0,
      filtered: 0,
      items: [],
      error: 'This collection has not been fully sold yet. Please ask the owner to upload the rarity data.',
    };
  } else if (Object.keys(blacklist).includes(collectionId)) {
    console.error(collection.name, collection.uid, 'collection blacklisted', collectionBlacklist[collectionId]);
    return {
      total: 0,
      filtered: 0,
      items: [],
      error: collectionBlacklist[collectionId],
    };
  }

  // Get NFT data
  const projection = !isAuthorized ? {rarity: 0, rank: 0, score: 0} : {};
  let data = await getNfts(collectionId, limit, skip, sort, order, filter, projection);
  const nftsHaveNotBeenLoadedYet = !data.items || data.items.length === 0;
  const nftsHaveOnlyBeenLoadedPartly = data.total !== collection.sold;

  if ((nftsHaveNotBeenLoadedYet || nftsHaveOnlyBeenLoadedPartly) && Object.keys(filter).length === 0) {
    const newNfts = await soon.getNftsByCollections([collectionId]);
    let filteredNfts = newNfts
      .filter(nft => !nft.placeholderNft);
    if (nftsHaveOnlyBeenLoadedPartly) {
      filteredNfts = filteredNfts.filter(nft => !data.items.map(nft => nft.name).includes(nft.name));
    }
    const builtTotalRarities = !collection.rarities ? buildTotalRarities(filteredNfts) : collection.rarities;
    if (nftsHaveNotBeenLoadedYet && nftsHaveOnlyBeenLoadedPartly) {
      await updateCollection(collection, {rarities: builtTotalRarities});
    }
    if ((nftsHaveOnlyBeenLoadedPartly && filteredNfts.length !== 0) || nftsHaveNotBeenLoadedYet) {
      const enrichedNfts = getEnrichedNfts(builtTotalRarities, filteredNfts);
      const sortedEnrichedNfts = sortEnrichedNfts(enrichedNfts);
      const rankedNfts = getRankedNfts(sortedEnrichedNfts);
      const builtRarities = !collection.rarityMap ? getRarities(rankedNfts) : collection.rarityMap;
      data = await createNfts(collectionId, enrichNfts(builtRarities, sortedEnrichedNfts, {collectionType: 'SOONAVERSE'}));
    }
  }

  return data;
};

const buildSearchBody = (filter: {}) => {
  const result = {} as { [key: string]: string[] };
  const andFilter = Object.entries(filter)
    .reduce((arr, [key, value]) => {
      const isNonEmptyArray = Array.isArray(value) && value.length > 0;
      if (key === 'name' && isNonEmptyArray) {
        return [...arr, {name: {$regex: `${value}`, $options: 'i'}}];
      } else if (key === 'fromPrice' && isNonEmptyArray) {
        return [...arr, {availablePrice: {$gte: Number(value[0]) * 1000000}}];
      } else if (key === 'toPrice' && isNonEmptyArray) {
        return [...arr, {availablePrice: {$lte: Number(value[0]) * 1000000}}];
      } else if (key === 'fromRank' && isNonEmptyArray) {
        return [...arr, {rank: {$gte: Number(value[0])}}];
      } else if (key === 'toRank' && isNonEmptyArray) {
        return [...arr, {rank: {$lte: Number(value[0])}}];
      } else if (key === 'availability') {
        if (isNonEmptyArray && value[0] === 'available') {
          return [...arr, {available: 1}];
        } else if (isNonEmptyArray && value[0] === 'unavailable') {
          return [...arr, {available: 0}];
        } else {
          return arr;
        }
      } else if (isNonEmptyArray && value.filter(v => v !== '').length > 0) {
        return [...arr, {
          $or: value.map((v) => ({[`properties.${key.replace(' ', '').toLowerCase()}.value`]: v})),
        }];
      } else {
        return arr;
      }
    }, [] as any[]);
  if (andFilter.length > 0) {
    result['$and'] = andFilter;
  }
  return result;
};

export {getOrCreateNfts, getOrCreateCollection, buildSearchBody};
