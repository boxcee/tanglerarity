import Head from 'next/head';
import Header from './header';
import {FunctionComponent, ReactNode} from 'react';

type LayoutProps = {
  user: {},
  loading: boolean,
  children: ReactNode | ReactNode[]
}

const Layout: FunctionComponent<LayoutProps> = ({user, loading = false, children}) => {
  return (
    <>
      <Head>
        <title>TangleRarity</title>
        <meta name="description" content="Explore your NFTs rarity." />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Head>

      <Header user={user} loading={loading} />

      <main>
        <div className="container">{children}</div>
      </main>

      <style jsx>{`
        .container {
          max-width: 42rem;
          margin: 1.5rem auto;
        }
      `}</style>
      <style jsx global>{`
        body {
          margin: 0;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
    </>
  );
};

export default Layout;
