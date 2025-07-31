import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import '@/index.css';

import { createRoot } from 'react-dom/client';
import App from '@/App';
import { WidgetProvider } from '@/context';
import { CartItem } from '@/types';
import React from 'react';
import maplibregl from 'maplibre-gl';

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const DEFAULT_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

declare global {
  interface Window {
    PaniecoWidget: {
      init(opts: {
        containerId: string;
        userId: string;
        externalClientId: string;
        cart: CartItem[];
        apiBaseUrl?: string;
        mapboxToken?: string;
        merchantUrl: string;
      }): void;
    };
  }
}

// Point d’entrée scriptable : expose un widget configurable sur l’objet global.
window.PaniecoWidget = {
  init({
    containerId,
    userId,
    externalClientId,
    cart,
    apiBaseUrl = DEFAULT_API_BASE,
    mapboxToken = DEFAULT_MAPBOX_TOKEN,
    merchantUrl,
  }) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(
        `PaniecoWidget init error: container "${containerId}" not found`,
      );
      return;
    }

    // Affecte le jeton pour le geocoder Mapbox. MapLibre lui-même
    // n’a pas besoin de jeton pour afficher des tuiles libres.
    maplibregl.accessToken = mapboxToken;

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <WidgetProvider
          initialConfig={{
            apiKey: userId,
            externalClientId,
            cart,
            apiBaseUrl,
            merchantUrl,
          }}
        >
          <App />
        </WidgetProvider>
      </React.StrictMode>,
    );
  },
};