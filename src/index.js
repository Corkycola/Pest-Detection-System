import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom/client
import App from './App';
import { AuthProvider } from './firebase/AuthContext';

console.log('Script loaded'); // Confirm script runs

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement); // Log the root element

if (rootElement) {
  const root = createRoot(rootElement); // Use createRoot instead of ReactDOM.render
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element.');
}
