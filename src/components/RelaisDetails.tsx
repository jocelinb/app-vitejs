import { useState } from 'react'
import ArrowLeft from '../icons/ArrowLeft'
import ChevronDown from '../icons/ChevronDown'
import Clock from '../icons/Clock'
import MarkerIcon from '../icons/MarkerIcon'
import QuitIcon from '../icons/QuitIcon'
import ShoppingCart from '../icons/ShoppingCart'
import {
  days,
  hasAfternoonHours,
  formatAfternoonHoursForDisplay,
  formatMorningHoursForDisplay,
  groupHoursByDay,
  dayOfWeekToFrench
} from '../utils/timeHelpers'

export interface RelayDetailsData {
  name: string
  place: {
    address: {
      streetAddress: string
      addressLocality: string
      postalCode: string
    }
  }
  openingHours: Array<{
    dayOfWeek: string
    opens: string
    closes: string
  }>
}

interface Props {
  selectedRelais: RelayDetailsData
  setViewMode(mode: 'list' | 'details'): void
}

export default function RelaisDetails({
  selectedRelais,
  setViewMode
}: Props) {
  const [showOpeningHours, setShowOpeningHours] = useState(false)
  const [createPanieco, setCreatePanieco] = useState(false)

  const groupedOpeningHours = groupHoursByDay(selectedRelais.openingHours)
  const orderedDays = Object.keys(days).map(dayOfWeekToFrench)
  const displayAfternoonColumn = hasAfternoonHours(groupedOpeningHours)
  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-5 text-gray-800">
      <div
        className="flex items-center justify-between text-sm text-gray-600 cursor-pointer"
        onClick={() => setViewMode('list')}
      >
        <div className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Retour aux points relais</span>
        </div>
        <QuitIcon className="w-4 h-4" />
      </div>

      <h3 className="text-xl font-bold">{selectedRelais.name}</h3>

      <div className="flex items-start space-x-3">
        <MarkerIcon className="w-5 h-5 mt-1 text-blue-500" />
        <div className="space-y-0.5 text-sm">
          <p>{selectedRelais.place.address.streetAddress}</p>
          <p>{selectedRelais.place.address.addressLocality}</p>
          <p>{selectedRelais.place.address.postalCode}</p>
        </div>
      </div>
      <div>
        <h4
          className="flex items-center text-sm font-medium text-gray-700 cursor-pointer"
          onClick={() => setShowOpeningHours(!showOpeningHours)}
        >
          <Clock className="w-5 h-5 mr-2 text-yellow-500" />
          Horaires d'ouverture
          <ChevronDown
            className={`w-4 h-4 ml-2 transform transition-transform ${
              showOpeningHours ? 'rotate-180' : ''
            }`}
          />
        </h4>

        {showOpeningHours && (
          <table className="w-full text-left mt-3 text-sm border-collapse">
            <thead>
              <tr>
                <th className="pb-2">Jour</th>
                <th className="pb-2">Matin</th>
                {displayAfternoonColumn && <th className="pb-2">Après-midi</th>}
              </tr>
            </thead>
            <tbody>
              {orderedDays.map(day => {
                const times = groupedOpeningHours[day] || {}
                return (
                  <tr key={day} className="border-t">
                    <td className="py-1">{day}</td>
                    <td className="py-1">
                      {formatMorningHoursForDisplay(times)}
                    </td>
                    {displayAfternoonColumn && (
                      <td className="py-1">
                        {formatAfternoonHoursForDisplay(times)}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-700">
        <ShoppingCart className="w-5 h-5 mr-2 text-green-500" />
        0 Panieco dans ce point relais
      </div>

      <button
        onClick={() => setCreatePanieco(!createPanieco)}
        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Créer un Panieco
      </button>

      {createPanieco && (
        <div className="p-4 mt-3 bg-gray-50 border border-gray-200 rounded">
          yo
        </div>
      )}
    </div>
  )
}
