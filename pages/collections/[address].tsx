import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Image from 'next/image';
import ImageListItemBar from "@mui/material/ImageListItemBar";
import IconButton from "@mui/material/IconButton";
import InfoIcon from '@mui/icons-material/Info';
import {useRouter} from "next/router";
import {NextPage} from "next";
import {useEffect, useState} from "react";
import {RankedNft} from "../../types/RankedNft";

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

    useEffect(() => {
        setLoading(true);
        fetch('/api/collections/' + address + '?limit=' + limit + '&skip=' + skip)
            .then(res => res.json())
            .then(data => {
                setNftData(data);
                setLoading(false);
            });
    }, [address, limit, skip]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const handleInfoClick = (uid: string) => {
        router.push('/nfts/' + uid);
    };

    const {total, nfts} = nftData;

    return <div>
        <ImageList sx={{width: 750, height: 750}} cols={3} rowHeight={250}>
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
                        subtitle={`Rank: ${nft.rank}/${total}; Score: ${nft.score.toFixed(2)}`}
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
    </div>;
}

export async function getServerSideProps({params, query}: AddressContext) {
    return {
        props: {address: params.address, limit: query.limit || 15, skip: query.skip || 0},
    }
}


export default Address;
