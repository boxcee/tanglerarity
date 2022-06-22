import {FunctionComponent, useMemo} from 'react';
import {RankedNft} from '../../types/RankedNft';
import Card from '../card';

type NftCardsProps = {
  total: number,
  nfts: RankedNft[]
}

const NftCards: FunctionComponent<NftCardsProps> = ({total, nfts}) => {
  const handleInfoClick = (uid: string, wenUrl?: string) => {
    window.open(wenUrl ? wenUrl : 'https://soonaverse.com/nft/' + uid, '_blank');
  };

  const cards = useMemo(() => (
    nfts.map((nft: any, idx: number) => (
      <Card
        key={`${nft.name}${idx}`}
        img={nft.media}
        name={nft.name}
        rank={`${nft.rank}/${total}`}
        uid={nft.uid}
        wenUrl={nft.wenUrl}
        price={nft.availablePrice}
        properties={nft.properties}
        type={nft.collectionType}
        onClick={handleInfoClick}
        score={nft.score}
      />
    ))
  ), [nfts, total]);

  return (
    <div style={{display: 'flex', justifyContent: 'start', flexWrap: 'wrap'}}>
      {cards}
    </div>
  );
};

export default NftCards;
