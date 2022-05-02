import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Image from 'next/image';
import ImageListItemBar from "@mui/material/ImageListItemBar";
import IconButton from "@mui/material/IconButton";
import InfoIcon from '@mui/icons-material/Info';
import {useRouter} from "next/router";
import {NextPage} from "next";
import {useEffect, useState} from "react";

type Nft = {
    name: string,
    media: string,
    uid: string,
    owner: string
}

type AddressProps = {
    address: string
}

type AddressContext = {
    params: {
        address: string
    }
}

const Address: NextPage<AddressProps> = ({address}) => {
    const router = useRouter();
    const [isLoading, setLoading] = useState(true);
    const [nfts, setNfts] = useState([]);

    useEffect(() => {
        setLoading(true);
        fetch('/api/collections/' + address + '?limit=15')
            .then(res => res.json())
            .then(data => {
                setNfts(data);
                setLoading(false);
            });
    }, [address]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const handleInfoClick = (uid: string) => {
        router.push('/nfts/' + uid);
    };

    return <div>
        <ImageList sx={{width: 750, height: 750}} cols={3} rowHeight={250}>
            {nfts.map((nft: Nft) => (
                <ImageListItem key={nft.name}>
                    <Image
                        loader={() => nft.media}
                        src='nft.png'
                        alt="NFT media"
                        layout='fill'
                    />
                    <ImageListItemBar
                        title={nft.name}
                        subtitle={nft.owner}
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

export async function getServerSideProps({params}: AddressContext) {
    return {
        props: {address: params.address},
    }
}


export default Address;
