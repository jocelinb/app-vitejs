// Import les feuilles de style comme chaînes afin de pouvoir les injecter
// dans le Shadow DOM du widget. Vite permet d’utiliser la
// requête `?inline` pour importer le contenu des fichiers CSS en
// tant que texte lors de la compilation.
import maplibreCss from 'maplibre-gl/dist/maplibre-gl.css?inline';
import mapboxGeocoderCss from '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css?inline';
import widgetStyles from '@/index.css?inline';

import { createRoot } from 'react-dom/client';
import App from '@/App';
import { WidgetProvider } from '@/context';
import { CartItem } from '@/types';
import React from 'react';
const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL as string;

declare global {
  interface Window {
    PaniecoWidget: {
      init(opts: {
        containerId: string;
        userId: string;
        externalClientId: string;
        cart: CartItem[];
        apiBaseUrl?: string;
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
    merchantUrl,
  }: {
    containerId: string;
    userId: string;
    externalClientId: string;
    cart: CartItem[];
    apiBaseUrl?: string;
    merchantUrl: string;
  }) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(
        `PaniecoWidget init error: container "${containerId}" not found`,
      );
      return;
    }

    // Crée ou récupère un Shadow DOM sur le conteneur pour isoler
    // complètement le widget et éviter les conflits de styles avec la page hôte.
    const shadowRoot =
      container.shadowRoot ?? container.attachShadow({ mode: 'open' });

    // Injecte les styles requis dans le shadowRoot. Si le widget est
    // initialisé plusieurs fois, on s’assure de ne pas réinjecter
    // plusieurs fois les mêmes styles en vérifiant leur présence.
    if (!shadowRoot.querySelector('style[data-paniewidget]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-paniewidget', 'true');
      styleEl.textContent = `${maplibreCss}\n${mapboxGeocoderCss}\n${widgetStyles}`;
      shadowRoot.appendChild(styleEl);
    }

    // Monte l’application React dans le shadowRoot.
    const root = createRoot(shadowRoot);
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