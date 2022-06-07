import {Nft} from 'soonaverse/dist/interfaces/models/nft';
import {RankedNft} from '../../types/RankedNft';
import {EnrichedNft} from '../../types/EnrichedNft';
import {Rarities} from '../mongodb/types/Rarities';

const buildTotalRarities = (nfts: (Nft | EnrichedNft | RankedNft)[]): TotalRarities => {
  const total = nfts.length;
  if (total === 0 || !nfts[0].properties) {
    throw new Error();
  }
  return nfts.reduce((obj, nft) => {
    Object.values(nft.properties).forEach(({label, value}: { label: string, value: string }) => {
      if (obj[label]) {
        if (obj[label][value]) {
          obj[label][value] += 1;
        } else {
          obj[label][value] = 1;
        }
      } else {
        obj[label] = {[value]: 1};
      }
    });
    return obj;
  }, {} as TotalRarities);
};

type TotalRarities = {
  [key: string]: {
    [key: string]: number
  }
}

const getNameWithNumber = (name: string, idx: number) => {
  if (/\d+/.test(name)) {
    return name.trim();
  } else {
    return `${name.trim()} #${idx}`;
  }
};

const getEnrichedNfts = (totalRarityScores: TotalRarities, nfts: Nft[]): EnrichedNft[] => {
  const totalNfts = nfts.length;
  return nfts
    .map((nft: Nft): EnrichedNft => {
      const properties = nft.properties;
      const rarity: { [key: string]: { [key: string]: number } } = {};
      let score = 0;
      if (properties) {
        for (const property of Object.values(properties)) {
          const {label, value} = property;
          if (!rarity[label]) {
            rarity[label] = {};
          }
          rarity[label][value] = totalRarityScores[label][value] / totalNfts;
          score = score + 1 / (totalRarityScores[label][value] / totalNfts);
        }
      }
      return {rarity, score, ...nft};
    });
};

const sortEnrichedNfts = (nfts: EnrichedNft[]): EnrichedNft[] => {
  return nfts.sort((a: EnrichedNft, b: EnrichedNft) => b.score - a.score);
};

const getRankedNfts = (nfts: EnrichedNft[]): RankedNft[] => {
  return nfts.map((eNft: EnrichedNft, idx: number): RankedNft => ({...eNft, rank: idx + 1}));
};

const getRarities = (nfts: RankedNft[]): Rarities => {
  return nfts
    .reduce((acc: Rarities, {name, rarity, score, rank}: RankedNft, idx: number) => {
      acc[getNameWithNumber(name, idx)] = {rarity, score, rank};
      return acc;
    }, {} as Rarities);
};

const enrichNfts = (rarities: Rarities, nfts: Nft[]): RankedNft[] => {
  return nfts.map((nft: Nft, idx: number): RankedNft => {
    const {rarity, score, rank} = rarities[getNameWithNumber(nft.name, idx)];
    return {...nft, rarity, score, rank};
  });
};

export {getRarities, buildTotalRarities, enrichNfts, sortEnrichedNfts, getRankedNfts, getEnrichedNfts};
