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
  setViewMode
}: Props) {
  const { apiBaseUrl, apiKey } = useWidgetContext()
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchCounts = async () => {
      if (!data.length) return

      try {
        const pickupIds = data.map(r => r.id).join(',')
        const res = await axios.get(
          `${apiBaseUrl}/api/v1/group-orders/count-pickup`,
          {
            params: { pickup_point_ids: pickupIds },
            headers: { 'x-api-key': apiKey }
          }
        )
        // on suppose que l'API renvoie { counts: { [id]: number } }
        setCounts(res.data.counts || {})
      } catch (err) {
        console.error('Erreur lors de la récupération des Panieco par point relais', err)
      }
    }

    fetchCounts()
  }, [data, apiBaseUrl, apiKey])

  return (
    <ul className="divide-y divide-gray-200">
      {data.map(loc => (
        <li key={loc.id} className="flex flex-col px-4 py-3 space-y-2 hover:bg-gray-50 hover:shadow-md border-l-4 border-l-transparent hover:border-l-blue-500 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-2 text-gray-800">{loc.name}</h3>
          <p className="flex items-center text-sm text-gray-600 mb-1">
            <MarkerIcon className="w-4 h-4 mr-2 text-blue-500" />
            {loc.place.address.streetAddress} — {loc.place.address.postalCode} {loc.place.address.addressLocality}
          </p>
          <p className="flex items-center text-sm text-gray-600 mb-3">
            <ShoppingCart className="w-4 h-4 mr-2 text-green-600" />
            {counts[loc.id] || 0} Panieco{(counts[loc.id] || 0) > 1 ? 's' : ''} dans ce point relais
          </p>
          <button
            onClick={() => {
              setSelectedRelais(loc)
              setViewMode('details')
            }}
            className="btn-primary mt-2 w-full text-center py-2 font-medium bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition cursor-pointer"
          >
            Voir plus
          </button>
        </li>
      ))}
    </ul>
  )
}
