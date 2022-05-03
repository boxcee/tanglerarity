import {FunctionComponent, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';

type CollectionDetailsViewProps = {
  collectionId: string
}

const CollectionsDetailView: FunctionComponent<CollectionDetailsViewProps> = ({collectionId}) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [collection, setCollection] = useState({});

  useEffect(() => {
    setLoading(true);
    fetch('/api/collections/' + collectionId)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        setCollection(data);
      });
  }, [collectionId]);

  if (isLoading) {
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
      {JSON.stringify(collection, null, 2)}
    </>
  );
};

export default CollectionsDetailView;
