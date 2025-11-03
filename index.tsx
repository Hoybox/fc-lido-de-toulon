import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

let rootElement = document.getElementById('root');
if (!rootElement) {
  console.warn('The #root element was not found in the DOM. It will be created dynamically.');
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);