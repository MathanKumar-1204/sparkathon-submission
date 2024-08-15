import React, { useEffect, useState } from 'react';
import { ref, get, update } from 'firebase/database';
import { database } from './firebase';
import './Stock.css';
import { Link } from 'react-router-dom';
import { SearchBar2 } from './SearchBar2';

const Stock = () => {
  const [items, setItems] = useState({});
  const [selectedStorage, setSelectedStorage] = useState('storage1'); // Default to storage1
  const todayDate = new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'); // Format DD-MM-YYYY

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbRef = ref(database, `storages/${selectedStorage}/items`);
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          setItems(snapshot.val());
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [selectedStorage]); // Fetch data whenever selectedStorage changes

  const handleStorageChange = (storage) => {
    setSelectedStorage(storage);
  };

  const handleUpdate = async (itemName, operation) => {
    try {
      const itemRef = ref(database, `storages/${selectedStorage}/items/${itemName}`);
      const storageRef = ref(database, `storages/${selectedStorage}`);
      
      // Fetch item data
      const itemSnapshot = await get(itemRef);
      if (itemSnapshot.exists()) {
        const itemData = itemSnapshot.val();
        const currentDate = new Date().toLocaleDateString('en-GB').split('/').reverse().join('-');
  
        // Update present quantity
        const updatedPresentQuantity = operation === '+' ? itemData.present + 1 : itemData.present - 1;
  
        // Update sold today
        let updatedSoldToday = itemData[currentDate] || 0;
        if (operation === '-') {
          updatedSoldToday += 1;
        }
  
        // Fetch storage size
        const storageSnapshot = await get(storageRef);
        const currentSize = storageSnapshot.val().size;
  
        // Calculate new size
        const updatedSize = operation === '+' ? currentSize - 1 : currentSize + 1;
  
        // Update database
        await update(itemRef, {
          present: updatedPresentQuantity,
          [currentDate]: updatedSoldToday,
        });
        
        await update(storageRef, {
          size: updatedSize
        });
  
        // Update local state
        setItems((prevItems) => ({
          ...prevItems,
          [itemName]: {
            ...prevItems[itemName],
            present: updatedPresentQuantity,
            [currentDate]: updatedSoldToday,
          },
        }));
      }
    } catch (error) {
      console.error("Error updating data: ", error);
    }
  };
  
  
  

  const getMostRecentSoldToday = (itemData) => {
    const dates = Object.keys(itemData).filter(date => date !== 'present');
    const mostRecentDate = dates.reduce((latest, current) => {
      return new Date(current.split('-').reverse().join('-')) > new Date(latest.split('-').reverse().join('-')) ? current : latest;
    }, '');
    return itemData[mostRecentDate] || 0;
  };

  return (
    <div>
   
      
        <div className="sidebar">
        <div className="stitle"><h3>STOCK PAGE</h3></div>
        <ul>
          <li class="shome"><Link to="/dashboard"> DASHBOARD<span class="material-symbols-outlined">home</span></Link></li>
          <li class="scalc"><Link to="/calculator">PREDICTOR<span class="material-symbols-outlined">calculate</span></Link></li>
          <li class="sstock"><Link to="/stock"><span class="st"><h3>INVENTORY</h3></span><span class="material-symbols-outlined">warehouse</span></Link></li>
          <li class="sdistribute"><Link to="/distribution">DISTRIBUTION<span class="material-symbols-outlined">move_down</span></Link></li>
          <li class="slog"><Link to="/">LOGOUT<span class="material-symbols-outlined">logout</span></Link></li>
        </ul>
      </div>
      <div>
      <div class="storage">
        <div class="select"><center><h3>SELECT STORAGE: </h3></center></div>
        <SearchBar2 onSelectStorage={handleStorageChange} initialstorage={selectedStorage} />
        </div>
        <div class="table">
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Present Quantity</th>
            <th>Sold Today</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(items).map(([itemName, itemData]) => (
            <tr key={itemName}>
              <td>{itemName}</td>
              <td>{itemData.present}</td>
              <td>{itemData[todayDate] || getMostRecentSoldToday(itemData)}</td>
              <td>
                <button onClick={() => handleUpdate(itemName, '+')}>+</button>
                <button onClick={() => handleUpdate(itemName, '-')}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
    </div>
  );
};

export default Stock;
