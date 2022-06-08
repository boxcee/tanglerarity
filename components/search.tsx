import {FunctionComponent, SyntheticEvent, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {Collection} from 'soonaverse/dist/interfaces/models';
import {RankedNft} from '../types/RankedNft';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

type Option = (Collection | RankedNft) & {
  groupBy: string
}

const Search: FunctionComponent = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState<Option>();

  useEffect(() => {
    if (inputValue.length > 2) {
      setLoading(true);
      fetch('/api/search?q=' + inputValue)
        .then(res => res.json())
        .then(data => {
          setOptions(data);
          setLoading(false);
        });
    } else {
      setOptions([]);
    }
  }, [inputValue]);

  const handleOnInput = (event: SyntheticEvent, value: string) => {
    setInputValue(value);
  };

  const handleOnSelect = (event: SyntheticEvent, result: Option | null) => {
    if (inputValue.length !== 0 && result) {
      switch (result.groupBy) {
        case 'collections':
          router.push(`/collections/${result.uid}/nfts`);
          break;
        case 'nfts':
          router.push(`/collections/${(result as Nft).collection}/nfts/${result.uid}`);
          break;
        default:
        // Nothing
      }
      setValue(result);
    }
  };

  return (
    <div style={{paddingTop: 15.5}}>
      <span>
        <Autocomplete
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          options={options}
          loading={loading}
          onInputChange={handleOnInput}
          inputValue={inputValue}
          groupBy={(option) => option.groupBy.toUpperCase()}
          getOptionLabel={(option) => option.name}
          filterOptions={(x) => x}
          onChange={handleOnSelect}
          value={value}
          renderInput={(params) => (
            <TextField
              {...params}
              InputProps={{
                ...params.InputProps,
                style: {
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  border: '0 solid black',
                  height: 40,
                  padding: '0 0 0 10px',
                  color: 'rgb(76, 88, 98)',
                },
                placeholder: 'Search Collections, NFTs, Addresses',
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </span>
    </div>
  );
};

export default Search;
