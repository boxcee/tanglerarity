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
        <title>TANGLE RARITY</title>
        <meta name="description" content="Explore your NFTs rarity" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://use.typekit.net/ddt4mdi.css"
        />
        <link
          rel="stylesheet"
          href="https://rsms.me/inter/inter.css"
        />
      </Head>

      <Header />

      <main>
        <div>{children}</div>
      </main>

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
