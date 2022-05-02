import {Soon} from 'soonaverse';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import calculator from "../../utils/calculator";
import styles from '../../styles/Address.module.css'
import {Nft} from "soonaverse/dist/interfaces/models/nft";

const soon = new Soon();

type RarityProperty = {
    label: string,
    value: string
}

type RarityProperties = {
    [property: string]: RarityProperty
}

type RarityProps = {
    nft: Nft,
    score?: number,
}

type RarityParams = {
    address: string
}

function Address(props: RarityProps) {
    const {score, nft} = props;

    console.log(nft);

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <div className={styles.score}>{nft.name}</div>
                <Image
                    loader={() => nft.media}
                    src='nft.png'
                    alt="NFT media"
                    width={300}
                    height={300}
                />
                {score ? <div className={styles.score}>Score: {score.toFixed(2)}</div> :
                    <div>Rarity scores haven't been uploaded yet. To add your rarity scores, please submit a <a
                        href='https://github.com/boxcee/tanglerarity/new/main/rarities'>pull request</a>.</div>}
            </main>
        </div>
    );
}

export async function getServerSideProps({params}: { params: RarityParams }) {
    const {address} = params;
    const {createdOn, updatedOn, soldOn, ...nft} = await soon.getNft(address);
    const collection = await soon.getCollection(nft.collection);
    console.log(collection);
    let score = 0;
    try {
        const jsonPath = path.join(process.cwd(), 'rarities', nft.collection + '.json');
        const jsonFile = fs.readFileSync(jsonPath, 'utf-8');
        score = nft.properties ? calculator(nft.properties, JSON.parse(jsonFile)) : 0;
    } catch (err) {
        console.error(err);
    }
    return {props: {nft, score}};
}

export default Address;
