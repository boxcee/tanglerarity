import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Image from 'next/image';
import ImageListItemBar from "@mui/material/ImageListItemBar";
import IconButton from "@mui/material/IconButton";
import InfoIcon from '@mui/icons-material/Info';
import {useRouter} from "next/router";
import {NextPage} from "next";
import {ChangeEvent, MouseEvent, useEffect, useState} from "react";
import {RankedNft} from "../../types/RankedNft";
import TablePagination from "@mui/material/TablePagination";

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

const Address: NextPage<AddressProps> = ({address, limit, skip}) => {
    const router = useRouter();
    const [isLoading, setLoading] = useState(true);
    const [nftData, setNftData] = useState({} as ({ total: number, nfts: RankedNft[] }));
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(3);
    const columns = 3;

    useEffect(() => {
        setLoading(true);
        fetch('/api/collections/' + address + '?limit=' + (rowsPerPage * columns) + '&skip=' + (page * rowsPerPage * columns))
            .then(res => res.json())
            .then(data => {
                setNftData(data);
                setLoading(false);
            });
    }, [address, rowsPerPage, columns, page]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const handleInfoClick = (uid: string) => {
        router.push('/nfts/' + uid + '?collection=' + address);
    };

    const handleChangePage = (event: MouseEvent<HTMLButtonElement | MouseEvent> | null, page: number) => {
        setPage(page);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
    }

    const {total, nfts} = nftData;

    return (
        <div>
            <ImageList sx={{width: 750, height: 750}} cols={columns} rowHeight={250}>
                {nfts.map((nft: RankedNft) => (
                    <ImageListItem key={nft.name}>
                        <Image
                            loader={() => nft.media}
                            src='nft.png'
                            alt="NFT media"
                            layout='fill'
                        />
                        <ImageListItemBar
                            title={nft.name}
                            subtitle={`Rank: ${nft.rank}; Score: ${nft.score.toFixed(2)}`}
                            actionIcon={
                                <IconButton
                                    sx={{color: 'rgba(255, 255, 255, 0.54)'}}
                                    aria-label={`info about ${nft.name}`}
                                    onClick={() => handleInfoClick(nft.uid)}
                                >
                                    <InfoIcon />
                                </IconButton>
                            }
                        />
                    </ImageListItem>
                ))}
            </ImageList>
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
                                         count
                                     }) => `${(page * rowsPerPage * columns) + 1}–${to * columns} of ${count !== -1 ? count : `more than ${to * columns}`}`}
            />
        </div>
    );
}

export async function getServerSideProps({params, query}: AddressContext) {
    return {
        props: {address: params.address, limit: query.limit || 15, skip: query.skip || 0},
    }
}


export default Address;
