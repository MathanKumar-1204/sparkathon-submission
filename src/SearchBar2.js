import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from './firebase';

const SearchBar2 = ({ onSelectStorage, initialstorage }) => {
  const [storages, setStorages] = useState([]);
  const [storageInput, setStorageInput] = useState(initialstorage);
  const [storageSuggestions, setStorageSuggestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbRef = ref(database, 'storages');
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const storageNames = Object.keys(data); // Extract storage names
          setStorages(storageNames);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setStorageInput(value);
    if (value) {
      setStorageSuggestions(storages.filter(item => item.toLowerCase().includes(value.toLowerCase())));
    } else {
      setStorageSuggestions([]);
    }
  };

  const handleSelect = (storage) => {
    setStorageInput(storage);
    setStorageSuggestions([]);
    onSelectStorage(storage);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={storageInput}
        onChange={handleChange}
        placeholder="Search for a storage..."
      />
      {storageSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {storageSuggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSelect(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { SearchBar2 };
