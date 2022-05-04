import {FunctionComponent} from 'react';
import ImageLoader from './ImageLoader';
import useSWR from 'swr';

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

type NftsViewProps = {
  collectionId: string
}

const NftsView: FunctionComponent<NftsViewProps> = ({collectionId}) => {
  const {data, error} = useSWR(`/api/collections/${collectionId}`, fetcher);

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

  if (!data) {
    return <div>Is loading...</div>;
  }

  console.log(data);

  return (
    <>
      <ImageLoader
        collectionId={collectionId}
        rowsPerPage={3}
        columns={3}
        page={0}
        filter={{}}
        onNftsLoaded={console.log} />
    </>
  );
};

export default NftsView;
