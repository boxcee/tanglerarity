import {FunctionComponent} from 'react';
import Image from 'next/image';
import Button from '@mui/material/Button';

type CardProps = {
  img: string,
  name: string,
  rank: string,
  onClick: (uid: string, wenUrl?: string) => void,
  uid: string,
  wenUrl?: string,
};

const Card: FunctionComponent<CardProps> = ({img, name, rank, onClick, uid, wenUrl}) => {
  const handleOnClick = () => {
    onClick(uid, wenUrl);
  };

  return (
    <div
      style={{
        width: 200,
        height: 300,
        marginRight: 20,
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
      }}>
      <Image
        src="nft.png"
        loader={() => img}
        height={200}
        width={200}
        objectFit="cover"
        alt="nft"
        blurDataURL="/placeholder.jpg"
        placeholder="blur"
        style={{borderTopLeftRadius: 10, borderTopRightRadius: 10}}
      />
      <div style={{
        marginLeft: 10,
        marginTop: 5,
        marginRight: 10,
        fontFamily: 'Montserrat',
        fontWeight: 600,
        fontSize: 16,
        color: '#4C5862',
      }}>
        {name}
      </div>
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <div style={{
          marginTop: 5,
          marginLeft: 10,
          marginRight: 10,
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: 14,
          color: '#9E9E9E',
        }}>
          Rank
          <br />
          {rank}
        </div>
        <Button
          onClick={handleOnClick}
          variant="contained"
          style={{
            marginRight: 10,
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: 16,
            backgroundColor: '#C1C6DC',
          }}>
          VIEW
        </Button>
      </div>
    </div>
  );
};

export default Card;
