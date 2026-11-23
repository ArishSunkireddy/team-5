import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { finishAuthor } from '../../menu/progress'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App onComplete={() => finishAuthor("shakespeare")} />
  </React.StrictMode>,
)
