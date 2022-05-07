import {cloneElement, FunctionComponent, useState} from 'react';
import ImageLoader from './ImageLoader';
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import useSWR from 'swr';
import {EnrichedCollection} from '../../types/EnrichedCollection';

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

type NftsViewProps = {
  collectionId: string
}

const NftsView: FunctionComponent<NftsViewProps> = ({collectionId}) => {
  const [select, setSelect] = useState({} as ({ [key: string]: string }));
  const {data, error} = useSWR(`/api/collections/${collectionId}`, fetcher);

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

  if (!data) {
    return <div>Is loading...</div>;
  }

  const handleOnChange = (key: string, event: SelectChangeEvent) => {
    setSelect({
      ...select,
      [key]: event.target.value,
    });
  };

  const {rarities, total} = data as EnrichedCollection;

  return (
    <>
      <FormGroup row={true}>
        {Object.keys((rarities || {})).map((key: string) => cloneElement(
          <FormControl fullWidth={true}>
            <InputLabel htmlFor={`${key}-input`}>{key}</InputLabel>
            <Select
              labelId={`${key}-input`}
              id={`${key}-input`}
              value={(select[key] || '')}
              label={key}
              onChange={(event) => handleOnChange(key, event)}
            >
              {Object.keys(rarities[key]).map((trait: string) => cloneElement(
                (<MenuItem value={trait}>{trait}</MenuItem>)
                , {key: trait}))}
            </Select>
          </FormControl>
          , {key}))}
      </FormGroup>
      <ImageLoader
        collectionId={collectionId}
        rowsPerPage={3}
        columns={3}
        page={0}
        filter={select}
        total={total} />
    </>
  );
};

export default NftsView;
