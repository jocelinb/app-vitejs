// src/types/maplibre-gl-geocoder.d.ts
declare module '@maplibre/maplibre-gl-geocoder' {
  import type { Map, FlyToOptions, Marker, IControl } from 'maplibre-gl'

  export interface MaplibreGeocoderOptions {
    placeholder?: string
    language?: string
    countries?: string
    flyTo?: boolean | FlyToOptions
    marker?: boolean | Marker
    limit?: number
    filter?: (feature: unknown) => boolean
    localGeocoder?: (query: string) => unknown[]
    externalGeocoder?: (
      query: string,
      features: unknown[],
      config: unknown
    ) => Promise<unknown[]>
    maplibregl?: typeof import('maplibre-gl')
    [key: string]: unknown
  }

  export default class MaplibreGeocoder implements IControl {
    constructor(
      options: MaplibreGeocoderOptions,
      maplibregl: typeof import('maplibre-gl')
    )
    onAdd(map: Map): HTMLElement
    onRemove(map: Map): void
    addTo(map: Map | string | HTMLElement): this
    on(type: string, listener: (event: unknown) => void): this
    off(type: string, listener: (event: unknown) => void): this
    clear(): this
    query(input: string): this
  }
}
