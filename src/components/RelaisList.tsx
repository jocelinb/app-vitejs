import RelaisDetails from './RelaisDetails'
import RelaisListView from './RelaisListView'

interface Props {
  data: any[]
  viewMode: 'list'|'details'
  selectedRelais: any
  setViewMode(mode: 'list'|'details'): void
  setSelectedRelais(rel: any): void
}

export default function RelaisList({
  data, viewMode, selectedRelais,
  setViewMode, setSelectedRelais
}: Props) {
  return viewMode === 'details' && selectedRelais
    ? <RelaisDetails selectedRelais={selectedRelais} setViewMode={setViewMode}/>
    : <RelaisListView
        data={data}
        setSelectedRelais={setSelectedRelais}
        setViewMode={setViewMode}
      />
}
