import {FunctionComponent} from 'react';
import Search from '../components/search';

const Header: FunctionComponent = () => {
  return (
    <header>
      <div className="search-input">
        <Search />
      </div>
      <style jsx>{`
        header {
          background-color: #5D658B;
          height: 75px;
        }
        .search-input {
          width: 500px;
          margin: auto;
        }
      `}</style>
    </header>
  );
};

export default Header;
