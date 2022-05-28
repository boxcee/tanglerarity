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
        <title>IOTA NFT TOOLS</title>
        <meta name="description" content="Explore your NFTs rarity" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Head>

      <Header />

      <main>
        <div className="container">{children}</div>
      </main>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 4rem auto;
          background-color: #FFFFFF;
          box-shadow: 0px 0px 8px gray;
        }
      `}</style>
      <style jsx global>{`
        body {
          margin: 0;
          color: #333;
          background-color: #EBEDEE;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
    </>
  );
};

export default Layout;
