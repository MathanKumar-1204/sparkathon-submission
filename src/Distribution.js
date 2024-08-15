import React, { useState } from 'react';
import { SearchBar3 } from './SearchBar3';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Distribution.css';
const Distribution = () => {
    const [operation, setOperation] = useState('');
    const [itemName, setItemName] = useState('');
    const [amount, setAmount] = useState('');
    const [resultMessage, setResultMessage] = useState('');  // State to hold the result message
    
    const handleStorageChange = (itemName) => {
        setItemName(itemName);
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, continue!"
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: "Changed",
                text: "Your item has been moved",
                icon: "success"
              });
            }
          });

        try {
            const response = await fetch('http://localhost:5000/update_inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operation,
                    item_name: itemName,
                    amount: parseInt(amount),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setResultMessage(data.result);  // Update the state with the result
        } catch (error) {
            console.error('Error:', error);
            setResultMessage('An error occurred');  // Display an error message
        }
    };

    return (
        <div class="whole">
        <div >
            <div className="sidebar">
        <div className="stitle"><h3>DISTRIBUTION</h3></div>
        <ul>
          <li class="ddhome"><Link to="/dashboard"> DASHBOARD<span class="material-symbols-outlined">home</span></Link></li>
          <li class="ddcalc"><Link to="/calculator">PREDICTORTOR<span class="material-symbols-outlined">calculate</span></Link></li>
          <li class="ddstock"><Link to="/stock">INVENTORY<span class="material-symbols-outlined">warehouse</span></Link></li>
          <li class="dddistribute"><Link to="/distribution"><span class="ddt"><h3>DISTRIBUTION</h3></span><span class="material-symbols-outlined">move_down</span></Link></li>
          <li class="ddlog"><Link to="/">LOGOUT<span class="material-symbols-outlined">logout</span></Link></li>
        </ul>
      </div>
      <div class="dis"><h2>OPTIMAL DISTRIBUTION</h2></div>
            <form onSubmit={handleSubmit} class="form">
                <label>
                    Operation: 
                    <select value={operation} onChange={(e) => setOperation(e.target.value)}>
                        <option value="">Select</option>
                        <option value="add">Add</option>
                        <option value="remove">Remove</option>
                    </select>
                    </label>
                <br />
                <label>
                    Item Name:
                    <SearchBar3 onSelectItem={handleStorageChange} initialItem={itemName} /></label>
                
                <br />
                <label>
                    Amount:</label>
                    <input type="number" min={1} max={50} value={amount} onChange={(e) => setAmount(e.target.value)} />
                
                <br />
                <button type="submit">Submit</button>
            </form><center>
            {resultMessage && <h3 class="msg">{resultMessage}</h3>}  </center>{/* Display the result message */}
        </div></div>
    );
};

  
 
export default Distribution;
