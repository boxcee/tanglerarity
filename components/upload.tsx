import {ChangeEvent, FunctionComponent, useState} from 'react';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
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
}

const options: { [key: string]: string } = {
  SOONAVERSE: 'Soonaverse',
  ERC721: 'ERC721',
};

const Upload: FunctionComponent<UploadProps> = ({onClose}) => {
  const [select, setSelect] = useState('');
  const [form, setForm] = useState<FormState>({});
  const [file, setFile] = useState<File>();

  console.log(file);

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
    if (file && form.id) {
      const formData = new FormData();
      formData.append('file', file);
      fetch(`/api/upload?collection=${form.id}`, {method: 'POST', body: formData})
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
    <>Hello World!</>
  );

  const uploadFormCondition = () => {
    return (
      select === options.SOONAVERSE && form.id && web3.utils.isAddress(form.id) && file
    ) || (
      select === options.ERC721
    );
  };

  return (
    <div>
      <FormControl sx={{m: 0.5, minWidth: 208}}>
        <InputLabel htmlFor="form-input">Upload-Type</InputLabel>
        <Select
          labelId="form-input"
          id="form-input"
          value={select}
          title="Upload-Type"
          onChange={onSelect}
        >
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
