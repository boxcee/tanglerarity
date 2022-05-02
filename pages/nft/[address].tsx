import {Soon} from 'soonaverse';
import {useEffect, useState} from "react";
import Image from 'next/image';

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
    collection: string,
    media: string
}

type RarityParams = {
    address: string
}

function Address(props: RarityProps) {
    const [rarity, setRarity] = useState({} as RarityScores);
    const [isLoading, setLoading] = useState(true)

    const {properties, collection} = props;

    useEffect(() => {
        setLoading(true);
        fetch('/api/rarities/' + collection)
            .then((res) => res.json())
            .then((data) => {
                setRarity(data);
                setLoading(false);
            })
    }, [collection]);

    if (isLoading) {
        return <div>Loading rarity score for NFT...</div>;
    }

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
    const {properties, collection, media}: { properties: RarityProperties, collection: string, media: string } = nft;
    return {props: {properties, collection, media}};
}

export default Address;
