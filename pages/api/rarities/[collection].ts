import type {NextApiRequest, NextApiResponse} from 'next'
import fs from 'fs';
import path from 'path';

type RarityProperties = {
    [key: string]: number
}

type RarityTable = {
    total: number,
    properties: RarityProperties
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<RarityTable>
) {
    try {
        const jsonPath = path.join(process.cwd(), 'rarities', req.query.collection + '.json');
        const jsonFile = fs.readFileSync(jsonPath, 'utf-8');
        res.status(200).json(JSON.parse(jsonFile));
    } catch (err) {
        res.status(404);
    }
}
