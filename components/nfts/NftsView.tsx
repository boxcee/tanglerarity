import {cloneElement, FunctionComponent} from 'react';
import {useRouter} from 'next/router';
import {RankedNft} from '../../types/RankedNft';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import useSWR from 'swr';

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

type NftsViewProps = {
  collectionId: string
}

const NftsView: FunctionComponent<NftsViewProps> = ({collectionId}) => {
  const router = useRouter();
  const {data, error} = useSWR(`/api/collections/${collectionId}/nfts?limit=15`, fetcher);

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

  if (!data) {
    return <>Is loading...</>;
  }

  const handleViewClick = (nftId: string) => {
    router.push('/collections/' + collectionId + '/nfts/' + nftId);
  };

  const {total, items: nfts} = data;

  return (
    <>
      <List>
        {nfts.map((nft: RankedNft) => cloneElement(
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
