import {ChangeEvent, FunctionComponent} from 'react';
import Search from '../components/search';
import Button from '@mui/material/Button';
import {styled} from '@mui/material/styles';

const Input = styled('input')({
  display: 'none',
});

const Header: FunctionComponent = () => {
  const handleOnUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      fetch('/api/upload', {method: 'POST', body: formData})
        .then(console.log)
        .catch(console.error);
    }
  };

  return (
    <header>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <div className="search-input">
          <Search />
        </div>
        <div style={{paddingTop: 15.5, marginLeft: 20}}>
          <label htmlFor="contained-button-file">
            <Input accept="text/csv" id="contained-button-file" type="file" onChange={handleOnUpload} />
            <Button
              variant="contained"
              component="span" sx={{height: 40, borderRadius: 25}}
            >
              Upload
            </Button>
          </label>
        </div>
      </div>
      <style jsx>{`
        header {
          background-color: #5D658B;
          height: 75px;
        }
        .search-input {
          width: 500px;
        }
      `}</style>
    </header>
  );
};

export default Header;
