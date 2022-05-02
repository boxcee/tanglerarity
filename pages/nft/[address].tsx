import {Soon} from 'soonaverse';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import calculator from "../../utils/calculator";

const soon = new Soon();

type RarityProperty = {
    label: string,
    value: string
}

type RarityProperties = {
    [property: string]: RarityProperty
}

type RarityProps = {
    media: string
    score?: number,
}

type RarityParams = {
    address: string
}

function Address(props: RarityProps) {
    const {score, media} = props;

    return <div>
        <Image
            loader={() => media}
            src='nft.png'
            alt="NFT media"
            width={300}
            height={300}
        />
        {score ? <div>Score: {score.toFixed(2)}</div> :
            <div>Rarity scores haven't been uploaded yet. To add your rarity scores, please submit a <a
                href='https://github.com/boxcee/tanglerarity/new/main/rarities'>pull request</a>.</div>}
    </div>
}

export async function getServerSideProps({params}: { params: RarityParams }) {
    const {address} = params;
    const {
        properties,
        media,
        collection
    }: { properties?: RarityProperties, media: string, collection: string } = await soon.getNft(address);
    let score = 0;
    try {
        const jsonPath = path.join(process.cwd(), 'rarities', collection + '.json');
        const jsonFile = fs.readFileSync(jsonPath, 'utf-8');
        score = properties ? calculator(properties, JSON.parse(jsonFile)) : 0;
    } catch (err) {
        console.error(err);
    }
    return {props: {score, media}};
}

export default Address;
