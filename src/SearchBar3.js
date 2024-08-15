import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import {database} from './firebase';


const SearchBar3= ({  onSelectItem, initialItem }) => {
  const [items, setItemNames] = useState([]);
  const [iteminput, setInputValue] = useState(initialItem);
  const [itemsuggest, setitemSuggest] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbiRef = ref(database, 'storages/storage1/items');
        const snapishot = await get(dbiRef);
        
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
  
  const handleiChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      setitemSuggest(items.filter(item => item.toLowerCase().includes(value.toLowerCase())));
    } else {
      setitemSuggest([]);
    }
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
export {SearchBar3};
