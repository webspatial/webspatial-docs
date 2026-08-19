import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SpatialBoot } from '@webspatial/react-sdk'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SpatialBoot>
      <App />
    </SpatialBoot>
  </StrictMode>,
)
