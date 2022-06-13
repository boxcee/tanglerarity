import {ChangeEvent, FunctionComponent, useState} from 'react';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Input from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import Button from '@mui/material/Button';
import web3 from 'web3';

type UploadProps = {
  onClose: () => void
}

type FormState = {
  id?: string
  name?: string
  description?: string
  bannerUrl?: string
}

const options: { [key: string]: string } = {
  SOONAVERSE: 'SOONAVERSE',
  ERC721: 'ERC721',
};

const Upload: FunctionComponent<UploadProps> = ({onClose}) => {
  const [select, setSelect] = useState('select');
  const [form, setForm] = useState<FormState>({});
  const [file, setFile] = useState<File>();

  const onSelect = (event: SelectChangeEvent) => {
    setSelect(event.target.value);
  };

  const handleOnChange = (key: string) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm(form => ({
      ...form,
      [key]: event.target.value,
    }));
  };

  const handleOnFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleOnUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const searchParams = new URLSearchParams();
      if (form.id) {
        searchParams.append('collection', form.id);
      }
      if (form.name) {
        searchParams.append('name', form.name);
      }
      if (form.description) {
        searchParams.append('description', form.description);
      }
      if (form.bannerUrl) {
        searchParams.append('bannerUrl', form.bannerUrl);
      }
      if (select) {
        searchParams.append('type', select);
      }
      fetch(`/api/upload?${searchParams.toString()}`, {method: 'POST', body: formData})
        .then(onClose)
        .catch(error => {
          console.log(error);
          onClose();
        });
    }
  };

  const soonaverseForm = () => (
    <FormGroup>
      <FormControl>
        <Input
          placeholder="collection id"
          type="text"
          value={form.id || ''}
          onChange={handleOnChange('id')}
        />
      </FormControl>
      <FormControl>
        <Input
          placeholder="file"
          type="file"
          inputProps={{accept: 'text/csv'}}
          onChange={handleOnFile}
        />
      </FormControl>
    </FormGroup>
  );

  const erc721Form = () => (
    <FormGroup>
      <FormControl>
        <Input
          placeholder="collection name"
          type="text"
          value={form.name || ''}
          onChange={handleOnChange('name')}
        />
      </FormControl>
      <FormControl>
        <Input
          placeholder="collection description"
          type="text"
          value={form.description || ''}
          onChange={handleOnChange('description')}
        />
      </FormControl>
      <FormControl>
        <Input
          placeholder="collection bannerUrl"
          type="text"
          value={form.bannerUrl || ''}
          onChange={handleOnChange('bannerUrl')}
        />
      </FormControl>
      <FormControl>
        <Input
          placeholder="collection id"
          type="text"
          value={form.id || ''}
          onChange={handleOnChange('id')}
        />
      </FormControl>
      <FormControl>
        <Input
          placeholder="file"
          type="file"
          inputProps={{accept: 'text/csv'}}
          onChange={handleOnFile}
        />
      </FormControl>
    </FormGroup>
  );

  const uploadFormCondition = () => {
    return (
      select === options.SOONAVERSE && form.id && web3.utils.isAddress(form.id) && file
    ) || (
      select === options.ERC721 && form.id && web3.utils.isAddress(form.id) && file && form.name && form.description && form.bannerUrl
    );
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <a href="/sample.csv" download>Download sample CSV</a>
      <FormControl sx={{m: 0.5, minWidth: 208}}>
        <Select
          value={select}
          onChange={onSelect}
          renderValue={(selected) => selected === 'select' ? (
            <span style={{color: '#9E9E9E', fontWeight: 400, fontFamily: 'Inter'}}>Select upload type</span>
          ) : (
            <span>{selected}</span>
          )}
        >
          <MenuItem value="select">Select upload type</MenuItem>
          {Object.keys(options).map(key => (
            <MenuItem key={key} value={options[key]}>{options[key]}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {select === options.SOONAVERSE && soonaverseForm()}
      {select === options.ERC721 && erc721Form()}
      {select !== '' && (
        <Button
          variant="contained"
          component="span"
          disabled={!uploadFormCondition()}
          onClick={handleOnUpload}
        >
          Upload
        </Button>
      )}
    </div>
  );
};

export default Upload;
