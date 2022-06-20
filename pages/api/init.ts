import {NextApiRequest, NextApiResponse} from 'next';
import puppeteer from 'puppeteer';
import PQueue from 'p-queue';
import {getOrCreateNfts} from '../../lib/api';
import {getCollection} from '../../lib/mongodb/collections';

const queue = new PQueue({concurrency: 2, interval: 60000});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://soonaverse.com/market/collections');
    await page.setViewport({width: 2960, height: 1440});
    await page.waitForSelector('article');
    let urls: any[] = [];
    try {
      let previousHeight;
      while (urls.length < 995) {
        urls = await page.evaluate(() => {
          const hrefs = [];
          const articles = document.getElementsByTagName('article');
          for (let i = 0; i < articles.length; i++) {
            const node = articles[i];
            const aElement = node.getElementsByTagName('a')[0];
            const href = aElement.getAttribute('href');
            hrefs.push(href!.replace('/collection/', ''));
          }
          return hrefs;
        });
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, {timeout: 1000 * 60});
      }
    } catch (error) {
      console.error('error', error);
    }
    res.status(200).send(urls);
  } else if (req.method === 'POST') {
    const {body: collectionIds} = req;
    await Promise.all(collectionIds.map(async (collectionId: string) => {
      return queue.add(async () => {
        const collection = await getCollection(collectionId);
        if (!collection) {
          await getOrCreateNfts(true, collectionId, 1, 0, 'uid', 1, undefined);
          return collectionId;
        }
        return null;
      });
    })).then((createdCollectionIds) => {
      res.status(201).send(createdCollectionIds.filter(c => c));
    }).catch(error => {
      console.error(error);
      res.status(500).send('Error');
    });
  } else {
    res.status(405).send('not implemented');
  }
};
