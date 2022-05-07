import {WithId} from 'mongodb';
import {Collection} from 'soonaverse/dist/interfaces/models/collection';

type CollectionWithRarity = Collection & {
  rarities: {}
};

type CollectionDocument = WithId<CollectionWithRarity>;

type CollectionDocuments = {
  total: number,
  items: CollectionDocument[]
}

export type {CollectionDocuments, CollectionDocument};
