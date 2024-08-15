import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Calculator from './Calculator';
import Stock from './Stock'; // Ensure this component exists
import './App.css';
import Distribution from './Distribution';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calculator" element={<Calculator />} /> 
        <Route path="/stock" element={<Stock />} />  
        <Route path="/distribution" element={<Distribution />} />   
      </Routes>
    </Router>
  );
};

export default App;
