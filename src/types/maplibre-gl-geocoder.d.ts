declare module '@mapbox/mapbox-gl-geocoder' {
  // On importe explicitement maplibre-gl pour l’utiliser dans la déclaration
  import type { Map as MapLibreMap } from 'maplibre-gl';

  /**
   * Options passées au constructeur du geocoder.
   * `accessToken` reste optionnel car il n’est utilisé que pour l’API Mapbox,
   * mais la propriété `mapboxgl` est typée pour accepter MapLibre.
   */
  interface GeocoderOptions {
    accessToken?: string;
    marker?: boolean;
    placeholder?: string;
    countries?: string;
    mapboxgl?: typeof import('maplibre-gl');
  }

  /**
   * Évènement renvoyé par le geocoder lorsqu’une recherche aboutit.
   * Vous pouvez enrichir ce type si vous avez besoin de champs supplémentaires.
   */
  interface GeocoderResultEvent {
    result: {
      center: [number, number];
      place_name: string;
      // autres propriétés possibles selon l’API Mapbox (address, context…)
    };
  }

  class MapboxGeocoder {
    constructor(options?: GeocoderOptions);

    /**
     * Abonne un gestionnaire d’évènement. Pour éviter les types implicites,
     * on déclare une surcharge pour l’évènement "result" et une signature générique
     * pour les autres évènements.
     */
    on(event: 'result', handler: (data: GeocoderResultEvent) => void): this;
    on(event: string, handler: (data: unknown) => void): this;

    off(event: 'result', handler: (data: GeocoderResultEvent) => void): this;
    off(event: string, handler: (data: unknown) => void): this;

    // La méthode onAdd reçoit désormais une MapLibreMap
    onAdd(map: MapLibreMap): HTMLElement;
    onRemove(): void;
  }

  export default MapboxGeocoder;
}
