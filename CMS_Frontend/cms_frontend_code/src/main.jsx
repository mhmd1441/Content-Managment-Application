import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppTheme from '../shared-theme/AppTheme';
import { CssBaseline } from '@mui/material';

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <AppTheme>
       <CssBaseline />
       <App />
     </AppTheme>
   </StrictMode>,
 )
