import {MongoClient} from 'mongodb';
import config from './config';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  // @ts-ignore
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

clientPromise = clientPromise.then((client: MongoClient): MongoClient => {
  const db = client.db(config.DB_NAME);
  const collections = db.collection(config.COLLECTIONS_COLLECTION_NAME);
  collections.createIndex({uid: 1}, {unique: true}, (error, result) => {
    if (error) {
      console.error('error creating index', config.NFTS_COLLECTION_NAME, error);
    }
  });
  const nfts = db.collection(config.NFTS_COLLECTION_NAME);
  nfts.createIndex({uid: 1}, {unique: true}, (error, result) => {
    if (error) {
      console.error('error creating index', config.NFTS_COLLECTION_NAME, error);
    }
  });
  return client;
});

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise as Promise<MongoClient>;
