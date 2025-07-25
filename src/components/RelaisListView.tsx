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
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchCounts = async () => {
      if (!data.length) return

      try {
        const pickupIds = data.map((r) => r.id).join(',')
        const res = await axios.get(
          `${apiBaseUrl}/api/v1/group-orders/count-pickup`,
          {
            params: { pickup_point_ids: pickupIds },
            headers: { 'x-api-key': apiKey },
          }
        )
        setCounts(res.data.counts || {})
      } catch (err) {
        console.error('Erreur lors de la récupération des Panieco par point relais', err)
      }
    }

    fetchCounts()
  }, [data, apiBaseUrl, apiKey])

  const sortedRelays = [...data].sort((a, b) => {
    const aHasPanieco = (counts[a.id] || 0) > 0
    const bHasPanieco = (counts[b.id] || 0) > 0

    if (aHasPanieco && !bHasPanieco) return -1
    if (!aHasPanieco && bHasPanieco) return 1

    // S'ils sont équivalents niveau Panieco, on trie par distance
    return (a.distanceKm || 0) - (b.distanceKm || 0)
  })


  return (
    <ul className="divide-y divide-gray-200">
      {sortedRelays.map((loc) => (
        <li
          key={loc.id}
          className={`relative p-4 space-y-2 hover:bg-gray-50 hover:shadow-sm border-l-4 transition-all duration-200
            ${counts[loc.id] > 0 ? 'bg-yellow-50 border-yellow-400' : 'border-transparent'}
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

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShoppingCart className="w-4 h-4 text-green-600" />
            <span>
              {counts[loc.id] || 0} Panieco
              {(counts[loc.id] || 0) > 1 ? 's' : ''} dans ce point relais
            </span>
          </div>

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
      ))}
    </ul>
  )
}
