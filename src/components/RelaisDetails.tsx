import { useEffect, useState, useCallback, useRef } from 'react'
import axios from 'axios'
import clsx from 'clsx'
import ArrowLeft from '@/icons/ArrowLeft'
import ChevronDown from '@/icons/ChevronDown'
import Clock from '@/icons/Clock'
import MarkerIcon from '@/icons/MarkerIcon'
import QuitIcon from '@/icons/QuitIcon'
import ShoppingCart from '@/icons/ShoppingCart'
import PaniecoDetails from './PaniecoDetails'
import { useWidgetContext } from '@/context/WidgetContext'
import { Relay } from '@/types'
import {
  days,
  hasAfternoonHours,
  formatAfternoonHoursForDisplay,
  formatMorningHoursForDisplay,
  groupHoursByDay,
  dayOfWeekToFrench
} from '@/utils/timeHelpers'
import { getStatusConfig } from '@/utils/statusHelper'

interface Panieco {
  id: number
  public_id: string
  total_amount: number | string
  free_shipping_min: number | string
  status: string
}

interface Props {
  selectedRelais: Relay
  setViewMode(mode: 'list' | 'details'): void
}

export default function RelaisDetails({ selectedRelais, setViewMode }: Props) {
  const [showOpeningHours, setShowOpeningHours] = useState(false)
  const [paniecosInRelais, setPaniecosInRelais] = useState<Panieco[]>([])
  const { apiBaseUrl, apiKey, externalClientId, cart } = useWidgetContext()
  const [expandedPaniecoId, setExpandedPaniecoId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createMessage, setCreateMessage] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const groupedOpeningHours = groupHoursByDay(selectedRelais.openingHours || [])
  const orderedDays = Object.keys(days).map(dayOfWeekToFrench)
  const displayAfternoonColumn = hasAfternoonHours(groupedOpeningHours)

  const fetchPaniecos = useCallback(async () => {
    try {
      const res = await axios.get(
        `${apiBaseUrl}/api/v1/group-orders/pickup-point/${selectedRelais.id}`,
        { headers: { 'x-api-key': apiKey } }
      )
      setPaniecosInRelais(res.data.groupOrders || [])
    } catch (err) {
      console.error('Erreur chargement des Paniecos du point relais', err)
    }
  }, [selectedRelais.id, apiBaseUrl, apiKey])

  useEffect(() => {
    fetchPaniecos()
  }, [fetchPaniecos])

  useEffect(() => {
    const shadowHost = document.getElementById('panieco-container');
    const root: Document | ShadowRoot = shadowHost?.shadowRoot || document;

    const onClickOutside = (e: MouseEvent) => {
      if (expandedPaniecoId === null) return;
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setExpandedPaniecoId(null);
      }
    };

    root.addEventListener('click', onClickOutside as EventListener);
    return () => root.removeEventListener('click', onClickOutside as EventListener);
  }, [expandedPaniecoId]);


  const handleCreatePanieco = async () => {
    setCreating(true)
    setCreateError(null)
    setCreateMessage(null)

    const amount = cart.reduce((sum, it) => sum + it.quantity * it.unit_price, 0)
    try {
      const res = await axios.post(
        `${apiBaseUrl}/api/v1/group-orders/init`,
        {
          pickup_point_id: selectedRelais.id,
          external_client_id: externalClientId,
          amount,
          items: cart
        },
        { headers: { 'x-api-key': apiKey } }
      )
      setCreateMessage(`Panieco n° ${res.data.groupOrder.public_id} créé avec succès !`)
      fetchPaniecos()
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Erreur lors de la création du Panieco.'
        : 'Erreur inconnue.'
      setCreateError(msg)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-4 text-gray-800"
    >
      {/* Retour */}
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

      <div className="flex justify-between items-center">
        <h3 className="text-lg sm:text-xl font-bold">{selectedRelais.name}</h3>
        {typeof selectedRelais.distanceKm === 'number' && (
          <span className="text-sm text-gray-700 bg-white/80 rounded px-2 py-0.5 shadow-sm ml-4 whitespace-nowrap">
            {selectedRelais.distanceKm.toFixed(1)} km
          </span>
        )}
      </div>

      {/* Adresse */}
      <div className="flex items-start space-x-3">
        <MarkerIcon className="w-5 h-5 mt-1 text-blue-500" />
        <div className="space-y-0.5 text-sm">
          <p>{selectedRelais.place.address.streetAddress}</p>
          <p>{selectedRelais.place.address.addressLocality}</p>
          <p>{selectedRelais.place.address.postalCode}</p>
        </div>
      </div>

      {/* Horaires */}
      <div>
        <h4
          className="flex items-center text-sm font-medium text-gray-700 cursor-pointer"
          onClick={() => setShowOpeningHours(!showOpeningHours)}
        >
          <Clock className="w-5 h-5 mr-2 text-yellow-500" />
          Horaires d'ouverture
          <ChevronDown
            className={`w-4 h-4 ml-2 transform transition-transform ${showOpeningHours ? 'rotate-180' : ''}`}
          />
        </h4>
        {showOpeningHours && (
          <div className="overflow-x-auto">
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
                      <td className="py-1">{formatMorningHoursForDisplay(times)}</td>
                      {displayAfternoonColumn && (
                        <td className="py-1">{formatAfternoonHoursForDisplay(times)}</td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Liste des Paniecos */}
      <div className="text-sm text-gray-700">
        <div className="flex items-center mb-1">
          <ShoppingCart className="w-5 h-5 mr-2 text-green-500" />
          {paniecosInRelais.length === 0
            ? 'Aucun Panieco dans ce point relais'
            : `${paniecosInRelais.length} Panieco(s) dans ce point relais`}
        </div>

        {paniecosInRelais.length > 0 && (
          <ul ref={listRef} className="space-y-2 text-gray-600">
            {paniecosInRelais.map(p => {
              const total = typeof p.total_amount === 'string' ? parseFloat(p.total_amount) : p.total_amount
              const threshold = typeof p.free_shipping_min === 'string' ? parseFloat(p.free_shipping_min) : p.free_shipping_min
              const cfg = getStatusConfig(p.status, total, threshold)
              const isOpen = expandedPaniecoId === p.public_id

              return (
                <li key={p.id} className="space-y-2">
                  <div
                    onClick={() => setExpandedPaniecoId(isOpen ? null : p.public_id)}
                    className={clsx(
                      'flex items-center justify-between p-2 rounded cursor-pointer',
                      isOpen ? 'bg-gray-100 shadow-sm' : 'hover:bg-gray-50'
                    )}
                  >
                    <div>
                      <span className="font-medium">Panieco {p.public_id}</span> – {total} €
                      <span className={clsx('ml-2 inline-block px-2 py-0.5 text-xs font-semibold rounded', cfg.bg, cfg.text)}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="ml-4 mt-2 border-l-2 border-gray-200 pl-4">
                      <PaniecoDetails
                        publicId={p.public_id}
                        cart={cart}
                        freeShippingMin={threshold}
                        onUpdate={fetchPaniecos}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <button
          onClick={handleCreatePanieco}
          disabled={creating}
          className="btn-primary w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {creating ? 'Création en cours…' : 'Créer un Panieco'}
        </button>

        {(createMessage || createError) && (
          <div className="p-4 mt-2 bg-gray-50 border border-gray-200 rounded text-sm">
            {createMessage && <p className="text-green-700">{createMessage}</p>}
            {createError && <p className="text-red-600">{createError}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
