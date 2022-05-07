import {Collection} from 'soonaverse/dist/interfaces/models/collection';

export type EnrichedCollection = Collection & {
  rarities: {
    [key: string]: {
      [key: string]: number
    }
  }
}
