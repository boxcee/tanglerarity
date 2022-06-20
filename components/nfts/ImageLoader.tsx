import {RankedNft} from '../../types/RankedNft';
import LinearProgress from '@mui/material/LinearProgress';
import {useEffect, useState} from 'react';
import NftCards from './NftCards';

const getUrl = (collectionId: string, params: SearchParams): string => {
  const url: URL = new URL(`/api/collections/${collectionId}/nfts`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  return url.toString();
};

type SearchParams = {
  limit?: number
  skip?: number
  sort?: string
  order?: string
}

type ImageLoaderProps = {
  collectionId: string,
  cardsPerRow: number,
  rows: number,
  page?: number,
  filter?: {},
  total: number,
  onLoaded: (n: number) => void,
  sort: { [key: string]: string }
}

const buildSearchBody = (filter: {}): BodyInit => {
  const result = {} as { [key: string]: string[] };
  const andFilter = Object.entries(filter)
    .reduce((arr, [key, value]) => {
      const isNonEmptyArray = Array.isArray(value) && value.length > 0;
      if (key === 'name' && isNonEmptyArray) {
        return [...arr, {name: {$regex: `${value}`, $options: 'i'}}];
      } else if (key === 'fromPrice' && isNonEmptyArray) {
        return [...arr, {availablePrice: {$gte: Number(value[0]) * 1000000}}];
      } else if (key === 'toPrice' && isNonEmptyArray) {
        return [...arr, {availablePrice: {$lte: Number(value[0]) * 1000000}}];
      } else if (key === 'fromRank' && isNonEmptyArray) {
        return [...arr, {rank: {$gte: Number(value[0])}}];
      } else if (key === 'toRank' && isNonEmptyArray) {
        return [...arr, {rank: {$lte: Number(value[0])}}];
      } else if (key === 'availability') {
        if (isNonEmptyArray && value[0] === 'available') {
          return [...arr, {available: 1}];
        } else if (isNonEmptyArray && value[0] === 'unavailable') {
          return [...arr, {available: 0}];
        } else {
          return arr;
        }
      } else if (isNonEmptyArray && value.filter(v => v !== '').length > 0) {
        return [...arr, {
          $or: value.map((v) => ({[`properties.${key.replace(' ', '').toLowerCase()}.value`]: v})),
        }];
      } else {
        return arr;
      }
    }, [] as any[]);
  if (andFilter.length > 0) {
    result['$and'] = andFilter;
  }
  return JSON.stringify(result);
};

const DEFAULT_CARDS_PER_ROW = 7;
const DEFAULT_ROWS = 3;

const ImageLoader = ({collectionId, cardsPerRow, rows, page, filter, total, onLoaded, sort}: ImageLoaderProps) => {
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState({total: 0, items: []});
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = {
      limit: (cardsPerRow || DEFAULT_CARDS_PER_ROW) * (rows || DEFAULT_ROWS),
      skip: (page || 0) * (cardsPerRow || DEFAULT_CARDS_PER_ROW) * (rows || DEFAULT_ROWS),
      sort: (sort['key'] || 'rank'),
      order: (sort['order'] || 'asc'),
    };
    const options = {
      method: filter && Object.keys(filter).length > 0 ? 'POST' : 'GET',
      body: filter && Object.keys(filter).length > 0 ? buildSearchBody(filter) : null,
    };
    setLoading(true);
    fetch(getUrl(collectionId, params), options)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
        setError(null);
      })
      .catch(setError);
  }, [collectionId, cardsPerRow, rows, page, filter, sort]);

  const {items: nfts} = data as ({ items: RankedNft[] });

  if (isLoading) {
    return <LinearProgress sx={{m: 1}} />;
  }

  if (error) {
    return <div>Error when loading collection. If you tried loading the first time, please refresh.</div>;
  }

  onLoaded(nfts.length);

  return <NftCards total={total} nfts={nfts} />;
};

export default ImageLoader;
