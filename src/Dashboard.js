import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Link, useLocation } from 'react-router-dom';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { ref, get } from 'firebase/database';
import './Dashboard.css';
import {database} from './firebase';
import { Bar } from 'react-chartjs-2';


ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

const Dashboard = () => {

  const location = useLocation();
  const username = location.state?.username || localStorage.getItem('username');
  const [hike, setHike] = useState(null); // Initialize state for hike
  const [name, setName] = useState(null);

  const [perf1, setperf1] = useState(null);
  const [perf2, setperf2] = useState(null);
  const [perf3, setperf3] = useState(null);
  const [perf4, setperf4] = useState(null);

  useEffect(() => {
    const fetchHikeData = async () => {
      if (!username) {
        console.error('No username found');
        return;
      }

      try {
        const userRef = ref(database, `users/${username}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();

        if (userData) {
          setHike(userData.hike * 100);
          setName(userData.name);
          setperf1(userData.performance1);
          setperf2(userData.performance2);
          setperf3(userData.performance3);
          setperf4(userData.performance4);


       
        } else {
          console.error('User data not found');
        }
      } catch (error) {
        console.error('Error fetching data from Firebase:', error);
      }
    };

    fetchHikeData();
  }, [username]);
  // Data for the pie chart
  const data = {
    labels: ['YES', 'NO'],
    datasets: [
      {
        label: 'My Pie Chart',
        data: [hike, 100-hike],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',

        ],
        borderWidth: 1,
      },
    ],
  };

  const bdata = {
    labels: ['Performance1','Performance2','Performance3','Performance4'],
    datasets: [
      {
        label: 'Monthly Performance',
        data: [perf1,perf2,perf3,perf4],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Options for the bar chart
  const boptions = {
    responsive: true,
    maintainAspectRatio:false,
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
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="container">
       <div className="sidebar">
        <div className="stitle"><h3>DASHBOARD</h3></div>
        <ul>
          <li class="dhome"><Link to="/dashboard"> <span class="dt"><h3>DASHBOARD</h3></span><span class="material-symbols-outlined">home</span></Link></li>
          <li class="dcalc"><Link to="/calculator">PREDICTOR<span class="material-symbols-outlined">calculate</span></Link></li>
          <li class="dstock"><Link to="/stock">INVENTORY<span class="material-symbols-outlined">warehouse</span></Link></li>
          <li class="ddistribute"><Link to="/distribution">DISTRIBUTION<span class="material-symbols-outlined">move_down</span></Link></li>
          <li class="dlog"><Link to="/">LOGOUT<span class="material-symbols-outlined">logout</span></Link></li>
        </ul>
      </div>
      <div className="main-content">
        <h1>Welcome, {name}</h1>
        <div class="charts">
          <div class="pie">
            <h2>YOUR HIKE POSSIBILITY</h2>
            <Pie class="dpie"data={data} />
          </div>  
          <div class="Bar">
            <h2>MONTHLY PERFORMANCE</h2>
            <Bar class="dbar"data={bdata} options={boptions} />
          </div> 
        </div> 
      </div>
    </div>
  );
};

export default Dashboard;