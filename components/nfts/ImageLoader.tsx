import {RankedNft} from '../../types/RankedNft';
import ImageListItem from '@mui/material/ImageListItem';
import Image from 'next/image';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import ImageList from '@mui/material/ImageList';
import {useRouter} from 'next/router';
import useSWR from 'swr';

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

const searcher = (collectionId: string, params: SearchParams): string => {
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
  filter: {},
  onNftsLoaded: (n: number) => void
}

const ImageLoader = ({collectionId, rowsPerPage, columns, page, filter, onNftsLoaded}: ImageLoaderProps) => {
  const router = useRouter();
  const params = {
    limit: ((rowsPerPage || 3) * (columns || 3)),
    skip: ((page || 0) * (rowsPerPage || 3) * (columns || 3)),
  };
  const {data, error} = useSWR(() => searcher(collectionId, params), fetcher);

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

  if (!data) {
    return <div>Is loading...</div>;
  }

  const handleInfoClick = (uid: string) => {
    router.push('/collections/' + collectionId + '/nfts/' + uid);
  };

  const {total, items: nfts} = data;

  onNftsLoaded(total);

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
            subtitle={`Rank: ${nft.rank}; Score: ${nft.score.toFixed(2)}`}
            actionIcon={
              <IconButton
                sx={{color: 'rgba(255, 255, 255, 0.54)'}}
                aria-label={`info about ${nft.name}`}
                onClick={() => handleInfoClick(nft.uid)}
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
