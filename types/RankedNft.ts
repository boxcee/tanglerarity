import {EnrichedNft} from "./EnrichedNft";

export type RankedNft = EnrichedNft & {
    rank: string
}
