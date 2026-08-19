import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
            <Toaster
                position='top-right'
                toastOptions={{
                    duration: 4000,
                    style: {
                        borderRadius: '12px',
                        border: '1px solid #eadbc9',
                        background: '#fffdf9',
                        color: '#201711',
                        fontWeight: 600
                    },
                    success: { iconTheme: { primary: '#24523f', secondary: '#ffffff' } },
                    error: { iconTheme: { primary: '#b42318', secondary: '#ffffff' } }
                }}
            />
        </AuthProvider>
    </React.StrictMode>
)
