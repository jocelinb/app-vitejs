import { useEffect, useState } from 'react'
import MarkerIcon from '@/icons/MarkerIcon'
import ShoppingCart from '@/icons/ShoppingCart'
import axios from 'axios'
import { useWidgetContext } from '@/context/WidgetContext'
import { Relay } from '@/types'

interface Props {
  data: Relay[]
  setSelectedRelais(relay: Relay): void
  setViewMode(mode: 'list' | 'details'): void
}

export default function RelaisListView({
  data,
  setSelectedRelais,
  setViewMode,
}: Props) {
  const { apiBaseUrl, apiKey } = useWidgetContext()

  // Nouveau format: ouverts + livrés
  const [countsOpen, setCountsOpen] = useState<Record<string, number>>({})
  const [countsDelivered, setCountsDelivered] = useState<Record<string, number>>({})

  // --- fetcher (appelable par effet + polling) ---
  const fetchCounts = async () => {
    if (!data.length) return
    const pickupIds = data.map((r) => r.id).join(',')
    try {
      const res = await axios.get(
        `${apiBaseUrl}/api/v1/group-orders/count-pickup`,
        {
          params: { pickup_point_ids: pickupIds },
          headers: { 'x-api-key': apiKey },
        }
      )

      // Nouveau format attendu
      if (res.data?.countsOpen || res.data?.countsDelivered) {
        setCountsOpen(res.data.countsOpen || {})
        setCountsDelivered(res.data.countsDelivered || {})
      } else {
        // Ancien format: tout dans counts = “ouverts”
        setCountsOpen(res.data.counts || {})
        setCountsDelivered({})
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des Panieco par point relais', err)
    }
  }

  // 1) Chargement initial
  useEffect(() => {
    fetchCounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, apiBaseUrl, apiKey])

  // 2) Polling léger (10s) tant qu’on affiche la liste
  useEffect(() => {
    if (!data.length) return
    const id = setInterval(fetchCounts, 10000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, apiBaseUrl, apiKey])

  // Relais avec Panieco “ouverts” en premier, puis par distance.
  const sortedRelays = [...data].sort((a, b) => {
    const aHasOpen = (countsOpen[a.id] || 0) > 0
    const bHasOpen = (countsOpen[b.id] || 0) > 0
    if (aHasOpen && !bHasOpen) return -1
    if (!aHasOpen && bHasOpen) return 1
    return (a.distanceKm || 0) - (b.distanceKm || 0)
  })

  return (
    <ul className="divide-y divide-gray-200">
      {sortedRelays.map((loc) => {
        const openCount = countsOpen[loc.id] || 0
        const deliveredCount = countsDelivered[loc.id] || 0

        return (
          <li
            key={loc.id}
            className={`relative p-4 space-y-2 hover:bg-gray-50 hover:shadow-sm border-l-4 transition-all duration-200
              ${openCount > 0 ? 'bg-yellow-50 border-yellow-400' : 'border-transparent'}
            `}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-800">{loc.name}</h3>

              {typeof loc.distanceKm === 'number' && (
                <span className="text-xs text-gray-700 bg-white/80 rounded px-2 py-0.5 shadow-sm ml-2 whitespace-nowrap">
                  {loc.distanceKm.toFixed(1)} km
                </span>
              )}
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MarkerIcon className="w-4 h-4 mt-1 text-blue-500" />
              <span>
                {loc.place.address.streetAddress} — {loc.place.address.postalCode}{' '}
                {loc.place.address.addressLocality}
              </span>
            </div>

            {openCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShoppingCart className="w-4 h-4 text-green-600" />
                <span>
                  {openCount} Panieco{openCount > 1 ? 's' : ''} dans ce point relais
                </span>
              </div>
            )}

            {deliveredCount > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                Déjà {deliveredCount} Panieco{deliveredCount > 1 ? 's' : ''} livrés dans ce point relais !
              </div>
            )}

            <button
              onClick={() => {
                setSelectedRelais(loc)
                setViewMode('details')
              }}
              className="btn-primary w-full mt-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Voir plus
            </button>
          </li>
        )
      })}
    </ul>
  )
}
