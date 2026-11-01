import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import PilotApp from './PilotApp';
import './styles/main.css';
const Experience = new URLSearchParams(location.search).get('pilot') === '1' ? PilotApp : App;
createRoot(document.getElementById('root')!).render(<React.StrictMode><Experience /></React.StrictMode>);

import './styles/production.css';
