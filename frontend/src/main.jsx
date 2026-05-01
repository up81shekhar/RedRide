import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import UserContext from './context/UserContext.jsx';
import CaptainContext from './context/CaptainContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <SocketProvider>
      <UserContext>
        <CaptainContext>
          <App />
        </CaptainContext>
      </UserContext>
    </SocketProvider>
  </BrowserRouter>
);
