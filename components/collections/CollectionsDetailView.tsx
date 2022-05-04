import {FunctionComponent} from 'react';
import {useRouter} from 'next/router';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import useSWR from 'swr';

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

type CollectionDetailsViewProps = {
  collectionId: string
}

const CollectionsDetailView: FunctionComponent<CollectionDetailsViewProps> = ({collectionId}) => {
  const router = useRouter();
  const {data, error} = useSWR(`/api/collections/${collectionId}`, fetcher);

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

  if (!data) {
    return <>Is loading...</>;
  }

  const handleViewClick = () => {
    router.push('/collections/' + collectionId + '/nfts');
  };

  return (
    <>
      <p>View Nfts
        <IconButton edge="end" aria-label="view" onClick={handleViewClick}>
          <VisibilityIcon />
        </IconButton>
      </p>
      {JSON.stringify(data, null, 2)}
    </>
  );
};

export default CollectionsDetailView;
