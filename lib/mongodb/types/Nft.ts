import {WithId} from 'mongodb';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';

type NftDocument = WithId<Nft>;

type NftDocuments = {
  total: number,
  filtered: number,
  error?: string,
  items: NftDocument[]
}

export type {NftDocuments, NftDocument};
