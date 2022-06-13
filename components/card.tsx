import {FunctionComponent, MouseEvent, useState} from 'react';
import Image from 'next/image';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import config from '../components/config';

type CardProps = {
  img: string,
  name: string,
  rank: string,
  price?: number,
  properties?: { [key: string]: { value: string, label: string } },
  onClick: (uid: string, wenUrl?: string) => void,
  uid: string,
  wenUrl?: string,
  type: string,
};

const formatPrice = (price: number): string => {
  let mi = price / 1000000;
  let result = '';
  if (mi >= 1000000) {
    mi = mi / 1000000;
    result = 'Ti';
  } else if (mi >= 1000) {
    mi = mi / 1000;
    result = 'Gi';
  } else {
    result = 'Mi';
  }
  return `${mi.toFixed(mi % 1 > 0 ? 2 : 0)} ${result}`;
};

const sanitizeKey = (key: string) => (
  key.replace(/[-_]/, ' ').replace(/(^[a-z])|( [a-z])/g, (str: string) => str.toUpperCase())
);

const Card: FunctionComponent<CardProps> = (props) => {
  const {img, name, rank, price, properties, onClick, uid, wenUrl, type} = props;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOnClick = () => {
    onClick(uid, wenUrl);
  };

  const handlePopoverOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const getButton = () => (
    <Button
      onClick={handleOnClick}
      variant="contained"
      disabled={type !== 'SOONAVERSE'}
      style={{
        marginRight: 10,
        fontFamily: 'Inter',
        fontWeight: 600,
        fontSize: 16,
        backgroundColor: '#C1C6DC',
        height: 40,
      }}>
      VIEW
    </Button>
  );

  return (
    <div
      style={{
        width: config.CARD_WIDTH,
        height: config.CARD_HEIGHT,
        marginRight: config.CARD_RIGHT_MARGIN,
        marginBottom: config.CARD_BOTTOM_MARGIN,
        backgroundColor: '#fff',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
      }}
    >
      <Image
        src="nft.png"
        loader={() => img}
        height={config.CARD_WIDTH}
        width={config.CARD_WIDTH}
        objectFit="cover"
        alt="nft"
        blurDataURL="/placeholder.jpg"
        placeholder="blur"
        style={{borderTopLeftRadius: 10, borderTopRightRadius: 10}}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      />
      <div style={{
        marginLeft: 10,
        marginTop: 5,
        marginRight: 10,
        fontFamily: 'Montserrat',
        fontWeight: 600,
        fontSize: 16,
        color: '#4C5862',
        minHeight: 40,
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
          minHeight: 60,
        }}>
          Rank<br />{rank}
        </div>
        {type !== 'SOONAVERSE'
          ? (
            <Tooltip title="Not a Soonaverse collection." followCursor>
            <span>
              {getButton()}
            </span>
            </Tooltip>
          )
          : getButton()
        }
      </div>
      {properties ? <Popover
        sx={{
          pointerEvents: 'none',
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
      >
        <div
          style={{
            minHeight: 300,
            width: 200,
            padding: 10,
            backgroundColor: '#fff',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: 14,
            color: '#9E9E9E',
          }}>
          {price ? (<div style={{marginBottom: 5}}><strong>Price</strong><br />{formatPrice(price)}<br /></div>) : null}
          {Object.keys(properties).map((key: string) => {
            return (
              <div key={key} style={{marginBottom: 5}}>
                <strong>{sanitizeKey(key)}</strong>
                <br />
                {properties[key].value}
              </div>);
          })}
        </div>
      </Popover> : null}
    </div>
  );
};

export default Card;
