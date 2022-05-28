import {ChangeEvent, cloneElement, FunctionComponent, useState} from 'react';
import ImageLoader from './ImageLoader';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
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

  const handleOnFrom = (event: ChangeEvent<HTMLInputElement>) => {
    setSelect(prevState => ({
      ...prevState,
      ['from']: [`${event.target.value}`],
    }));
  };

  const handleOnTo = (event: ChangeEvent<HTMLInputElement>) => {
    setSelect(prevState => ({
      ...prevState,
      ['to']: [`${event.target.value}`],
    }));
  };

  const handleOnName = (event: ChangeEvent<HTMLInputElement>) => {
    setSelect(prevState => ({
      ...prevState,
      ['name']: [`${event.target.value}`],
    }));
  };

  const sanitizeKey = (key: string) => (
    key.replace(/[-_]/, ' ').replace(/(^[a-z])|( [a-z])/g, (str: string) => str.toUpperCase())
  );

  const {rarities, total} = data as EnrichedCollection;

  return (
    <div style={{display: 'flex', padding: '20px 0', margin: '4rem 0'}}>
      <div style={{width: 450, marginRight: 40, backgroundColor: '#fff'}}>
        {data.name}
        <Image src="image.png" loader={() => data.bannerUrl} alt="banner img" height={250} width={250} />
        <FormControl sx={{m: 1, width: 208}} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-name">Name Search</InputLabel>
          <OutlinedInput
            id="outlined-adornment-name"
            type="search"
            value={select['name']}
            onChange={handleOnName}
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
      </div>
      <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
        <div style={{backgroundColor: '#fff', height: 75}}>IMAGES1</div>
        <div style={{marginTop: 40, height: '100%'}}>
          <ImageLoader
            collectionId={collectionId}
            rowsPerPage={ROWS_PER_PAGE}
            columns={COLUMNS_PER_PAGE}
            page={page}
            filter={select}
            total={total}
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

  return (
    <>
      <FormControlLabel
        sx={{m: 1}}
        control={<Switch checked={checked} onChange={handleOnSwitch} />}
        label="Show Filters"
      />
      <Collapse in={checked}>
        {Object.keys((rarities || {})).map((key: string) => cloneElement(
          <FormControl sx={{m: 1, minWidth: 208}}>
            <InputLabel htmlFor={`${key}-input`}>{key}</InputLabel>
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
          , {key}))}
        <FormControl sx={{m: 1, minWidth: 208}}>
          <InputLabel htmlFor="availability-input">availability</InputLabel>
          <Select
            labelId="availability-input"
            id="availability-input"
            value={select['availability'] || ''}
            label="availability"
            onChange={(event) => handleOnChange('availability', event)}
          >
            <MenuItem value="available">available</MenuItem>
            <MenuItem value="unavailable">unavailable</MenuItem>
          </Select>
        </FormControl>
        <FormGroup row={true}>
          <FormControl sx={{m: 1, minWidth: 208}}>
            <Input
              placeholder="from price"
              type="number"
              value={Number(select['from'])}
              onChange={handleOnFrom}
            />
          </FormControl>
          <FormControl sx={{m: 1, minWidth: 208}}>
            <Input
              placeholder="to price"
              type="number"
              value={Number(select['to'])}
              onChange={handleOnTo}
            />
          </FormControl>
          <FormControl sx={{m: 1, minWidth: 208}}>
            <Button onClick={handleOnClick}>CLEAR ALL</Button>
          </FormControl>
        </FormGroup>
      </Collapse>
      <ImageLoader
        collectionId={collectionId}
        rowsPerPage={ROWS_PER_PAGE}
        columns={COLUMNS_PER_PAGE}
        page={page}
        filter={select}
        total={total}
        onLoaded={handleOnLoaded}
      />
    </>
  );
};

export default NftsView;
