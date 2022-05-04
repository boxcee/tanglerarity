import {NextPage} from 'next';
import {ChangeEvent, MouseEvent, useState} from 'react';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import ImageLoader from '../../components/nfts/ImageLoader';

type AddressProps = {
  address: string,
  limit: number,
  skip: number
}

type AddressContext = {
  params: {
    address: string,
  },
  query: {
    limit: number,
    skip: number
  }
}

const Dead: NextPage<AddressProps> = ({address, limit, skip}) => {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [filter, setFilter] = useState('');
  const columns = 3;

  const handleChangePage = (event: MouseEvent<HTMLButtonElement | MouseEvent> | null, page: number) => {
    setPage(page);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value));
  };

  const handleChangeFilter = (event: ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleNftsLoaded = (total: number) => {
    setTotal(total);
  };

  return (
    <div>
      <TextField id="standard-basic" label="Name" variant="standard" onChange={handleChangeFilter}
                 value={filter} />
      <ImageLoader collectionId={address} rowsPerPage={rowsPerPage} columns={columns} page={page} filter={filter}
                   onNftsLoaded={handleNftsLoaded} />
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[3, 10, 15]}
        labelDisplayedRows={({
                               from,
                               to,
                               page,
                               count,
                             }) => `${(page * rowsPerPage * columns) + 1}–${to * columns} of ${count !== -1 ? count : `more than ${to * columns}`}`}
      />
    </div>
  );
};

export async function getServerSideProps({params, query}: AddressContext) {
  return {
    props: {address: params.address, limit: query.limit || 15, skip: query.skip || 0},
  };
}


export default Dead;
