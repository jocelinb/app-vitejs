import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import App from '@/App'
import { WidgetProvider } from '@/context'
import mapboxgl from 'mapbox-gl'

const root = createRoot(document.getElementById('root')!)

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string

root.render(
  <StrictMode>
    <WidgetProvider
      initialConfig={{
        apiKey: 'a8fbc525cb87ccaf9e805679ebd1054d60beb2f0db93dc6c0e176abfaf9f265f',
        externalClientId: 'demo_client',
        cart: [],
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
        merchantUrl: 'http://localhost:5002',
      }}
    >
      <App />
    </WidgetProvider>
  </StrictMode>
)
