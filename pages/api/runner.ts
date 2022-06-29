import {NextApiRequest, NextApiResponse} from 'next';
import {getCollections} from '../../lib/mongodb/collections';
import runner from '../../lib/runner';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const {items} = await getCollections(undefined, undefined, undefined, undefined, undefined);
    await runner(items.map(c => c.uid));
    console.log('runner complete');
    res.status(200).end();
  }
};
