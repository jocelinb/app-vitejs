import { Relay, RawRelais } from '@/types'

export function normalizeRelaisData(rawData: RawRelais[]): Relay[] {
  return rawData.map((item) => {
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
          addressLocality: item.city || ''
        }

    const openingHours = isFromAPI
      ? item.openingHours || []
      : item.raw_opening_hours || []

    return {
      id: (item.id ?? 'unknown-id').toString(), // Toujours string côté front
      name: item.name || 'Point relais sans nom',
      place: {
        geo: { latitude, longitude },
        address
      },
      openingHours
    }
  })
}
