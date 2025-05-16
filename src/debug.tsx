import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const DebugComponent = () => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#181818',
      borderRadius: '8px',
      margin: '20px auto',
      maxWidth: '800px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h1 style={{
        color: '#E50914',
        fontSize: '24px',
        marginBottom: '16px'
      }}>React Debug Component</h1>
      
      <p style={{ color: 'white', marginBottom: '16px' }}>
        If you can see this message, React is working correctly!
      </p>
      
      <div style={{
        backgroundColor: '#222',
        padding: '16px',
        borderRadius: '4px',
        color: '#00ff00',
        fontFamily: 'monospace'
      }}>
        React version: {React.version}
      </div>
    </div>
  );
};

// Find the root element
const rootElement = document.getElementById('root');

// Render if the element exists
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <DebugComponent />
    </React.StrictMode>
  );
  console.log('Debug component rendered successfully');
} else {
  console.error('Failed to find the root element');
} 