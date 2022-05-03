import Image from 'next/image';
import styles from '../../styles/Address.module.css'
import {NextPage} from "next";
import {useEffect, useState} from "react";
import {RankedNft} from "../../types/RankedNft";

type AddressProps = {
    address: string,
    collection: string
}

type AddressContext = {
    params: {
        address: string,
    },
    query: {
        collection: string,
    }
}

const Address: NextPage<AddressProps> = ({address, collection}) => {
    const [isLoading, setLoading] = useState(true);
    const [nft, setNft] = useState({} as RankedNft);

    useEffect(() => {
        setLoading(true);
        fetch('/api/nfts/' + address + '?collection=' + collection)
            .then(res => res.json())
            .then(nft => {
                setNft(nft);
                setLoading(false);
            })
    }, [address, collection]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

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
                <div className={styles.score}>Rank: {nft.rank}; Score: {nft.score.toFixed(2)}</div>
            </main>
        </div>
    );
}

export async function getServerSideProps({params, query}: AddressContext) {
    return {props: {address: params.address, collection: query.collection}};
}

export default Address;
