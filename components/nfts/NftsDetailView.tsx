import {FunctionComponent} from 'react';
import useSWR from 'swr';
import LinearProgress from '@mui/material/LinearProgress';

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

type NftsDetailViewProps = {
  collectionId: string
  nftId: string
}

const NftsDetailView: FunctionComponent<NftsDetailViewProps> = ({collectionId, nftId}) => {
  const {data, error} = useSWR(`/api/collections/${collectionId}/nfts/${nftId}`, fetcher);

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

  if (!data) {
    return <LinearProgress sx={{m: 1}} />;
  }

  return (
    <>{JSON.stringify(data, null, 2)}</>
  );
};

export default NftsDetailView;
