import React from 'react'
import ReactDOM from 'react-dom/client'
import Shop from './Shop.jsx' // আমরা App.jsx ব্যবহার করছি না, সরাসরি Shop আনছি
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Shop />
  </React.StrictMode>,
)
