import {Nft} from "soonaverse/dist/interfaces/models/nft";

export type EnrichedNft = Nft & {
    score: number,
    rarity: {
        [key: string]: {
            [key: string]: number
        }
    }
}
