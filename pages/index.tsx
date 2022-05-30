import type {NextPage} from 'next';
import Layout from '../components/layout';
//import {useFetchUser} from '../lib/user';
import CollectionsView from '../components/collections/CollectionsView';

const Home: NextPage = () => {
  //const {user, loading} = useFetchUser();

  return (
    <Layout user={{}} loading={false}>
      <CollectionsView />
    </Layout>
  );
};

export default Home;
