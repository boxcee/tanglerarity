import {NextApiRequest, NextApiResponse} from "next";
import {createCollection, createNfts, getCollection, getNfts} from "../../../lib/mongodb/collections";
import {Soon} from 'soonaverse';
import {enrichNftsWithRarityScores} from "../../../lib/utils/rarity";

const soon = new Soon();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const uid = String(req.query.collection);
    const limit = Number(req.query.limit) || 10;
    const skip = Number(req.query.skip) || 0;
    const filter = Array.isArray(req.query.filter) ? req.query.filter[0] : req.query.filter || '';

    let collection = await getCollection(uid);
    if (!collection) {
        const newCollection = await soon.getCollection(uid);
        collection = await createCollection(newCollection);
    }

    let {total, nfts} = await getNfts(uid, limit, skip, {name: {$regex: new RegExp(filter, 'i')}});
    if ((!nfts || nfts.length === 0) && (collection.total === collection.sold)) {
        const newNfts = await soon.getNftsByCollections([uid]);
        const enrichedNfts = enrichNftsWithRarityScores(newNfts);
        nfts = await createNfts(uid, enrichedNfts);
    }

    res.status(200).json({total, nfts});
};
