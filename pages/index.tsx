import type {NextPage} from 'next';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import {Fragment, SyntheticEvent, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {Collection} from 'soonaverse/dist/interfaces/models';
import {RankedNft} from '../types/RankedNft';
import CircularProgress from '@mui/material/CircularProgress';
import {Nft} from 'soonaverse/dist/interfaces/models/nft';
import Layout from '../components/layout';
import {useFetchUser} from '../lib/user';

type Option = (Collection | RankedNft) & {
  groupBy: string
}

const Home: NextPage = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([] as Option[]);
  const [value, setValue] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [option, setOption] = useState(null as (Option | null));
  const {user, loading} = useFetchUser();

  useEffect(() => {
    if (value.length > 2) {
      setLoading(true);
      fetch('/api/search?q=' + value)
        .then(res => res.json())
        .then(data => {
          setLoading(false);
          setOptions(data);
        });
    } else {
      setOptions([]);
    }
  }, [value]);

  const handleOnInputChange = (event: SyntheticEvent, value: string) => {
    setValue(value);
  };

  const handleOnChange = (event: SyntheticEvent, value: string | Option) => {
    setOption(value as Option);
  };

  const handleOnClickBrowse = () => {
    router.push('/collections');
  };

  const handleOnClickSearch = () => {
    if (value.length !== 0 && option) {
      switch (option.groupBy) {
        case 'collections':
          router.push(`/collections/${option.uid}`);
          break;
        case 'nfts':
          router.push(`/collections/${(option as Nft).collection}/nfts/${option.uid}`);
          break;
        default:
        // Nothing
      }
    }
  };

  return (
    <Layout user={user} loading={loading}>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <Link href="/">TangleRarity!</Link>
        </h1>

        <div className={styles.description}>
          <Stack sx={{width: 300}} spacing={2}>
            <Autocomplete
              freeSolo
              id="search"
              disableClearable
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              options={options}
              getOptionLabel={option => (option as Option).name}
              groupBy={(option) => option.groupBy.toUpperCase()}
              loading={isLoading}
              onInputChange={handleOnInputChange}
              onChange={handleOnChange}
              filterOptions={(x) => x}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Address, name, description, etc."
                  InputProps={{
                    ...params.InputProps,
                    type: 'search',
                    endAdornment: (
                      <Fragment>
                        {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </Fragment>
                    ),
                  }}
                />
              )}
            />
            <Button variant="contained" onClick={handleOnClickSearch}>Search</Button>
            <Button onClick={handleOnClickBrowse}>Browse Collections</Button>
          </Stack>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/boxcee/tanglerarity"
          target="_blank"
          rel="noopener noreferrer"
        >
                    <span className={styles.logo}>
                        <Image src="/github.svg" alt="Github Logo" width={32} height={32} />
                    </span>
        </a>
      </footer>
    </Layout>
  );
};

export default Home;
