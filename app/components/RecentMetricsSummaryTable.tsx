"use client";

import * as React from "react";
import { CaretSortIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLatestDataFromAppwrite } from "../../lib/database";
import { BlockchainStats } from "../../types/BlockchainStats";

type RecentMetric = {
  timestamp: Date;
  tps: number;
  tpm: number;
  blockProductionRate: number;
  blocktime: number;
};

const columns: ColumnDef<RecentMetric>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const timestamp: Date = row.getValue("timestamp");
      return <div>{timestamp.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "tps",
    header: "TPS",
    cell: ({ row }) => {
      const tps = parseFloat(row.getValue("tps"));
      return <div className="text-right">{tps.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "tpm",
    header: "TPM",
    cell: ({ row }) => {
      const tpm = parseFloat(row.getValue("tpm"));
      return <div className="text-right">{tpm.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "blockProductionRate",
    header: "Block Production Rate",
    cell: ({ row }) => {
      const rate = parseFloat(row.getValue("blockProductionRate"));
      return <div className="text-right">{rate.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "blocktime",
    header: "Blocktime",
    cell: ({ row }) => {
      const blocktime = parseFloat(row.getValue("blocktime"));
      return <div className="text-right">{blocktime.toFixed(4)}</div>;
    },
  },
];

export function RecentMetricsSummary() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [data, setData] = React.useState<RecentMetric[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const recentData: BlockchainStats[] = [];
      for (let i = 0; i < 10; i++) {
        const latestData = await getLatestDataFromAppwrite();
        if (latestData) {
          recentData.push(latestData);
        }
      }

      const formattedData: RecentMetric[] = recentData.map((d) => ({
        timestamp: d.timestamp,
        tps: d.tps,
        tpm: d.tpm,
        blockProductionRate: d.blockProductionRate,
        blocktime: d.blocktime,
      }));

      setData(formattedData);
    };

    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter timestamps..."
          value={
            (table.getColumn("timestamp")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("timestamp")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table className="">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-[250px] " />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing the last {table.getFilteredRowModel().rows.length} data
          points.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
