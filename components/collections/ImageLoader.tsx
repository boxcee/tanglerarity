import {useEffect, useState} from "react";
import {RankedNft} from "../../types/RankedNft";
import ImageListItem from "@mui/material/ImageListItem";
import Image from "next/image";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import ImageList from "@mui/material/ImageList";
import {useRouter} from "next/router";

type ImageLoaderProps = {
    address: string,
    rowsPerPage: number,
    columns: number,
    page: number,
    filter: string,
    onNftsLoaded: (n: number) => void
}

const ImageLoader = ({address, rowsPerPage, columns, page, filter, onNftsLoaded}: ImageLoaderProps) => {
    const router = useRouter();
    const [isLoading, setLoading] = useState(true);
    const [nftData, setNftData] = useState({} as ({ total: number, nfts: RankedNft[] }));

    useEffect(() => {
        setLoading(true);
        fetch('/api/collections/' + address + '?limit=' + (rowsPerPage * columns) + '&skip=' + (page * rowsPerPage * columns) + '&filter=' + filter)
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                setNftData(data);
            });
    }, [address, rowsPerPage, columns, page, filter]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const handleInfoClick = (uid: string) => {
        router.push('/nfts/' + uid + '?collection=' + address);
    };

    const {total, nfts} = nftData;

    onNftsLoaded(total);

    return (
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
    );
}

export default ImageLoader;
