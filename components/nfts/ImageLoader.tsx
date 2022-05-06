import {RankedNft} from '../../types/RankedNft';
import ImageListItem from '@mui/material/ImageListItem';
import Image from 'next/image';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import ImageList from '@mui/material/ImageList';
import {useRouter} from 'next/router';
import {ReactNode, useEffect, useState} from 'react';

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
  rowsPerPage?: number,
  columns?: number,
  page?: number,
  filter?: {},
  total: number
}

const buildSearchBody = (filter: {}): BodyInit => {
  return JSON.stringify({
    $and: Object.entries(filter).map(([key, value]) => ({[`properties.${key.toLowerCase()}.value`]: value})),
  });
};

const ImageLoader = ({collectionId, rowsPerPage, columns, page, filter, total}: ImageLoaderProps) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState({total: 0, items: []});

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
        setLoading(false);
        setData(data);
      });
  }, [collectionId, rowsPerPage, columns, page, filter]);

  if (isLoading) {
    return <div>Is loading...</div>;
  }

  const handleInfoClick = (nft: RankedNft) => {
    router.push('https://soonaverse.com/nft/' + nft.uid);
  };

  const {items: nfts} = data as ({ items: RankedNft[] });

  const getSubtitle = (nft: RankedNft): ReactNode => {
    if (nft.rank && nft.score) {
      return `Rank: ${nft.rank}/${total}; Score: ${nft.score.toFixed(2)}`;
    }
  };

  return (
    <ImageList sx={{width: 750, height: 750}} cols={columns} rowHeight={250}>
      {nfts.map((nft: RankedNft) => (
        <ImageListItem key={nft.name}>
          <Image
            loader={() => nft.media}
            src="nft.png"
            alt="NFT media"
            layout="fill"
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
                <Image
                  layout="fill"
                  src="/soonaverse.ico"
                  alt="soonaverse favicon"
                />
              </IconButton>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default ImageLoader;
