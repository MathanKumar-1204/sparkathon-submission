import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import {database} from './firebase';


const SearchBar= ({ onSelectStorage, onSelectItem, initialstorage, initialItem }) => {
  const [items, setItemNames] = useState([]);
  const [storages, setstorages] = useState([]);
  const [iteminput, setInputValue] = useState(initialItem);
  const [storageinput, setStorageValue] = useState(initialstorage);
  const [storagesuggest, setstorageSuggest] = useState([]);
  const [itemsuggest, setitemSuggest] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbsRef = ref(database, 'storages');
        const snapsshot = await get(dbsRef);
        const dbiRef = ref(database, 'storages/storage1/items');
        const snapishot = await get(dbiRef);
        if (snapsshot.exists()) {
          const sdata = snapsshot.val();
          const snames = Object.keys(sdata); // Extract item names
          setstorages(snames);
        } else {
          console.log("No data available");
        }
        if (snapishot.exists()) {
          const idata = snapishot.val();
          const inames = Object.keys(idata); // Extract item names
          setItemNames(inames);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);
  const handlesChange = (e) => {
    const value = e.target.value;
    setStorageValue(value);
    if (value) {
      setstorageSuggest(storages.filter(item => item.toLowerCase().includes(value.toLowerCase())));
    } else {
      setstorageSuggest([]);
    }
  };
  const handleiChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      setitemSuggest(items.filter(item => item.toLowerCase().includes(value.toLowerCase())));
    } else {
      setitemSuggest([]);
    }
  };

  const handlesSelect = (storage) => {
    setStorageValue(storage);
    setstorageSuggest([]);
    onSelectStorage(storage);
  };

  const handleiSelect = (item) => {
    setInputValue(item);
    setitemSuggest([]);
    onSelectItem(item);
  };
return (
  <div>
    <div className="search-bar">
      <input
        type="text"
        value={storageinput}
        onChange={handlesChange}
        placeholder="Search for a storage..."
      />
      {storagesuggest.length > 0 && (
        <ul className="suggestions-list">
          {storagesuggest.map((suggestion, index) => (
            <li key={index} onClick={() => handlesSelect(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
    <div className="search-bar">
      <input
        type="text"
        value={iteminput}
        onChange={handleiChange}
        placeholder="Search for an item..."
      />
      {itemsuggest.length > 0 && (
        <ul className="suggestions-list">
          {itemsuggest.map((suggestion, index) => (
            <li key={index} onClick={() => handleiSelect(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
    
    </div>
  );
};
export default SearchBar;
