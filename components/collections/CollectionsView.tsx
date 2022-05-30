import {cloneElement, useState} from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import {Collection} from 'soonaverse/dist/interfaces/models';
import {Typography} from '@mui/material';
import Image from 'next/image';

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

const CollectionsView = () => {
  const router = useRouter();
  const {data, error} = useSWR('/api/collections', fetcher);
  const [images, setImages] = useState({});

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

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
                        src={collection.bannerUrl}
                        alt="banner"
                        height={40}
                        width={60}
                        objectFit="cover"
                        blurDataURL="/placeholder.jpg"
                      />
                    </div>
                    <div style={{width: 100}}>{collection.name}</div>
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
        </div>
      )}
      <style jsx>{`
        .collections-container {
          width: 1200px;
          margin: 4rem auto;
          background-color: #FFFFFF;
          box-shadow: 0px 0px 8px gray;
          border-radius: 25px;
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
