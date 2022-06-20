import {ChangeEvent, cloneElement, useState} from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import {Collection} from 'soonaverse/dist/interfaces/models';
import {Typography} from '@mui/material';
import Image from 'next/image';
import Pagination from '@mui/material/Pagination';

const COLLECTIONS_PER_PAGE = 10;

type SearchParams = {
  limit?: number
  skip?: number
  sort?: string
  order?: string
}

const getUrl = (params: SearchParams): string => {
  if (global.window) {
    const url: URL = new URL('/api/collections', window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    return url.toString();
  } else {
    return '';
  }
};

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

const CollectionsView = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const {data, error} = useSWR(getUrl({limit: COLLECTIONS_PER_PAGE, skip: (page - 1) * COLLECTIONS_PER_PAGE}), fetcher);

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

  const handleOnPage = (event: ChangeEvent<unknown>, page: number) => {
    setPage(page);
  };

  const handleViewClick = (collectionId: string) => {
    router.push('/collections/' + collectionId + '/nfts');
  };

  return (
    <div className="collections-container">
      <Typography
        sx={{
          fontFamily: 'Montserrat',
          paddingLeft: '50px',
          paddingTop: '20px',
          paddingBottom: '20px',
          fontSize: 24,
          fontWeight: 500,
          color: '#4C5862',
        }}
      >
        Collections
      </Typography>
      {!data ? <LinearProgress sx={{m: 1}} /> : (
        <div style={{paddingLeft: '25px', paddingRight: '25px', paddingBottom: '20px'}}>
          <table className="collections-table">
            <thead className="table-header">
            <tr className="collections-row">
              <th>Collection</th>
              <th>Description</th>
              <th>Circulation</th>
            </tr>
            </thead>
            <tbody>
            {data.items.map((collection: Collection) => cloneElement((
              <tr className="collections-row" onClick={() => handleViewClick(collection.uid)}>
                <td className="collection-column">
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{width: 80}}>
                      <Image
                        placeholder="blur"
                        src="banner.png"
                        loader={() => collection.bannerUrl}
                        alt="banner"
                        height={40}
                        width={60}
                        objectFit="cover"
                        blurDataURL="/placeholder.jpg"
                      />
                    </div>
                    <div className="collection-name" style={{width: 100}}>{collection.name}</div>
                  </div>
                </td>
                <td className="description-column">
                  {collection.description}
                </td>
                <td className="circulation-column">
                  {collection.sold}
                </td>
              </tr>
            ), {key: collection.uid}))}
            </tbody>
          </table>
          <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>
            <Pagination
              count={Math.ceil(data.total / COLLECTIONS_PER_PAGE)}
              onChange={handleOnPage}
              page={page}
            />
          </div>
        </div>
      )}
      <style jsx>{`
        .collection-name {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
        .collections-container {
          width: 1200px;
          margin: 4rem auto 0 auto;
          background-color: #FFFFFF;
          box-shadow: 0px 0px 8px gray;
          border-radius: 25px;
          padding-bottom: 2rem;
        }
        .table-header > tr {
          background-color: #EDEEF5;
        }
        .table-header th {
          padding-left: 25px;
          color: #4C5862;
          font-weight: 500;
          font-family: Montserrat;
        }
        .collections-table {
          width: 100%;
          border-collapse: collapse;
        }
        .collections-row {
          height: 50px;
          max-height: 75px;
          font-family: Montserrat;
        }
        .collections-row:hover {
          background-color: #EDEEF5;
        }
        .collections-row td { 
          padding-right: 16px;
          padding-left: 25px;
          padding-top: 8px;
          margin-bottom: 8px;
        }
        .collection-column {
          width: 15%;
        }
        .description-column {
          width: 100%;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
        .circulation-column {
          width: 10%;
        }
        th {
          text-align: left;
        }
      `}</style>
    </div>
  );
};

export default CollectionsView;
