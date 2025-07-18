import { useState, ReactNode } from 'react'
import { WidgetContext } from './WidgetContext'
import { WidgetContextProps, CartItem, Relay } from '@/types'

interface WidgetProviderProps {
  children: ReactNode
  initialConfig: {
    apiKey: string
    externalClientId: string
    cart: CartItem[]
    apiBaseUrl: string
    merchantUrl: string
  }
}

export const WidgetProvider = ({ children, initialConfig }: WidgetProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>(initialConfig.cart)
  const [groupOrderId, setGroupOrderId] = useState<number | null>(null)
  const [relay, setRelay] = useState<Relay | null>(null)
  const [merchantUrl, setMerchantUrl] = useState<string>(initialConfig.merchantUrl)

  // Optionnel : tu peux prévoir un `setApiKey` et `setExternalClientId` si tu veux qu’ils soient modifiables dynamiquement.
  // Sinon tu peux les garder figés, TypeScript n’en sera que plus strict.

  const contextValue: WidgetContextProps = {
    apiKey: initialConfig.apiKey,
    externalClientId: initialConfig.externalClientId,
    cart,
    setCart,
    apiBaseUrl: initialConfig.apiBaseUrl,
    groupOrderId,
    setGroupOrderId,
    relay,
    setRelay,
    merchantUrl,
    setMerchantUrl,
    // Si tu veux exposer setApiKey ou setExternalClientId => à implémenter ici
    setApiKey: () => {
      throw new Error('setApiKey not implemented')
    },
    setExternalClientId: () => {
      throw new Error('setExternalClientId not implemented')
    },
    setApiBaseUrl: () => {
      throw new Error('setApiBaseUrl not implemented')
    },
  }

  return (
    <WidgetContext.Provider value={contextValue}>
      {children}
    </WidgetContext.Provider>
  )
}
