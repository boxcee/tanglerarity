import {Soon} from 'soonaverse';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';
import {updateNfts} from './mongodb/nfts';

const soon = new Soon();

const runner = async (collectionIds: string[]) => {
  const nfts = await soon.getNftsByCollections(collectionIds);
  const nftsByCollection = nfts.reduce((red, nft) => {
    if (!red[nft.collection]) {
      red[nft.collection] = [];
    }
    red[nft.collection].push(nft);
    return red;
  }, {} as { [key: string]: Nft[] });
  await Promise
    .all(Object.keys(nftsByCollection)
      .map(async (collectionId) => updateNfts(collectionId, nftsByCollection[collectionId])));
};

export default runner;
