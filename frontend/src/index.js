import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store'; // Import persistor
import { PersistGate } from 'redux-persist/integration/react'; // Import PersistGate
import './styles/index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      {/* PersistGate wraps the App to delay rendering until Redux state is loaded from storage */}
      <PersistGate loading={null} persistor={persistor}> 
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
