import {WithId} from 'mongodb';
import {Collection} from 'soonaverse/dist/interfaces/models/collection';

type CollectionDocument = WithId<Collection>;

type CollectionDocuments = {
  total: number,
  items: CollectionDocument[]
}

export type {CollectionDocuments, CollectionDocument};
