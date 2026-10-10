import React from 'react'
import {
  useTable,
  tableFeatures,
  rowSortingFeature,
  createSortedRowModel,
  type SortingState,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table'
import { tv } from 'tailwind-variants'
import { cn } from '../../lib/ui'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})

const tableStyles = tv({
  slots: {
    base: 'w-full caption-bottom text-sm',
    body: '[&_tr:last-child]:border-0',
    cell: 'p-4 align-middle [&:has([role=checkbox])]:pr-0 text-brand-text',
    head: 'h-12 px-4 text-left align-middle font-medium text-ui-text-muted [&:has([role=checkbox])]:pr-0',
    header: '[&_tr]:border-b',
    row: 'border-b border-ui-border transition-colors hover:bg-ui-surface-hover/50 data-[state=selected]:bg-ui-surface-hover',
    wrapper: 'rounded-md border border-ui-border overflow-hidden',
  },
})

export interface DataTableProps<TData extends RowData> {
  readonly columns: readonly ColumnDef<typeof dataTableFeatures, TData, unknown>[]
  readonly data: readonly TData[]
}

export function DataTable<TData extends RowData>({ columns, data }: Readonly<DataTableProps<TData>>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useTable({
    columns,
    data,
    features: dataTableFeatures,
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  const { base, header, body, row, head, cell, wrapper } = tableStyles()

  return (
    <div className={wrapper()}>
      <div className="w-full overflow-auto">
        <table className={base()}>
          <thead className={header()}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className={row()}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} className={head()}>
                      {header.isPlaceholder
                        ? null
                        : (
                            <div
                              className={cn(
                                header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-1' : '',
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <table.FlexRender header={header} />
                              {{
                                asc: <ChevronUp className="h-4 w-4" />,
                                desc: <ChevronDown className="h-4 w-4" />,
                              }[header.column.getIsSorted() as string]
                              ?? (header.column.getCanSort() ? <ChevronsUpDown className="h-4 w-4 text-gray-400" /> : null)}
                            </div>
                          )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className={body()}>
            {table.getRowModel().rows?.length
              ? (
                  table.getRowModel().rows.map(rowEl => (
                    <tr key={rowEl.id} className={row()}>
                      {rowEl.getAllCells().map(cellEl => (
                        <td key={cellEl.id} className={cell()}>
                          <table.FlexRender cell={cellEl} />
                        </td>
                      ))}
                    </tr>
                  ))
                )
              : (
                  <tr className={row()}>
                    <td colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </td>
                  </tr>
                )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
