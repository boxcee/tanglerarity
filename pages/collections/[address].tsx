import fs from 'fs';
import path from 'path';
import {Soon} from 'soonaverse';
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Image from 'next/image';
import ImageListItemBar from "@mui/material/ImageListItemBar";
import IconButton from "@mui/material/IconButton";
import InfoIcon from '@mui/icons-material/Info';
import {useRouter} from "next/router";

const soon = new Soon();

type Nft = {
    name: string,
    media: string,
    uid: string,
    owner: string
}

type AddressParams = {
    address: string
}

function Address({nfts = []}: { nfts: Nft[] }) {
    const router = useRouter();

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

export async function getStaticPaths() {
    const files = fs.readdirSync(path.join(process.cwd(), 'rarities'));
    return {
        paths: files.map(filename => '/collections/' + filename.split('.')[0]),
        fallback: true // false or 'blocking'
    };
}

export async function getStaticProps({params}: { params: AddressParams }) {
    const nfts = await soon.getNftsByCollections([params.address]);
    return {props: {nfts: nfts.map(({name, media, owner, uid}) => ({name, media, owner, uid}))}};
}


export default Address;
