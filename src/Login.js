import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import "./Login.css";
import { database } from './firebase';
import Swal from 'sweetalert2';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userRef = ref(database, `users/${username}`);
      const snapshot = await get(userRef);
      const user = snapshot.val();
      
      if (user && user.password === password) {
        Swal.fire({
          title: "SUCCESS",
          text: "You have logged in!",
          icon: "success"
        })
        localStorage.setItem('username', username);
        navigate('/dashboard', { state: { username } });
        setError('');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="login-page"> {/* Apply the login-page class here */}
      <div className="login-container">
        <h2 className="h">LOGIN</h2>
        <form class="f" onSubmit={handleLogin}>
          <div className="form-group">
            <label class="l1" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              placeholder='Enter username...'
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label class="l2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder='Enter password...'

              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;