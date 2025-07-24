'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        success: {
          style: {
            background: '#f0f8f0',
            color: '#2e7d32',
            border: '1px solid #66bb6a',
          },
        },
        error: {
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fca5a5',
          },
        },
      }}
    />
  )
}