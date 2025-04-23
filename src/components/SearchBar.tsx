import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { normalizeRelaisData } from '../utils/normalizeRelaisData'

interface Props {
  mapInstance: mapboxgl.Map
  setRelaisData(arr: any[]): void
  relaisData: any[]
  setSelectedRelais(rel: any): void
  setViewMode(mode: 'list'|'details'): void
}

export default function SearchBar({
  mapInstance, setRelaisData, relaisData,
  setSelectedRelais, setViewMode
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!mapInstance || !ref.current) return;
  
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken!,
      mapboxgl: mapboxgl as any,
      marker: false,
      placeholder: 'Ville ou adresse…',
      countries: 'fr',
    });
  
    ref.current.appendChild(geocoder.onAdd(mapInstance));
  
    geocoder.on('result', async (event) => {
      const query = encodeURIComponent(event.result.place_name);
      const url = `http://localhost:5000/api/v1/relais/search?query=${query}`;
  
      try {
        const response = await axios.get(url);
        const relais = Array.isArray(response.data.pointsRelais)
          ? normalizeRelaisData(response.data.pointsRelais)
          : [];
  
        console.log("Données récupérées via :", response.data.source || 'inconnue');
        setRelaisData(relais);
      } catch (error) {
        console.error("Erreur lors de la récupération des points relais:", error);
      }
    });
  
    return () => {
      mapInstance.removeControl(geocoder);
    };
  }, [mapInstance]);
  

  useEffect(() => {
    markers.forEach(m => m.remove())
    const newM = relaisData.map(loc => {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <h3 class="font-bold">${loc.name}</h3>
          <p>${loc.place.address.addressLocality}</p>
        `)
      const m = new mapboxgl.Marker()
        .setLngLat([loc.place.geo.longitude, loc.place.geo.latitude])
        .setPopup(popup)
        .addTo(mapInstance)
      m.getElement().addEventListener('click', () => {
        mapInstance.flyTo({ center: [loc.place.geo.longitude, loc.place.geo.latitude] })
        setSelectedRelais(loc)
        setViewMode('details')
      })
      return m
    })
    setMarkers(newM)
  }, [relaisData])

  return (
    <div ref={ref} className="w-full flex justify-center" />
  )
}