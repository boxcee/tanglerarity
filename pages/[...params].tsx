import {NextPage} from 'next';
import CollectionsView from '../components/collections/CollectionsView';
import CollectionsDetailView from '../components/collections/CollectionsDetailView';
import web3 from 'web3';
import NftsView from '../components/nfts/NftsView';
import NftsDetailView from '../components/nfts/NftsDetailView';
import Layout from '../components/layout';
import {useFetchUser} from '../lib/user';

type ParamsProps = {
  paths: string[]
}

type ParamsContext = {
  params: {
    params: string[]
  }
}

const Params: NextPage<ParamsProps> = ({paths}) => {
  const {user, loading} = useFetchUser();

  let pageToRender;

  if (paths.length === 1 && paths[0] === 'collections') {
    pageToRender = (<CollectionsView />);
  } else if (paths.length === 2 && paths[0] === 'collections' && web3.utils.isAddress(paths[1])) {
    pageToRender = (<CollectionsDetailView collectionId={paths[1]} />);
  } else if (paths.length === 3 && paths[0] === 'collections' && web3.utils.isAddress(paths[1]) && paths[2] === 'nfts') {
    pageToRender = (<NftsView collectionId={paths[1]} />);
  } else if (paths.length === 4 && paths[0] === 'collections' && web3.utils.isAddress(paths[1]) && paths[2] === 'nfts' && web3.utils.isAddress(paths[3])) {
    pageToRender = (<NftsDetailView collectionId={paths[1]} nftId={paths[3]} />);
  } else {
    pageToRender = (<>DEAD ROUTE</>);
  }

  return (
    <Layout user={user} loading={loading}>
      {pageToRender}
    </Layout>
  );
};

export async function getServerSideProps({params}: ParamsContext) {
  return {props: {paths: params.params}};
}

export default Params;
