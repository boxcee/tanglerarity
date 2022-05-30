import {FunctionComponent, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {Collection} from 'soonaverse/dist/interfaces/models';
import {RankedNft} from '../types/RankedNft';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';
import {ReactSearchAutocomplete} from 'react-search-autocomplete';
import {CircularProgress} from '@mui/material';

type Option = (Collection | RankedNft) & {
  groupBy: string
}

const Search: FunctionComponent = () => {
  const router = useRouter();
  const [options, setOptions] = useState([] as Option[]);
  const [value, setValue] = useState('');
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (value.length > 2) {
      setLoading(true);
      fetch('/api/search?q=' + value)
        .then(res => res.json())
        .then(data => {
          setOptions(data);
          setLoading(false);
        });
    } else {
      setOptions([]);
    }
  }, [value]);

  const handleOnSearch = (keyword: string, results: Option[]) => {
    setValue(keyword);
  };

  const formatResult = (item: Option) => {
    return (
      <>
        {item.groupBy === 'collections' ? 'COLLECTION:' : 'NFT:'} {item.name}
      </>
    );
  };

  const handleOnSelect = (result: Option) => {
    if (value.length !== 0 && result) {
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
    }
  };

  return (
    <div style={{paddingTop: 15.5}}>
      <span>
        <ReactSearchAutocomplete
          styling={{height: '40px', fontFamily: 'Montserrat'}}
          items={options}
          inputSearchString={value}
          placeholder="Search Collections, NFTs, Addresses"
          resultStringKeyName="name"
          onSearch={handleOnSearch}
          onSelect={handleOnSelect}
          formatResult={formatResult}
        />
        {isLoading ? <CircularProgress /> : null}
      </span>
    </div>
  );
};

export default Search;
