import {FunctionComponent, useEffect, useState} from 'react';
import {RankedNft} from '../../types/RankedNft';

type NftsDetailViewProps = {
  collectionId: string
  nftId: string
}

const NftsDetailView: FunctionComponent<NftsDetailViewProps> = ({collectionId, nftId}) => {
  const [isLoading, setLoading] = useState(false);
  const [nft, setNft] = useState({} as RankedNft);

  useEffect(() => {
    setLoading(true);
    fetch('/api/collections/' + collectionId + '/nfts/' + nftId)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        setNft(data);
      });
  }, [collectionId, nftId]);

  if (isLoading) {
    return <>Is loading...</>;
  }

  return (
    <>{JSON.stringify(nft, null, 2)}</>
  );
};

export default NftsDetailView;
