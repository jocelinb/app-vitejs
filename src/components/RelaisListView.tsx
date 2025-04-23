import MarkerIcon from '../icons/MarkerIcon'
import ShoppingCart from '../icons/ShoppingCart'

export interface Relay {
  name: string
  place: {
    address: {
      streetAddress: string
      postalCode: string
      addressLocality: string
    }
  }
}

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
  return (
    <ul className="divide-y divide-gray-200">
  {data.map((loc, i) => (
    <li
      key={i}
      className="
           flex flex-col px-4 py-3 space-y-2
           hover:bg-gray-50 hover:shadow-md
           border-l-4 border-l-transparent hover:border-l-blue-500
           transition-colors duration-200
      "
    >
      <h3 className="text-lg font-bold mb-2 text-gray-800">{loc.name}</h3>
      <p className="flex items-center text-sm text-gray-600 mb-1">
        <MarkerIcon className="w-4 h-4 mr-2 text-blue-500" />
        {loc.place.address.streetAddress} — {loc.place.address.postalCode}{' '}
        {loc.place.address.addressLocality}
      </p>
      <p className="flex items-center text-sm text-gray-600 mb-3">
        <ShoppingCart className="w-4 h-4 mr-2 text-green-600" />
        0 Panieco dans ce point relais
      </p>
      <button
           onClick={() => {
             setSelectedRelais(loc)
             setViewMode('details')
           }}
           className="
             mt-2 w-full text-center
             py-2 font-medium
             bg-blue-600 text-white rounded
             hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300
             transition cursor-pointer
           "
      >
           Voir plus
      </button>
    </li>
  ))}
</ul>
  )
}
