export interface RawRelais {
    name?: string
    latitude?: string
    longitude?: string
    street_address?: string
    postal_code?: string
    city?: string
    place?: {
      geo?: { latitude: number; longitude: number }
      address?: {
        streetAddress: string
        postalCode: string
        addressLocality: string
      }
    }
    openingHours?: Array<{ dayOfWeek: string; opens: string; closes: string }>
    raw_opening_hours?: Array<{ dayOfWeek: string; opens: string; closes: string }>
  }
  
  export interface NormalizedRelais {
    name: string
    place: {
      geo: { latitude: number; longitude: number }
      address: {
        streetAddress: string
        postalCode: string
        addressLocality: string
      }
    }
    openingHours: Array<{ dayOfWeek: string; opens: string; closes: string }>
  }
  
  export function normalizeRelaisData(rawData: RawRelais[]): NormalizedRelais[] {
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
        name: item.name || 'Point relais sans nom',
        place: {
          geo: { latitude, longitude },
          address
        },
        openingHours
      }
    })
  }
  