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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRecentDataFromAppwrite } from "../../lib/database";
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
      return <div className="font-medium">{timestamp.toLocaleString()}</div>;
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
  const [isLoading, setIsLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState("24h");

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const recentData = await getRecentDataFromAppwrite(1000);
        const endTime = new Date();
        let startTime: Date;

        switch (timeRange) {
          case "1h":
            startTime = new Date(endTime.getTime() - 60 * 60 * 1000);
            break;
          case "24h":
          default:
            startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
            break;
        }

        const filteredData = recentData.filter(
          (d) => d.timestamp >= startTime && d.timestamp <= endTime
        );

        let lastNonZeroTPS = 0;
        let lastNonZeroTPM = 0;
        let lastNonZeroBPR = 0;
        let lastNonZeroBlocktime = 0;

        const formattedData: RecentMetric[] = filteredData.map((curr) => {
          // Update last non-zero values
          if (curr.tps !== 0) lastNonZeroTPS = curr.tps;
          if (curr.tpm !== 0) lastNonZeroTPM = curr.tpm;
          if (curr.blockProductionRate !== 0)
            lastNonZeroBPR = curr.blockProductionRate;
          if (curr.blocktime !== 0) lastNonZeroBlocktime = curr.blocktime;

          return {
            timestamp: curr.timestamp,
            tps: curr.tps === 0 ? lastNonZeroTPS : curr.tps,
            tpm: curr.tpm === 0 ? lastNonZeroTPM : curr.tpm,
            blockProductionRate:
              curr.blockProductionRate === 0
                ? lastNonZeroBPR
                : curr.blockProductionRate,
            blocktime:
              curr.blocktime === 0 ? lastNonZeroBlocktime : curr.blocktime,
          };
        });

        // Handle case where all values are zero
        if (lastNonZeroTPS === 0)
          console.warn("All TPS values are zero in the selected time range");
        if (lastNonZeroTPM === 0)
          console.warn("All TPM values are zero in the selected time range");
        if (lastNonZeroBPR === 0)
          console.warn(
            "All Block Production Rate values are zero in the selected time range"
          );
        if (lastNonZeroBlocktime === 0)
          console.warn(
            "All Blocktime values are zero in the selected time range"
          );

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3 * 60 * 1000); // Update every 3 minutes
    return () => clearInterval(interval);
  }, [timeRange]);

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
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center py-4">
        <Input
          placeholder="Filter timestamps..."
          value={
            (table.getColumn("timestamp")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("timestamp")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mb-4 sm:mb-0 mr-4"
        />
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="1h">Last 1 hour</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-2 first:pl-5 last:pr-5"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                  <br />
                  <p className="opacity-50 mt-2">
                    Fetching data can take a few seconds.
                  </p>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-2 first:pl-5 last:pr-5"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
          Showing {table.getFilteredRowModel().rows.length} results for the
          selected time range.
        </div>
        <div className="flex space-x-2">
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
