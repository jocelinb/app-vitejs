import { useEffect } from 'react';
import MapComponent from './MapComponent'

export default function MapWidget() {
    useEffect(() => {
    const container = document.getElementById('panieco-container');
    if (container) {
      const computed = window.getComputedStyle(container);
      const height = parseFloat(computed.height);

      if (!height || height < 100) {
        container.style.minHeight = '400px';
        console.warn('[Panieco] Aucune hauteur détectée sur #panieco-container. min-height: 400px appliqué.');
      }
    }
  }, []);
  return (
    <div className="w-full h-[400px] relative rounded-lg shadow">
      <div className="relative w-full h-full">
        <MapComponent />
      </div>
    </div>
  )
}
