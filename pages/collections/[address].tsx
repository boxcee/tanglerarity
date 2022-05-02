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

function Address({nfts = []}) {
    const router = useRouter();

    const handleInfoClick = () => {
        router.push('/nfts/');
    };

    return <div>
        <ImageList sx={{width: 600, height: 600}} cols={3} rowHeight={200}>
            {nfts.map((nft) => (
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
                            >
                                <InfoIcon onClick={handleInfoClick} />
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

export async function getStaticProps({params}) {
    const nfts = await soon.getNftsByCollections([params.address]);
    console.log(nfts[0]);
    return {props: {nfts: nfts.map(({name, media, owner}) => ({name, media, owner}))}};
}


export default Address;
