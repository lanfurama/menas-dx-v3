import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import MenasDX from './src/App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(BrowserRouter, null, React.createElement(MenasDX))
)
