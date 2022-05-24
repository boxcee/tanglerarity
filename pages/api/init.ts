import {NextApiRequest, NextApiResponse} from 'next';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://soonaverse.com/market/collections');
  await page.setViewport({width: 2960, height: 1440});
  await page.waitForSelector('article');
  let urls: any[] = [];
  try {
    let previousHeight;
    while (urls.length < 850) {
      urls = await page.evaluate(() => {
        const hrefs = [];
        const articles = document.getElementsByTagName('article');
        for (let i = 0; i < articles.length; i++) {
          const node = articles[i];
          const href = node.lastElementChild!.getAttribute('href');
          hrefs.push(href!.replace('/collection/', ''));
        }
        return hrefs;
      });
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitForTimeout(800);
    }
  } catch (error) {
    console.error('error', error);
  }
  const port = process.env.PORT || 3000;
  let count = 0;
  for (let i = 0; i < urls.length; i++) {
    await fetch(`http://localhost:${port}/api/collections/${urls[i]}/nfts`);
    console.log(count++);
  }
  res.status(200).send(urls.length);
};
