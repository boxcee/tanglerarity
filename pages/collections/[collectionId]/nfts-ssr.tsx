import {ChangeEvent, cloneElement, FunctionComponent, useRef} from 'react';
import {EnrichedCollection} from '../../../types/EnrichedCollection';
import {NextApiResponse} from 'next';
import {buildSearchBody, getOrCreateCollection, getOrCreateNfts} from '../../../lib/api';
import {Typography} from '@mui/material';
import Image from 'next/image';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Layout from '../../../components/layout';
import {useRouter} from 'next/router';
import {NextApiRequestQuery} from 'next/dist/server/api-utils';
import {RankedNft} from '../../../types/RankedNft';
import NftCards from '../../../components/nfts/NftCards';

const CARD_COUNT = 7;
const ROW_COUNT = 3;
const CARD_WIDTH = 200;
const CARD_MARGIN_RIGHT = 20;

const defaults = {
  SORT: 'rank',
  ORDER: 'asc',
  PAGE: '1',
  AVAILABILITY: 'all',
  LIMIT: '21',
};

type SearchFilter = {
  [key: string]: string
}

type FieldSelect = {
  [key: string]: string[]
}

type NftsProps = {
  name?: string,
  bannerUrl?: string,
  collectionId: string,
  rarities?: { [key: string]: { [key: string]: number } },
  total: number,
  nfts: RankedNft[],
  filter: SearchFilter,
  select: FieldSelect,
}

type SearchParams = {
  [key: string]: string | string[]
}

const getSearchParams = (searchParams: SearchParams): string => {
  const params = new URLSearchParams();
  Object.keys(searchParams).forEach((key: string) => {
    if (Array.isArray(searchParams[key])) {
      const values = searchParams[key] as string[];
      values.forEach((value: string) => {
        params.append(key, value);
      });
    } else {
      const value = searchParams[key] as string;
      params.append(key, value);
    }
  });
  return params.toString();
};

const NftsSsr: FunctionComponent<NftsProps> = (props) => {
  const {name, bannerUrl, collectionId, rarities, filter, select, nfts, total} = props;

  const router = useRouter();
  const imageContainer = useRef(null);

  const sanitizeKey = (key: string) => (
    key.replace(/[-_]/, ' ').replace(/(^[a-z])|( [a-z])/g, (str: string) => str.toUpperCase())
  );

  const handleSelect = (key: string) => (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    router.push(`/collections/${collectionId}/nfts-ssr?${getSearchParams({
      ...filter, ...select,
      [`s${key}`]: value.filter(v => v),
    })}`);
  };

  const handleInput = (key: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = Array.isArray(event.target.value) ? event.target.value : [event.target.value];
    router.push(`/collections/${collectionId}/nfts-ssr?${getSearchParams({...filter, ...select, [key]: value})}`);
  };

  const handleFilter = (key: string) => (event: SelectChangeEvent) => {
    const value = event.target.value;
    router.push(`/collections/${collectionId}/nfts-ssr?${getSearchParams({...filter, ...select, [key]: value})}`);
  };

  const handleOnClick = () => {
    router.push(`/collections/${collectionId}/nfts-ssr?${getSearchParams(filter)}`);
  };

  const handleOnPage = (event: ChangeEvent<unknown>, page: number) => {
    router.push(`/collections/${collectionId}/nfts-ssr?${getSearchParams({...filter, ...select, page: String(page)})}`);
  };

  let cardCount = CARD_COUNT;
  if (imageContainer.current) {
    const {clientWidth} = imageContainer.current;
    cardCount = Math.floor(clientWidth / (CARD_WIDTH + CARD_MARGIN_RIGHT)) || CARD_COUNT;
  }

  return (
    <Layout user={{}} loading={false}>
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
            {name}
          </Typography>
          <div style={{marginBottom: '38px', alignSelf: 'center'}}>
            {bannerUrl && <Image
              src={`https://res.cloudinary.com/dspyhe3iz/image/fetch/${bannerUrl}`}
              alt="banner img"
              height={200}
              width={200}
              objectFit="cover"
              style={{borderRadius: 10}}
            />}
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
              onChange={handleInput('name')}
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
                onChange={handleInput('fromPrice')}
                value={select['fromPrice'] ? Number(select['fromPrice']) : null}
              />
              <OutlinedInput
                style={{width: 99, borderRadius: 0}}
                placeholder="Max"
                onChange={handleInput('toPrice')}
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
                onChange={handleInput('fromRank')}
                value={select['fromRank'] ? Number(select['fromRank']) : null}
              />
              <OutlinedInput
                style={{width: 99, borderRadius: 0}}
                placeholder="Max"
                onChange={handleInput('toRank')}
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
                  value={(select[`s${key}`] || ['']) as string[]}
                  multiple
                  onChange={handleSelect(key)}
                  renderValue={(selected) => selected.length === 1 && selected[0] === '' ? (
                    <span style={{color: '#9E9E9E', fontWeight: 400, fontFamily: 'Inter'}}>Select Traits</span>
                  ) : (
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                      {(selected as string[]).map((value) => (
                        <Chip size="small" key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {Object.keys(rarities ? rarities[key] : {}).map((trait: string) => cloneElement(
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
                value={filter['sort'] || defaults.SORT}
                onChange={handleFilter('sort')}
                style={{height: 40, borderRadius: 10, width: 137}}
              >
                <MenuItem value="rank">Rank</MenuItem>
                <MenuItem value="availablePrice">Price</MenuItem>
              </Select>
            </div>
            <div style={{marginLeft: '50px', width: 215, display: 'flex', alignItems: 'center'}}>
              <label style={{marginRight: '13px', fontFamily: 'Montserrat', fontWeight: 600}}>Order</label>
              <Select
                value={filter['order'] || defaults.ORDER}
                onChange={handleFilter('order')}
                style={{height: 40, borderRadius: 10, width: 137}}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </div>
            <div style={{marginLeft: '50px', width: 215, display: 'flex', alignItems: 'center'}}>
              <label style={{marginRight: '13px', fontFamily: 'Montserrat', fontWeight: 600}}>Listings</label>
              <Select
                value={filter['availability'] || defaults.AVAILABILITY}
                onChange={handleFilter('availability')}
                style={{height: 40, borderRadius: 10, width: 137}}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="unavailable">Unavailable</MenuItem>
              </Select>
            </div>
          </div>
          <div style={{marginTop: 40}} ref={imageContainer}>
            <NftCards
              total={total}
              nfts={nfts}
            />
          </div>
          <div style={{display: 'flex', width: '100%', justifyContent: 'start'}}>
            <Pagination
              count={Math.ceil(1000 / (cardCount * ROW_COUNT))} //TODO
              onChange={handleOnPage}
              page={filter['page'] ? Number(filter['page']) : 1}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

type ServerSideProps = {
  res: NextApiResponse,
  query: NextApiRequestQuery
}

export async function getServerSideProps({res, query}: ServerSideProps) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
  );

  const {collectionId, limit, skip, sort, order, availability, page, ...other} = query;

  const select = Object.keys(other)
    .filter((key: string) => key.startsWith('s'))
    .reduce((red, key) => {
      if (Array.isArray(other[key])) {
        const value = other[key] as string[];
        return {...red, [key]: value};
      } else {
        const value = other[key] as string;
        return {...red, [key]: [value]};
      }
    }, {} as FieldSelect);

  const collectionData = await getOrCreateCollection(true, collectionId as string, undefined);

  // Defaults
  let props: NftsProps = {
    filter: {},
    select,
    nfts: [],
    total: 0,
    collectionId: collectionId as string,
  };

  let filter: SearchFilter = {};

  if (sort) {
    filter = {
      ...filter,
      sort: sort as string,
    };
  }

  if (order) {
    filter = {
      ...filter,
      order: order as string,
    };
  }

  if (page) {
    filter = {
      ...filter,
      page: page as string,
    };
  }

  if (availability) {
    filter = {
      ...filter,
      availability: availability as string,
    };
  }

  props = {
    ...props,
    filter: {
      ...props.filter,
      ...filter,
    },
  };

  const sanitizedSelect = Object.keys(select).reduce((red, key) => {
    return {...red, [key.replace(/^s/, '')]: select[key]};
  }, {});

  const searchBody = buildSearchBody(sanitizedSelect);

  if (collectionData) {
    const {rarities, name, bannerUrl} = collectionData as EnrichedCollection;

    props = {
      ...props,
      name,
      bannerUrl,
    };

    if (rarities) {
      props = {
        ...props,
        rarities,
      };
    }
  }

  const nftData = await getOrCreateNfts(
    true,
    collectionId as string,
    Number(defaults.LIMIT),
    (Number(filter.page || defaults.PAGE) - 1) * Number(defaults.LIMIT),
    filter.sort || defaults.SORT,
    filter.order || defaults.ORDER === 'asc' ? 1 : 0,
    searchBody,
  );

  if (nftData && nftData.items.length > 0) {
    const {items, total} = nftData;

    // _id cannot be serialized
    items.forEach((item: any) => {
      delete item._id;
    });

    props = {
      ...props,
      total,
      nfts: (items as RankedNft[]) || [],
    };
  }

  return {props};
}

export default NftsSsr;
