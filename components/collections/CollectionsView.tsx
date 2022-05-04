import {cloneElement} from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import {Collection} from 'soonaverse/dist/interfaces/models';

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

const CollectionsView = () => {
  const router = useRouter();
  const {data, error} = useSWR('/api/collections', fetcher);

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

  if (!data) {
    return <>Is loading...</>;
  }

  const handleViewClick = (collectionId: string) => {
    router.push('/collections/' + collectionId);
  };

  return (
    <>
      <List>
        {data.map((collection: Collection) => cloneElement(
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="view" onClick={() => handleViewClick(collection.uid)}>
                <VisibilityIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={collection.name}
              secondary={collection.twitter}
            />
          </ListItem>,
          {key: collection.uid},
        ))}
      </List>
    </>
  );
};

export default CollectionsView;
