import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import type { Campus } from '@/content.config'

interface Props {
  campuses: Campus[]
}

const columns: DataTableColumn<Campus>[] = [
  {
    header: 'Sede',
    searchText: (campus) => [campus.name],
    render: (campus) => (
      <span className="font-medium text-foreground">{campus.name}</span>
    ),
  },
  {
    header: 'Localidad',
    searchText: (campus) => [campus.location, campus.address ?? ''],
    render: (campus) => (
      <span className="text-muted-foreground">{campus.location}</span>
    ),
  },
  {
    header: 'Dirección',
    render: (campus) => (
      <span className="text-muted-foreground">{campus.address}</span>
    ),
  },
]

export default function CampusesTable({ campuses }: Props) {
  return (
    <DataTable
      rows={campuses}
      columns={columns}
      getRowId={(campus) => campus.name}
      noun="sedes"
      searchPlaceholder="Buscar sede o localidad"
    />
  )
}
