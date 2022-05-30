import {FunctionComponent, useState} from 'react';
import Select from '@mui/material/Select';

type UploadProps = {
  onClose: () => void
}

const Upload: FunctionComponent<UploadProps> = ({onClose}) => {
  const [select, setSelect] = useState('Soonaverse');

  return (
    <Select></Select>
  );
};

export default Upload;
