import {Soon} from 'soonaverse';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';

const soon = new Soon();

type RarityScores = {
    total: number,
    properties: {
        [key: string]: {
            [key: string]: number
        }
    }
};

type RarityProperty = {
    label: string,
    value: string
}

type RarityProperties = {
    [property: string]: RarityProperty
}

type RarityProps = {
    properties: RarityProperties,
    rarity: RarityScores,
    media: string
}

type RarityParams = {
    address: string
}

function Address(props: RarityProps) {
    const {properties, rarity} = props;

    let score = 0;
    Object.values(properties).map(({label, value}) => {
        if (rarity.properties[label] && rarity.properties[label][value]) {
            score += 1 / ((rarity.properties[label][value] * rarity.total) / rarity.total);
        }
    });

    return <div>
        <Image
            loader={() => props.media}
            src='nft.png'
            alt="NFT media"
            width={300}
            height={300}
        />
        <ul>
            {Object.values(properties).map(({label, value}) => {
                return <li key={label}>{label}: {value}</li>
            })}
        </ul>
        <div>Score: {score.toFixed(2)}</div>
    </div>
}

export async function getServerSideProps({params}: { params: RarityParams }) {
    const {address} = params;
    const nft = await soon.getNft(address);
    const jsonPath = path.join(process.cwd(), 'rarities', nft.collection + '.json');
    const jsonFile = fs.readFileSync(jsonPath, 'utf-8');
    const {properties, media}: { properties: RarityProperties, media: string } = nft;
    return {props: {properties, rarity: JSON.parse(jsonFile), media}};
}

export default Address;
