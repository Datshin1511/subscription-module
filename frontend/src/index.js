import React from 'react';
import ReactDOM from 'react-dom/client';

import './styles/index.css';
import './styles/header.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import App from './pages/App';
import Header from './components/Header'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Header/>
    <App />
  </React.StrictMode>
);

