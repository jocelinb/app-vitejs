import { useEffect, useRef } from 'react'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { normalizeRelaisData } from '@/utils/normalizeRelaisData'
import { useWidgetContext } from '@/context/WidgetContext'
import { Relay } from '@/types'

interface Props {
  mapInstance: mapboxgl.Map
  setRelaisData: (arr: Relay[]) => void
  relaisData: Relay[]
  setSelectedRelais: (rel: Relay) => void
  setViewMode: (mode: 'list' | 'details') => void
}

export default function SearchBar({
  mapInstance, setRelaisData, relaisData,
  setSelectedRelais, setViewMode
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { apiBaseUrl } = useWidgetContext()

  // Effet : initialiser le geocoder
  useEffect(() => {
    if (!mapInstance || !ref.current) return;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken!,
      mapboxgl: mapboxgl as unknown as typeof import("mapbox-gl"),
      marker: false,
      placeholder: 'Ville ou adresse…',
      countries: 'fr',
    })

    ref.current.appendChild(geocoder.onAdd(mapInstance));

    geocoder.on('result', async (event) => {
      const query = encodeURIComponent(event.result.place_name)
      const url = `${apiBaseUrl}/api/v1/relais/search?query=${query}`

      try {
        const response = await axios.get(url)
        const relais = Array.isArray(response.data.pointsRelais)
          ? normalizeRelaisData(response.data.pointsRelais)
          : []

        console.log("Données récupérées via :", response.data.source || 'inconnue')
        setRelaisData(relais)
      } catch (error) {
        console.error("Erreur lors de la récupération des points relais:", error)
      }
    });

    return () => {
      mapInstance.removeControl(geocoder);
    };
  }, [mapInstance, apiBaseUrl, setRelaisData])

  // Effet : afficher les marqueurs pour les relais
  useEffect(() => {
    // Si tu veux éviter de gérer markers dans le state => tout local
    const newMarkers = relaisData.map(loc => {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <h3 class="font-bold">${loc.name}</h3>
          <p>${loc.place.address.addressLocality}</p>
        `)

      const marker = new mapboxgl.Marker()
        .setLngLat([loc.place.geo.longitude, loc.place.geo.latitude])
        .setPopup(popup)
        .addTo(mapInstance)

      marker.getElement().addEventListener('click', () => {
        mapInstance.flyTo({ center: [loc.place.geo.longitude, loc.place.geo.latitude] })
        setSelectedRelais(loc)
        setViewMode('details')
      })

      return marker
    })

    return () => {
      newMarkers.forEach(m => m.remove())
    }
  }, [relaisData, mapInstance, setSelectedRelais, setViewMode])

  return (
    <div ref={ref} className="w-full flex justify-center" />
  )
}
