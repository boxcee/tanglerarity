import {Soon} from 'soonaverse';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';
import {updateNfts} from './mongodb/nfts';

const soon = new Soon();

const update = async (collectionIds: string[]) => {
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

const runner = async (collectionIds: string[]) => {
  if (collectionIds.length <= 10) {
    await update(collectionIds);
  } else {
    let ids = collectionIds;
    while (ids.length > 0) {
      ids = ids.splice(0, 10);
      await update(ids);
    }
  }
};

export default runner;
