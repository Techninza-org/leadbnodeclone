"use client"

import { CrossIcon } from "lucide-react"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { statuses } from "@/lib/table/table-utils"
import { DataTableFacetedFilter } from "@/lib/table/data-table-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  data?: any[]
  setFilter: (value: string) => void
}

export function DataTableToolbar<TData>({
  table,
  data,
  setFilter,
}: DataTableToolbarProps<TData>) {
  // const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search..."
          onChange={(event) =>
            setFilter(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {/* <DataTableFacetedFilter
          table={table}
          data={data}
          // column={table.getColumn("callStatus")}
          title="Filter"
        /> */}
        {/* {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <CrossIcon className="ml-2 h-4 w-4" />
          </Button>
        )} */}
      </div>
      {/* <DataTableViewOptions table={table} /> */}
    </div>
  )
}
