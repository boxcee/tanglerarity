import {cloneElement} from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import {Collection} from 'soonaverse/dist/interfaces/models';
import {Typography} from '@mui/material';
//import Image from 'next/image';

const fetcher = (url: RequestInfo): any => fetch(url).then((res: Response) => res.json());

const CollectionsView = () => {
  const router = useRouter();
  const {data, error} = useSWR('/api/collections', fetcher);

  if (error) {
    return <>{JSON.stringify(error, null, 2)}</>;
  }

  if (!data) {
    return <LinearProgress sx={{m: 1}} />;
  }

  const handleViewClick = (collectionId: string) => {
    router.push('/collections/' + collectionId);
  };

  const {total, items} = data;

  return (
    <div style={{padding: '20px 0'}}>
      <Typography>Collections</Typography>
      <table className="collections-table">
        <thead className="table-header">
        <tr className="collections-row">
          <th>Collection</th>
          <th>Description</th>
          <th>Circulation</th>
        </tr>
        </thead>
        <tbody>
        {items.map((collection: Collection) => cloneElement((
          <tr className="collections-row" onClick={() => handleViewClick(collection.uid)}>
            <td className="collection-column">
              {collection.name}
              {/*<Image
                alt="collection banner"
                src="banner.png"
                loader={() => collection.bannerUrl}
                blurDataURL="/placeholder.jpg"
                layout="fill"
                placeholder="blur"
              />*/}
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
      <style jsx>{`
        .table-header {
          background-color: #EDEEF5;
        }
        .collections-table {
          width: 100%;
          border-collapse: collapse;
        }
        .collections-row {
          height: 50px;
          max-height: 75px;
        }
        .collections-row:hover {
          background-color: #EDEEF5;
        }
        .collections-row td { 
          padding-right: 32px;
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
