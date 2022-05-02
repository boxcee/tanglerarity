import {Soon} from 'soonaverse';
import {useEffect, useState} from "react";


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
    collection: string
}

type RarityParams = {
    address: string
}

function Rarity(props: RarityProps) {
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
        <ul>
            {Object.values(properties).map(({label, value}) => {
                return <li key={label}>{label}: {value}</li>
            })}
        </ul>
    </div>
}

export async function getServerSideProps({params}: { params: RarityParams }) {
    const {address} = params;
    const {properties, collection}: { properties: RarityProperties, collection: string } = await soon.getNft(address);
    return {props: {properties, collection}};
}

export default Rarity;
