import {CollectionDocument} from '../../lib/mongodb/types/Collection';
import {TotalRarities} from '../../lib/mongodb/types/Rarities';

export type EnrichedCollectionDocument = CollectionDocument & {
  totalRarities: TotalRarities
}
