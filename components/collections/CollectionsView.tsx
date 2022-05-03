import {cloneElement, useEffect, useState} from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {Collection} from 'soonaverse/dist/interfaces/models';
import {useRouter} from 'next/router';

const CollectionsView = () => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [collections, setCollections] = useState([] as Collection[]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        setCollections(data);
      });
  }, []);

  if (isLoading) {
    return <>Is loading...</>;
  }

  const handleViewClick = (collectionId: string) => {
    router.push('/collections/' + collectionId);
  };

  return (
    <>
      <List>
        {collections.map(collection => cloneElement(
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
