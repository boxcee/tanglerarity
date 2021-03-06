import {ChangeEvent, cloneElement, FunctionComponent, useEffect, useRef, useState} from 'react';
import ImageLoader from './ImageLoader';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import useSWR from 'swr';
import {EnrichedCollection} from '../../types/EnrichedCollection';
import LinearProgress from '@mui/material/LinearProgress';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Image from 'next/image';
import SearchIcon from '@mui/icons-material/Search';
import {Typography} from '@mui/material';
import config from '../config';

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

type NftsViewProps = {
  collectionId: string
}

const CARD_COUNT = 7;
const ROW_COUNT = 3;

const NftsView: FunctionComponent<NftsViewProps> = ({collectionId}) => {
  const imageContainer = useRef(null);
  const [select, setSelect] = useState({} as ({ [key: string]: string[] }));
  const [sort, setSort] = useState({key: 'rank', order: 'asc'} as ({ [key: string]: string }));
  const [page, setPage] = useState(0);
  const [filteredLoaded, setFilteredLoaded] = useState<number | null>(null);
  const {data, error} = useSWR(`/api/collections/${collectionId}`, fetcher);
  const [cardDimensions, setCardDimensions] = useState({
    clientWidth: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      if (imageContainer.current) {
        const {clientWidth} = imageContainer.current;
        setCardDimensions({clientWidth});
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

  if (!data) {
    return <LinearProgress sx={{m: 1}} />;
  }

  const handleOnChange = (key: string, event: SelectChangeEvent<string[]>) => {
    const value = Array.isArray(event.target.value) ? event.target.value : [event.target.value];
    const newValue = value.filter(v => v !== '');
    setSelect({
      ...select,
      [key]: newValue.length === 0 ? [''] : newValue,
    });
    setPage(0);
  };

  const handleOnSort = (key: string, event: SelectChangeEvent<string[]>) => {
    setSort({
      ...sort,
      [key]: Array.isArray(event.target.value) ? event.target.value[0] : event.target.value,
    });
    setPage(0);
  };

  let cardCount = CARD_COUNT;
  if (imageContainer.current) {
    const {clientWidth} = imageContainer.current;
    cardCount = Math.floor(clientWidth / (config.CARD_WIDTH + config.CARD_RIGHT_MARGIN)) || CARD_COUNT;
  }
  if (cardDimensions.clientWidth) {
    cardCount = Math.floor(cardDimensions.clientWidth / (config.CARD_WIDTH + config.CARD_RIGHT_MARGIN)) || CARD_COUNT;
  }

  const handleOnPage = (event: ChangeEvent<unknown>, page: number) => {
    setPage(page - 1);
  };

  const handleOnClick = () => {
    setSelect({});
  };

  const handleOnCustom = (key: string) => (event: ChangeEvent<HTMLInputElement>) => {
    setSelect(prevState => ({
      ...prevState,
      [key]: Number.isNaN(Number(event.target.value)) ? ['0'] : [`${event.target.value}`],
    }));
    setPage(0);
  };

  const sanitizeKey = (key: string) => (
    key.replace(/[-_]/, ' ').replace(/(^[a-z])|( [a-z])/g, (str: string) => str.toUpperCase())
  );

  const {rarities, total, collectionType} = data as (EnrichedCollection & { collectionType: string });

  const filtersUsed = Object.keys(select)
    .filter(key => key !== 'availability')
    .filter(key => select[key] && select[key].length > 0 && select[key][0] !== '').length > 0;

  return (
    <div style={{display: 'flex', padding: '20px 0 0 0', margin: '4rem 0 0', height: '100%'}}>
      <div style={{
        width: 400,
        marginRight: 40,
        backgroundColor: '#fff',
        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
        borderRadius: '0 12px 12px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        paddingLeft: 29,
        paddingRight: 29,
        borderBottomRightRadius: 0,
      }}>
        <Typography
          sx={{
            fontFamily: 'Montserrat',
            fontWeight: 500,
            marginTop: '14px',
            marginLeft: '60px',
            marginRight: '60px',
            fontSize: '24px',
            marginBottom: '7px',
          }}
          align="center"
        >
          {data.name}
        </Typography>
        <div style={{marginBottom: '38px', alignSelf: 'center'}}>
          <Image
            src="banner.png"
            loader={() => data.bannerUrl}
            alt="banner img"
            height={200}
            width={200}
            objectFit="cover"
            style={{borderRadius: 10}}
          />
        </div>
        <FormControl sx={{width: 259, alignSelf: 'center'}} style={{marginBottom: 16}} variant="outlined">
          <InputLabel
            style={{fontFamily: 'Inter', fontWeight: 400, fontSize: 16, color: '#9E9E9E'}}
            htmlFor="outlined-adornment-name">
            Name Search
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-name"
            type="search"
            value={select['name']}
            onChange={handleOnCustom('name')}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="apply name filter"
                  onClick={() => {
                  }}
                  edge="end"
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
            label="Name Search"
          />
        </FormControl>
        <div style={{display: 'flex', width: 259, alignSelf: 'center', flexDirection: 'column', marginBottom: 16}}>
          <Typography
            sx={{width: 259, fontFamily: 'Montserrat', fontWeight: 600, fontSize: 16, color: '#4C5862'}}
            style={{paddingLeft: 12, marginBottom: 5}}
          >
            Price
          </Typography>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <OutlinedInput
              style={{width: 99, borderTopRightRadius: 0, borderBottomRightRadius: 0}}
              placeholder="Min"
              onChange={handleOnCustom('fromPrice')}
              value={select['fromPrice'] ? Number(select['fromPrice']) : null}
            />
            <OutlinedInput
              style={{width: 99, borderRadius: 0}}
              placeholder="Max"
              onChange={handleOnCustom('toPrice')}
              value={select['toPrice'] ? Number(select['toPrice']) : null}
            />
            <Button variant="contained" style={{
              borderTopLeftRadius: 0,
              borderTopRightRadius: 10,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 10,
            }}>GO</Button>
          </div>
        </div>
        <div style={{display: 'flex', width: 259, alignSelf: 'center', flexDirection: 'column', marginBottom: 16}}>
          <Typography
            sx={{width: 259, fontFamily: 'Montserrat', fontWeight: 600, fontSize: 16, color: '#4C5862'}}
            style={{paddingLeft: 12, marginBottom: 5}}
          >
            Rank
          </Typography>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <OutlinedInput
              style={{width: 99, borderTopRightRadius: 0, borderBottomRightRadius: 0}}
              placeholder="Min"
              onChange={handleOnCustom('fromRank')}
              value={select['fromRank'] ? Number(select['fromRank']) : null}
            />
            <OutlinedInput
              style={{width: 99, borderRadius: 0}}
              placeholder="Max"
              onChange={handleOnCustom('toRank')}
              value={select['toRank'] ? Number(select['toRank']) : null}
            />
            <Button variant="contained" style={{
              borderTopLeftRadius: 0,
              borderTopRightRadius: 10,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 10,
            }}>GO</Button>
          </div>
        </div>
        {Object.keys((rarities || {})).map((key: string) => cloneElement((
          <div style={{marginBottom: 16, alignSelf: 'center'}}>
            <Typography
              sx={{width: 259, fontFamily: 'Montserrat', fontWeight: 600, fontSize: 16, color: '#4C5862'}}
              style={{paddingLeft: 12, marginBottom: 5}}
            >
              {sanitizeKey(key)}
            </Typography>
            <FormControl sx={{width: 259}}>
              <Select
                value={(select[key] || [''])}
                multiple
                onChange={(event) => handleOnChange(key, event)}
                renderValue={(selected) => selected.length === 1 && selected[0] === '' ? (
                  <span style={{color: '#9E9E9E', fontWeight: 400, fontFamily: 'Inter'}}>Select Traits</span>
                ) : (
                  <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                    {selected.map((value) => (
                      <Chip size="small" key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {Object.keys(rarities[key]).map((trait: string) => cloneElement(
                  (<MenuItem value={trait}>{trait}</MenuItem>)
                  , {key: trait}))}
              </Select>
            </FormControl>
          </div>
        ), {key}))}
        <FormControl sx={{width: 259, alignSelf: 'center', marginBottom: 16}}>
          <Button onClick={handleOnClick} variant="contained">CLEAR ALL</Button>
        </FormControl>
      </div>
      <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
        <div style={{
          backgroundColor: '#fff', height: 75, filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
          borderRadius: '12px 0 0 12px',
          flexDirection: 'row',
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{marginLeft: '30px', width: 215, display: 'flex', alignItems: 'center'}}>
            <label style={{marginRight: '13px', fontFamily: 'Montserrat', fontWeight: 600}}>Sort by</label>
            <Select
              value={[(sort['key'] || 'rank')]}
              onChange={(event) => handleOnSort('key', event)}
              style={{height: 40, borderRadius: 10, width: 137}}
            >
              <MenuItem value="rank">Rank</MenuItem>
              <MenuItem value="availablePrice">Price</MenuItem>
            </Select>
          </div>
          <div style={{marginLeft: '50px', width: 215, display: 'flex', alignItems: 'center'}}>
            <label style={{marginRight: '13px', fontFamily: 'Montserrat', fontWeight: 600}}>Order</label>
            <Select
              value={[(sort['order'] || 'asc')]}
              onChange={(event) => handleOnSort('order', event)}
              style={{height: 40, borderRadius: 10, width: 137}}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </div>
          {collectionType === 'SOONAVERSE' ? (
            <div style={{marginLeft: '50px', width: 215, display: 'flex', alignItems: 'center'}}>
              <label style={{marginRight: '13px', fontFamily: 'Montserrat', fontWeight: 600}}>Listings</label>
              <Select
                value={select['availability'] || 'all'}
                onChange={(event) => handleOnChange('availability', event)}
                style={{height: 40, borderRadius: 10, width: 137}}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="unavailable">Unavailable</MenuItem>
              </Select>
            </div>) : null}
        </div>
        <div style={{marginTop: 40}} ref={imageContainer}>
          <ImageLoader
            collectionId={collectionId}
            cardsPerRow={cardCount}
            rows={ROW_COUNT}
            page={page}
            filter={select}
            total={total}
            sort={sort}
            setFiltered={setFilteredLoaded}
          />
          {filteredLoaded && filteredLoaded === 0 ? (
            <div
              style={{
                fontFamily: 'Montserrat',
                fontWeight: 500, fontSize: 24,
              }}
            >
              No matching NFTs found.
            </div>
          ) : null}
        </div>
        {filteredLoaded && filteredLoaded !== 0 ? (
          <div style={{display: 'flex', width: '100%', justifyContent: 'start'}}>
            <Pagination
              count={Math.ceil((filtersUsed ? filteredLoaded : total) / (cardCount * ROW_COUNT))}
              onChange={handleOnPage}
              page={page + 1}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NftsView;
