import {Nft} from 'soonaverse/dist/interfaces/models/nft';
import {RankedNft} from '../../types/RankedNft';
import {EnrichedNft} from '../../types/EnrichedNft';

type RarityScores = {
  total: number,
  properties: {
    [key: string]: {
      [key: string]: number
    }
  }
};

type RarityProperty = {
  label: string,
  value: string
}

type RarityProperties = {
  [property: string]: RarityProperty
}

const rarity = (properties: RarityProperties, spec: RarityScores): number => {
  const {total, properties: rarities} = spec;
  return Object.keys(properties).reduce((acc, property) => {
    const {label, value}: { label: string, value: string } = properties[property];
    if (rarities[label.toLowerCase()] && rarities[label.toLowerCase()][value.toLowerCase()]) {
      return acc + 1 / ((rarities[label.toLowerCase()][value.toLowerCase()] * total) / total);
    }
    return acc;
  }, 0);
};

const getTotalRarityScores = (nfts: Nft[]): TotalRarityScores => {
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
  }, {} as TotalRarityScores);
};

type TotalRarityScores = {
  [key: string]: {
    [key: string]: number
  }
}

const enrichNftsWithRarityScores = (totalRarityScores: TotalRarityScores, nfts: Nft[]): RankedNft[] => {
  const totalNfts = nfts.length;
  return nfts.map((nft: Nft): EnrichedNft => {
    const properties = nft.properties;
    const rarity: { [key: string]: { [key: string]: number } } = {};
    let score = 0;
    if (!properties) {
      return {rarity, score, ...nft};
    }
    for (const property of Object.values(properties)) {
      const {label, value} = property;
      if (!rarity[label]) {
        rarity[label] = {};
      }
      rarity[label][value] = totalRarityScores[label][value] / totalNfts;
      score = score + 1 / (totalRarityScores[label][value] / totalNfts);
    }
    return {rarity, score, ...nft};
  })
    .sort((a, b) => b.score - a.score)
    .map((enrichedNft, idx) => ({rank: `${idx + 1}/${totalNfts}`, ...enrichedNft}));
};

export {rarity, enrichNftsWithRarityScores,getTotalRarityScores};
