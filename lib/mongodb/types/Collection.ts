import {WithId} from 'mongodb';
import {Collection} from 'soonaverse/dist/interfaces/models/collection';
import {Rarities} from './Rarities';

type CollectionWithRarity = Collection & {
  rarities: {}
  rarityMap: Rarities
};

type CollectionDocument = WithId<CollectionWithRarity>;

type CollectionDocuments = {
  total: number,
  items: CollectionDocument[]
}

export type {CollectionDocuments, CollectionDocument};
