import {useFetchUser} from '../lib/user';
import Layout from '../components/layout';
import {FunctionComponent} from 'react';
import Image from 'next/image';

type ProfileCardProps = {
  user: {
    picture: string
    nickname: string
    name: string
  }
}

const ProfileCard: FunctionComponent<ProfileCardProps> = ({user}) => {
  return (
    <>
      <h1>Profile</h1>

      <div>
        <h3>Profile (client rendered)</h3>
        <Image src={user.picture} alt="user picture" />
        <p>nickname: {user.nickname}</p>
        <p>name: {user.name}</p>
      </div>
    </>
  );
};

function Profile() {
  const {user, loading} = useFetchUser({required: true});

  return (
    <Layout user={user} loading={loading}>
      {loading ? <>Loading...</> : <ProfileCard user={user} />}
    </Layout>
  );
}

export default Profile;
