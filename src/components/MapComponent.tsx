import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import SearchBar from './SearchBar'
import RelaisList from './RelaisList'
import { Relay } from '@/types'

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list')
  const [relaisData, setRelaisData] = useState<Relay[]>([])
  const [selectedRelais, setSelectedRelais] = useState<Relay | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Initialisation carte (1 seule fois)
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.3333, 48.8666],
      zoom: 9,
    })

    map.current.on('load', () => {
      setIsReady(true)
    })
  }, [])

  // Recentrage si un relais est sélectionné
  useEffect(() => {
    if (!map.current || !selectedRelais) return
    const { latitude, longitude } = selectedRelais.place.geo
    map.current.flyTo({
      center: [longitude, latitude],
      zoom: 14,
      essential: true,
    })
  }, [selectedRelais])

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row">
      {isReady && (
          <SearchBar
            mapInstance={map.current!}
            setRelaisData={setRelaisData}
            relaisData={relaisData}
            setSelectedRelais={setSelectedRelais}
            setViewMode={setViewMode}
          />
      )}

      <div ref={mapContainer} className="absolute inset-0 z-10 h-full" />

      {/* 📋 Liste — Desktop uniquement */}
      {relaisData.length > 0 && (
        <div
          className="absolute top-32 bottom-4 right-4 z-20 w-80 max-h-[80%] overflow-auto
          bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hidden md:block"
        >
          <RelaisList
            data={relaisData}
            viewMode={viewMode}
            selectedRelais={selectedRelais}
            setViewMode={setViewMode}

            setSelectedRelais={setSelectedRelais}
          />
        </div>
      )}

      {relaisData.length > 0 && (
        <div
        className={`
          absolute inset-x-0 bottom-0 z-30 md:hidden
          bg-white rounded-t-lg shadow-lg overflow-y-auto
          transition-all duration-300
          ${viewMode === 'details'
              ? 'bottom-0 max-h-[80%]' 
              : 'bottom-0 max-h-[50%]'}
        `}
        >
          <RelaisList
            data={relaisData}
            viewMode={viewMode}
            selectedRelais={selectedRelais}
            setViewMode={setViewMode}
            setSelectedRelais={setSelectedRelais}
          />
        </div>
      )}
    </div>
  )
}
