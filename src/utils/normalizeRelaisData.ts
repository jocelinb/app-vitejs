import { Relay, RawRelais } from '@/types'
import { getDistanceKm } from './distance'

/**
 * Fonction de base : normalise les données brutes d'un point relais
 */
export function normalizeRelaisData(rawData: RawRelais[]): Relay[] {
  return rawData.map((item) => normalizeSingleRelais(item))
}

/**
 * Nouvelle fonction : normalise + calcule la distance à une position donnée
 */
export function normalizeRelaisDataWithDistance(
  rawData: RawRelais[],
  userLat: number,
  userLng: number
): Relay[] {
  return rawData.map((item) => {
    const base = normalizeSingleRelais(item)
    const lat = base.place.geo.latitude
    const lng = base.place.geo.longitude

    const distanceKm = getDistanceKm(userLat, userLng, lat, lng)

    return {
      ...base,
      distanceKm,
    }
  })
}

/**
 * Fonction interne partagée : normalisation d’un seul point relais
 */
function normalizeSingleRelais(item: RawRelais): Relay {
  const isFromAPI = !!item.place?.address && !!item.place?.geo

  const latitude = isFromAPI
    ? item.place!.geo!.latitude
    : parseFloat(item.latitude ?? '0')

  const longitude = isFromAPI
    ? item.place!.geo!.longitude
    : parseFloat(item.longitude ?? '0')

  const address = isFromAPI
    ? item.place!.address!
    : {
        streetAddress: item.street_address || '',
        postalCode: item.postal_code || '',
        addressLocality: item.city || '',
      }

  const openingHours = isFromAPI
    ? item.openingHours || []
    : item.raw_opening_hours || []

  return {
    id: (item.id ?? 'unknown-id').toString(), // Toujours string côté front
    name: item.name || 'Point relais sans nom',
    place: {
      geo: { latitude, longitude },
      address,
    },
    openingHours,
  }
}
