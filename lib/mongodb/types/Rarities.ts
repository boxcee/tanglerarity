import {WithId} from 'mongodb';

type RarityDocument = WithId<RarityWrapper>;

type RarityWrapper = {
  totalRarities?: TotalRarities,
  rarities?: Rarities
}

type TotalRarities = {
  [key: string]: {
    [key: string]: number
  }
}

type Rarities = {
  [key: string]: Rarity
}

type Rarity = {
  rarity: {
    [key: string]: {
      [key: string]: number
    }
  },
  score: number,
  rank: number
}

export type {RarityDocument, TotalRarities, Rarities};
