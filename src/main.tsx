import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './reset.css'
import './global.css'
import './index.css'
import './App.css'

// Force dark background immediately before any rendering
document.documentElement.style.backgroundColor = '#141414';
document.body.style.backgroundColor = '#141414';
document.body.style.color = 'white';

// Create a style element with high specificity
const forceStyles = document.createElement('style');
forceStyles.innerHTML = `
  html, body, #root, div:not(button > div), main, section, article, nav, footer, header {
    background-color: #141414 !important;
    color: white !important;
  }
  
  button > div {
    background-color: inherit !important;
  }
`;
document.head.appendChild(forceStyles);

console.log('main.tsx is executing');

// Wait for DOM to be fully loaded before rendering
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Failed to find the root element');
    return;
  }
  
  // Set inline styles with !important
  rootElement.setAttribute('style', 'background-color: #141414 !important; color: white !important; min-height: 100vh !important;');
  
  console.log('Root element found, creating React root');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('Rendering React app');
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  console.log('React app rendered successfully');
});

// Backup render in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => {
    const rootElement = document.getElementById('root');
    if (rootElement && !rootElement.hasChildNodes()) {
      console.log('Backup rendering triggered');
      rootElement.setAttribute('style', 'background-color: #141414 !important; color: white !important; min-height: 100vh !important;');
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
    }
  }, 0);
}
