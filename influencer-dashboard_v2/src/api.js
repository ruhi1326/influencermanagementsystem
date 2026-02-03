//influencer-dashboard_v2/src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your backend URL
});

// Add token to headers if exists
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token'); // store JWT here after login
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token'); // instead of localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

