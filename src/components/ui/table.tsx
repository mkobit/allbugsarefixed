import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table'
import { tv } from 'tailwind-variants'
import { cn } from '../../lib/ui'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

const tableStyles = tv({
  slots: {
    base: 'w-full caption-bottom text-sm',
    body: '[&_tr:last-child]:border-0',
    cell: 'p-4 align-middle [&:has([role=checkbox])]:pr-0 text-gray-900 dark:text-gray-100',
    head: 'h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400 [&:has([role=checkbox])]:pr-0',
    header: '[&_tr]:border-b',
    row: 'border-b border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50 data-[state=selected]:bg-gray-100 dark:data-[state=selected]:bg-gray-800',
    wrapper: 'rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden',
  },
})

export interface DataTableProps<TData, TValue> {
  readonly columns: readonly ColumnDef<TData, TValue>[]
  readonly data: readonly TData[]
}

export function DataTable<TData, TValue>({ columns, data }: Readonly<DataTableProps<TData, TValue>>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    columns: columns as ColumnDef<TData, TValue>[],
    data: data as TData[],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
                              {flexRender(header.column.columnDef.header, header.getContext())}
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
                    <tr key={rowEl.id} data-state={rowEl.getIsSelected() && 'selected'} className={row()}>
                      {rowEl.getVisibleCells().map(cellEl => (
                        <td key={cellEl.id} className={cell()}>
                          {flexRender(cellEl.column.columnDef.cell, cellEl.getContext())}
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
