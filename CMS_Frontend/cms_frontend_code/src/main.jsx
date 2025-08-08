import React from "react";
import ReactDOM from "react-dom/client";
import "./logInSignUp/logInSignUp.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppTheme from '../shared-theme/AppTheme';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from "./auth/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <AppTheme>
       <CssBaseline />
        <AuthProvider>
         <App />
        </AuthProvider>
     </AppTheme>
   </StrictMode>,
 )
