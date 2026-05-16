import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <noscript>Your browser does not support JavaScript!</noscript>
    <App />
  </React.StrictMode>
);
