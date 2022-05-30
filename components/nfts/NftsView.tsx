import {ChangeEvent, cloneElement, FunctionComponent, useState} from 'react';
import ImageLoader from './ImageLoader';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import FormGroup from '@mui/material/FormGroup';
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

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

type NftsViewProps = {
  collectionId: string
}

const ROWS_PER_PAGE = 3;
const COLUMNS_PER_PAGE = 6;

const NftsView: FunctionComponent<NftsViewProps> = ({collectionId}) => {
  const [select, setSelect] = useState({} as ({ [key: string]: string[] }));
  const [sort, setSort] = useState({key: 'rank', order: 'asc'} as ({ [key: string]: string }));
  const [checked, setChecked] = useState(false);
  const [page, setPage] = useState(0);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const {data, error} = useSWR(`/api/collections/${collectionId}`, fetcher);

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

  if (!data) {
    return <LinearProgress sx={{m: 1}} />;
  }

  const handleOnChange = (key: string, event: SelectChangeEvent<string[]>) => {
    setSelect({
      ...select,
      [key]: Array.isArray(event.target.value) ? event.target.value : [event.target.value],
    });
  };

  const handleOnSort = (key: string, event: SelectChangeEvent<string[]>) => {
    setSort({
      ...sort,
      [key]: Array.isArray(event.target.value) ? event.target.value[0] : event.target.value,
    });
  };

  const handleOnSwitch = () => {
    setChecked((prev) => !prev);
  };

  const handleOnPage = (event: ChangeEvent<unknown>, page: number) => {
    setPage(page - 1);
  };

  const handleOnLoaded = (n: number) => {
    setTotalLoaded(n);
  };

  const handleOnClick = () => {
    setSelect({});
  };

  const handleOnCustom = (key: string) => (event: ChangeEvent<HTMLInputElement>) => {
    setSelect(prevState => ({
      ...prevState,
      [key]: [`${event.target.value}`],
    }));
  };

  const sanitizeKey = (key: string) => (
    key.replace(/[-_]/, ' ').replace(/(^[a-z])|( [a-z])/g, (str: string) => str.toUpperCase())
  );

  const {rarities, total} = data as EnrichedCollection;

  return (
    <div style={{display: 'flex', padding: '20px 0', margin: '4rem 0'}}>
      <div style={{
        width: 400,
        marginRight: 40,
        backgroundColor: '#fff',
        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
        borderRadius: '0 12px 12px 0',
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
        <div style={{marginLeft: '59px', marginBottom: '38px'}}>
          <Image src={data.bannerUrl} alt="banner img" height={200} width={200} objectFit="cover" />
        </div>
        <FormControl style={{marginLeft: '29px', marginRight: '29px'}} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-name">Name Search</InputLabel>
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
        {Object.keys((rarities || {})).map((key: string) => cloneElement((
          <>
            <Typography sx={{m: 0.5}}>{sanitizeKey(key)}</Typography>
            <FormControl sx={{m: 0.5, minWidth: 208}}>
              <InputLabel htmlFor={`${key}-input`}>{sanitizeKey(key)}</InputLabel>
              <Select
                labelId={`${key}-input`}
                id={`${key}-input`}
                value={(select[key] || [])}
                label={key}
                multiple
                onChange={(event) => handleOnChange(key, event)}
                renderValue={(selected) => (
                  <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {Object.keys(rarities[key]).map((trait: string) => cloneElement(
                  (<MenuItem value={trait}>{trait}</MenuItem>)
                  , {key: trait}))}
              </Select>
            </FormControl>
          </>
        ), {key}))}
        <FormGroup row={true}>
          <FormControl sx={{m: 0.5, minWidth: 208}}>
            <Input
              placeholder="from price"
              type="number"
              value={Number(select['fromPrice'])}
              onChange={handleOnCustom('fromPrice')}
            />
          </FormControl>
          <FormControl sx={{m: 0.5, minWidth: 208}}>
            <Input
              placeholder="to price"
              type="number"
              value={Number(select['toPrice'])}
              onChange={handleOnCustom('toPrice')}
            />
          </FormControl>
        </FormGroup>
        <FormGroup row={true}>
          <FormControl sx={{m: 0.5, minWidth: 208}}>
            <Input
              placeholder="from rank"
              type="number"
              value={Number(select['fromRank'])}
              onChange={handleOnCustom('fromRank')}
            />
          </FormControl>
          <FormControl sx={{m: 0.5, minWidth: 208}}>
            <Input
              placeholder="to rank"
              type="number"
              value={Number(select['toRank'])}
              onChange={handleOnCustom('toRank')}
            />
          </FormControl>
        </FormGroup>
        <FormControl sx={{m: 0.5, minWidth: 208}}>
          <Button onClick={handleOnClick}>CLEAR ALL</Button>
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
          </div>
        </div>
        <div style={{marginTop: 40, height: '100%'}}>
          <ImageLoader
            collectionId={collectionId}
            rowsPerPage={ROWS_PER_PAGE}
            columns={COLUMNS_PER_PAGE}
            page={page}
            filter={select}
            total={total}
            sort={sort}
            onLoaded={handleOnLoaded}
          />
        </div>
        <div style={{display: 'flex', width: '100%', justifyContent: 'end'}}>
          <Pagination
            count={Math.ceil(totalLoaded / (ROWS_PER_PAGE * COLUMNS_PER_PAGE))}
            onChange={handleOnPage}
          />
        </div>
      </div>
    </div>
  );
};

export default NftsView;
