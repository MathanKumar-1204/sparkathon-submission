import React, { useState } from 'react';
import SearchBar from './SearchBar';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import "./Calculator.css";
import './App.css';

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

const Calculator = () => {
    const [selectedStorage, setSelectedStorage] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [values, setValues] = useState([]);
    const [date, setDate] = useState('');

    const handleCalculate = async () => {
        try {
            const response = await fetch('http://localhost:5000/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ item: selectedItem, storage: selectedStorage }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setValues(data.values);
            setDate(data.date);
        } catch (error) {
            console.error('Error calculating data:', error);
        }
    };

    // Create chart data based on the fetched values
    const bdata = {
        labels: values.map((_, index) => `Day ${index + 1}`), // Labels for each bar
        datasets: [
            {
                label: "Predicted Sales",
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Options for the bar chart
    const boptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                beginAtZero: true,
            },
        },
    };

    return (
        <div>
              <div className="sidebar">
        <div className="ctitle"><h3>PREDICTOR</h3></div>
        <ul>
          <li class="chome"><Link to="/dashboard"> DASHBOARD<span class="material-symbols-outlined">home</span></Link></li>
          <li class="ccalc"><Link to="/calculator"><span class="ct"><h3>PREDICTOR</h3></span><span class="material-symbols-outlined">calculate</span></Link></li>
          <li class="cstock"><Link to="/stock">INVENTORY<span class="material-symbols-outlined">warehouse</span></Link></li>
          <li class="cdistribute"><Link to="/distribution">DISTRIBUTION<span class="material-symbols-outlined">move_down</span></Link></li>
          <li class="clog"><Link to="/">LOGOUT<span class="material-symbols-outlined">logout</span></Link></li>
        </ul>
      </div>
            <div className="calculator-page">
                <center><h2>SELECT AN ITEM</h2></center>
                <SearchBar onSelectStorage={setSelectedStorage}  onSelectItem={setSelectedItem} initialstorage={selectedStorage} initialItem={selectedItem} />
                <button class="b"onClick={handleCalculate}>Calculate</button>
                <div>
                    <h3>EXPECTED OUT OF STOCK DATE:</h3><p> {date}</p>
                    <div className="Bar">
                        <h2>PREDICTED SALES</h2>
                        <div class="bar">
                        <Bar data={bdata} options={boptions} /></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calculator;