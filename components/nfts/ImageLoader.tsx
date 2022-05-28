import {RankedNft} from '../../types/RankedNft';
import ImageListItem from '@mui/material/ImageListItem';
import Image from 'next/image';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import ImageList from '@mui/material/ImageList';
import LinearProgress from '@mui/material/LinearProgress';
import {useRouter} from 'next/router';
import {ReactNode, useEffect, useState} from 'react';
import InfoIcon from '@mui/icons-material/Info';

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
  rowsPerPage: number,
  columns?: number,
  page?: number,
  filter?: {},
  total: number,
  onLoaded: (n: number) => void
}

const buildSearchBody = (filter: {}): BodyInit => {
  const result = {} as { [key: string]: string[] };
  const andFilter = Object.entries(filter)
    .reduce((arr, [key, value]) => {
      if (key === 'from' && Array.isArray(value) && value.length > 0) {
        return [...arr, {availablePrice: {$gte: Number(value[0]) * 1000000}}];
      } else if (key === 'to' && Array.isArray(value) && value.length > 0) {
        return [...arr, {availablePrice: {$lte: Number(value[0]) * 1000000}}];
      } else if (key === 'availability') {
        if (Array.isArray(value) && value.length > 0 && value[0] === 'available') {
          return [...arr, {available: 1}];
        } else if (Array.isArray(value) && value.length > 0 && value[0] === 'unavailable') {
          return [...arr, {available: 0}];
        } else {
          return arr;
        }
      } else if (Array.isArray(value) && value.length > 0) {
        return [...arr, {
          $or: value.map((v) => ({[`properties.${key.toLowerCase()}.value`]: v})),
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

const ImageLoader = ({collectionId, rowsPerPage, columns, page, filter, total, onLoaded}: ImageLoaderProps) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState({total: 0, items: []});
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = {
      limit: ((rowsPerPage || 3) * (columns || 3)),
      skip: ((page || 0) * (rowsPerPage || 3) * (columns || 3)),
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
  }, [collectionId, rowsPerPage, columns, page, filter]);

  if (isLoading) {
    return <LinearProgress sx={{m: 1}} />;
  }

  if (error) {
    return <div>Error when loading collection. If you tried loading the first time, please refresh.</div>;
  }

  const handleInfoClick = (nft: RankedNft) => {
    router.push(nft.wenUrl ? nft.wenUrl : 'https://soonaverse.com/nft/' + nft.uid);
  };

  const {items: nfts, total: totalLoaded} = data as ({ items: RankedNft[], total: number });

  const getPrice = (nft: RankedNft) => {
    if (!nft.availablePrice) {
      return '';
    } else {
      let price: string | number = nft.availablePrice / 1000000;
      let unit = '';
      if (price >= 1000000) {
        unit = 'Ti';
        if (price % 1000000 === 0) {
          price = (price / 1000000).toFixed(0);
        } else {
          price = (price / 1000000).toFixed(2);
        }
      } else if (price >= 1000) {
        unit = 'Gi';
        if (price % 1000 === 0) {
          price = (price / 1000).toFixed(0);
        } else {
          price = (price / 1000).toFixed(2);
        }
      } else {
        unit = 'Mi';
        price = price.toFixed(0);
      }
      return `; Price: ${price} ${unit}`;
    }
  };

  const getSubtitle = (nft: RankedNft): ReactNode => {
    if (nft.rank && nft.score) {
      return `Rank: ${nft.rank}/${total}${getPrice(nft)}`;
    }
  };

  onLoaded(totalLoaded);

  return (
    <ImageList sx={{m: 1}} cols={columns} rowHeight={640 / rowsPerPage}>
      {nfts.map((nft: RankedNft) => (
        <ImageListItem key={nft.name}>
          <Image
            loader={() => nft.media}
            src="nft.png"
            alt="NFT media"
            layout="fill"
            placeholder="blur"
            blurDataURL="/placeholder.jpg"
          />
          <ImageListItemBar
            title={nft.name}
            subtitle={getSubtitle(nft)}
            actionIcon={
              <IconButton
                sx={{color: 'rgba(255, 255, 255, 0.54)'}}
                aria-label={`info about ${nft.name}`}
                onClick={() => handleInfoClick(nft)}
              >
                <InfoIcon />
              </IconButton>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default ImageLoader;
