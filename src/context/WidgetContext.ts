import { createContext, useContext } from 'react'
import { WidgetContextProps } from '@/types'

export const WidgetContext = createContext<WidgetContextProps | undefined>(undefined)

export const useWidgetContext = () => {
  const ctx = useContext(WidgetContext)
  if (!ctx) throw new Error('useWidgetContext must be used within a WidgetProvider')
  return ctx
}