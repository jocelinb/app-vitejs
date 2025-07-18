export interface OpeningHour {
  dayOfWeek: string
  opens: string
  closes: string
}

/** Point relais normalisé */
export interface Relay {
  id: string
  name: string
  place: {
    address: {
      streetAddress: string
      postalCode: string
      addressLocality: string
    },
    geo: {
      latitude: number
      longitude: number
    }
  }
  openingHours?: OpeningHour[]
}

export interface RawRelais {
  id?: number | string
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

/** Article du panier */
export interface CartItem {
  id: string
  name: string
  quantity: number
  unit_price: number
}

/** Statut config pour PaniecoDetails */
export interface StatusConfig {
  label: string
  bg: string
  text: string
}

/** Contexte du widget partagé */
export interface WidgetContextProps {
  relay?: Relay | null
  setRelay: (relay: Relay | null) => void

  cart: CartItem[]
  setCart: (cart: CartItem[]) => void

  externalClientId: string
  setExternalClientId: (id: string) => void

  apiBaseUrl: string
  setApiBaseUrl: (url: string) => void

  merchantUrl: string
  setMerchantUrl: (url: string) => void

  apiKey: string
  setApiKey: (key: string) => void

  groupOrderId: number | null
  setGroupOrderId: (id: number | null) => void
}