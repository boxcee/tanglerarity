import {NextPage} from 'next';
import CollectionsView from '../components/collections/CollectionsView';
import CollectionsDetailView from '../components/collections/CollectionsDetailView';
import web3 from 'web3';
import NftsView from '../components/nfts/NftsView';
import NftsDetailView from '../components/nfts/NftsDetailView';

type ParamsProps = {
  paths: string[]
}

type ParamsContext = {
  params: {
    params: string[]
  }
}

const Params: NextPage<ParamsProps> = ({paths}) => {
  if (paths.length === 1 && paths[0] === 'collections') {
    return (
      <CollectionsView />
    );
  } else if (paths.length === 2 && paths[0] === 'collections' && web3.utils.isAddress(paths[1])) {
    return (
      <CollectionsDetailView collectionId={paths[1]} />
    );
  } else if (paths.length === 3 && paths[0] === 'collections' && web3.utils.isAddress(paths[1]) && paths[2] === 'nfts') {
    return (
      <NftsView collectionId={paths[1]} />
    );
  } else if (paths.length === 4 && paths[0] === 'collections' && web3.utils.isAddress(paths[1]) && paths[2] === 'nfts' && web3.utils.isAddress(paths[3])) {
    return (
      <NftsDetailView collectionId={paths[1]} nftId={paths[3]} />
    );
  } else {
    return (
      <>DEAD ROUTE</>
    );
  }
};

export async function getServerSideProps({params}: ParamsContext) {
  return {props: {paths: params.params}};
}

export default Params;
