import {NextApiRequest, NextApiResponse} from "next";
import {getNft} from "../../../lib/mongodb/collections";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const uid = String(req.query.nft);
    const collectionUid = String(req.query.collection);

    const nft = await getNft(collectionUid, uid);

    res.status(200).json(nft);
};
