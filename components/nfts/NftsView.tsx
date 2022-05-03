import {cloneElement, FunctionComponent, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {RankedNft} from '../../types/RankedNft';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';

type NftsViewProps = {
  collectionId: string
}

const NftsView: FunctionComponent<NftsViewProps> = ({collectionId}) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [nftData, setNftData] = useState({total: 0, items: []} as { total: number, items: RankedNft[] });

  useEffect(() => {
    setLoading(true);
    fetch('/api/collections/' + collectionId + '/nfts?limit=15')
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        setNftData(data);
      });
  }, [collectionId]);

  if (isLoading) {
    return <>Is loading...</>;
  }

  const handleViewClick = (nftId: string) => {
    router.push('/collections/' + collectionId + '/nfts/' + nftId);
  };

  const {total, items: nfts} = nftData;

  return (
    <>
      <List>
        {nfts.map(nft => cloneElement(
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="view" onClick={() => handleViewClick(nft.uid)}>
                <VisibilityIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={nft.name}
              secondary={nft.rank}
            />
          </ListItem>,
          {key: nft.uid},
        ))}
      </List>
    </>
  );
};

export default NftsView;
