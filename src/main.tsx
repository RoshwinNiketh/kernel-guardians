import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/main.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);

import './styles/production.css';

import './styles/cinematic.css';
import './styles/intro.css';
