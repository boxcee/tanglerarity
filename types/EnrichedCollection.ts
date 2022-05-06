import {Collection} from 'soonaverse/dist/interfaces/models/collection';

export type EnrichedCollection = Collection & {
  totalRarities: {
    [key: string]: {
      [key: string]: number
    }
  }
}
