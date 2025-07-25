import MapComponent from './MapComponent'

export default function MapWidget() {
  return (
    <div className="w-full h-full rounded-lg shadow">
      <div className="relative w-full h-full">
        <MapComponent />
      </div>
    </div>
  )
}
