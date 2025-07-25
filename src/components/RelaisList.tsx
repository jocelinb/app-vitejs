import { Relay } from '@/types'
import RelaisDetails from './RelaisDetails'
import RelaisListView from './RelaisListView'

interface Props {
  data: Relay[]
  viewMode: 'list' | 'details'
  selectedRelais: Relay | null
  setViewMode(mode: 'list' | 'details'): void
  setSelectedRelais(rel: Relay | null): void
}

export default function RelaisList({
  data,
  viewMode,
  selectedRelais,
  setViewMode,
  setSelectedRelais,
}: Props) {
  return (
    <div className="h-full p-2 sm:p-4">
      {viewMode === 'details' && selectedRelais ? (
        <RelaisDetails
          selectedRelais={selectedRelais}
          setViewMode={setViewMode}
        />
      ) : (
        <RelaisListView
          data={data}
          setSelectedRelais={setSelectedRelais}
          setViewMode={setViewMode}
        />
      )}
    </div>
  )
}
