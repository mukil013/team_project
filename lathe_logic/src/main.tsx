import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Bro } from 'react-router-dom'
import 'antd/dist/reset.css';

createRoot(document.getElementById('root')!).render(
    <>
      <Bro>
        <App />
      </Bro>
    </>
)
