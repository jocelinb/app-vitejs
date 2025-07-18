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
    <>
      {isReady && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <SearchBar
            mapInstance={map.current!}
            setRelaisData={setRelaisData}
            relaisData={relaisData}
            setSelectedRelais={setSelectedRelais}
            setViewMode={setViewMode}
          />
        </div>
      )}

      <div ref={mapContainer} className="absolute inset-0 z-10" />

      <div
        className="
          absolute top-24 bottom-4 right-4 z-20
          w-80 overflow-auto
          bg-white/90 backdrop-blur-sm
          rounded-lg shadow-lg
        "
      >
        <RelaisList
          data={relaisData}
          viewMode={viewMode}
          selectedRelais={selectedRelais}
          setViewMode={setViewMode}
          setSelectedRelais={setSelectedRelais}
        />
      </div>
    </>
  )
}
