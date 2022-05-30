import {FunctionComponent, useState} from 'react';
import Search from '../components/search';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Upload from '../components/upload';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const Header: FunctionComponent = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    console.log('close');
    setOpen(false);
  };

  return (
    <header>
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box sx={style}>
          <Upload onClose={handleClose} />
        </Box>
      </Modal>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <div className="search-input">
          <Search />
        </div>
        <div style={{paddingTop: 15.5, marginLeft: 20}}>
          <Button
            variant="contained"
            component="span" sx={{height: 40, borderRadius: 25}}
            onClick={handleOpen}
          >
            Upload
          </Button>
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
