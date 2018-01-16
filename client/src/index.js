import React from 'react';
import ReactDOM from 'react-dom';
// react-dom (what we'll use here)
import { BrowserRouter } from 'react-router-dom'

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
