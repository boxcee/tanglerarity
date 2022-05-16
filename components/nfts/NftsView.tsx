import {ChangeEvent, cloneElement, FunctionComponent, useState} from 'react';
import ImageLoader from './ImageLoader';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import useSWR from 'swr';
import {EnrichedCollection} from '../../types/EnrichedCollection';
import LinearProgress from '@mui/material/LinearProgress';

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

type NftsViewProps = {
  collectionId: string
}

const ROWS_PER_PAGE = 3;
const COLUMNS_PER_PAGE = 3;

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

  const {rarities, total} = data as EnrichedCollection;

  return (
    <>
      <Stack direction="row" spacing={16} sx={{m: 1}}>
        <FormControlLabel
          control={<Switch checked={checked} onChange={handleOnSwitch} />}
          label="Show Filters"
        />
        <Pagination
          count={Math.ceil(totalLoaded / (ROWS_PER_PAGE * COLUMNS_PER_PAGE))}
          onChange={handleOnPage}
        />
      </Stack>
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
