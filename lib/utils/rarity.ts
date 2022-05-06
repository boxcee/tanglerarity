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

const buildRarities = (totalRarityScores: TotalRarities, nfts: Nft[]): Rarities => {
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
    })
    .sort((a: EnrichedNft, b: EnrichedNft) => b.score - a.score)
    .map((eNft: EnrichedNft, idx: number): RankedNft => ({...eNft, rank: idx + 1}))
    .reduce((acc: Rarities, {uid, rarity, score, rank}: RankedNft) => {
      acc[uid] = {rarity, score, rank};
      return acc;
    }, {} as Rarities);
};

const enrichNfts = (rarities: Rarities, nfts: Nft[]): RankedNft[] => {
  return nfts.map((nft: Nft): RankedNft => {
    const {rarity, score, rank} = rarities[nft.uid];
    return {...nft, rarity, score, rank};
  });
};

export {buildRarities, buildTotalRarities, enrichNfts};
