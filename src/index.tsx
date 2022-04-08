import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { globalvalue, Global } from './components/Global';
import './index.scss';

ReactDOM.render(
  <React.StrictMode>
    <Global.Provider value={globalvalue}>
      <App />
    </Global.Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
