import { useEffect } from 'react';
import axios from 'axios';
import maplibregl from 'maplibre-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { normalizeRelaisDataWithDistance } from '@/utils/normalizeRelaisData';
import { useWidgetContext } from '@/context/WidgetContext';
import { Relay } from '@/types';

interface Props {
  mapInstance: maplibregl.Map;
  setRelaisData: (arr: Relay[]) => void;
  relaisData: Relay[];
  setSelectedRelais: (rel: Relay) => void;
  setViewMode: (mode: 'list' | 'details') => void;
}

export default function SearchBar({
  mapInstance,
  setRelaisData,
  relaisData,
  setSelectedRelais,
  setViewMode,
}: Props) {
  const { apiBaseUrl } = useWidgetContext();

  // Ajout du geocoder en tant que contrôle de la carte
  useEffect(() => {
    if (!mapInstance) return;

    // On caste maplibre-gl en tant que mapboxgl attendu par les types
    const geocoder = new MapboxGeocoder({
      accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string,
      mapboxgl: maplibregl,
      marker: false,
      placeholder: 'Ville ou adresse…',
      countries: 'fr',
    });

    // Ajoute le contrôle dans la carte. On choisit explicitement la position
    // 'top-left' pour faciliter la personnalisation via CSS et éviter
    // l’existence simultanée des conteneurs top-left et top-right.
    mapInstance.addControl(geocoder, 'top-left');

    geocoder.on('result', async (event) => {
      const result = event.result;
      const [lng, lat] = result.center;
      const query = encodeURIComponent(result.place_name);
      const url = `${apiBaseUrl}/api/v1/relais/search?query=${query}`;
      try {
        const response = await axios.get(url);
        const rawRelais = response.data.pointsRelais || [];
        const relais = normalizeRelaisDataWithDistance(rawRelais, lat, lng);
        setRelaisData(relais);
      } catch (error) {
        console.error('Erreur lors de la récupération des points relais:', error);
      }
    });

    return () => {
      mapInstance.removeControl(geocoder);
    };
  }, [mapInstance, apiBaseUrl, setRelaisData]);

  // Affiche les marqueurs pour chaque relais
  useEffect(() => {
    const newMarkers = relaisData.map((loc) => {
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<h3 class="font-bold">${loc.name}</h3><p>${loc.place.address.addressLocality}</p>`
      );
      const marker = new maplibregl.Marker()
        .setLngLat([loc.place.geo.longitude, loc.place.geo.latitude])
        .setPopup(popup)
        .addTo(mapInstance);
      marker.getElement().addEventListener('click', () => {
        mapInstance.flyTo({ center: [loc.place.geo.longitude, loc.place.geo.latitude] });
        setSelectedRelais(loc);
        setViewMode('details');
      });
      return marker;
    });
    return () => {
      newMarkers.forEach((m) => m.remove());
    };
  }, [relaisData, mapInstance, setSelectedRelais, setViewMode]);

  return null;
}