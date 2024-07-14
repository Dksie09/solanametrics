"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type StakeAccount = {
  id: string;
  amount: number;
  activationEpoch: number;
  deactivationEpoch: number;
  totalRewardsCollected: number;
};

const dummyData: StakeAccount[] = Array.from({ length: 50 }, (_, i) => ({
  id: `ST${i + 1}`,
  amount: Math.random() * 1000,
  activationEpoch: Math.floor(Math.random() * 1000),
  deactivationEpoch: Math.floor(Math.random() * 1000) + 1000,
  totalRewardsCollected: Math.random() * 100,
}));

const stats = [
  {
    key: "acc",
    label: "Number of Stake Accounts",
    decimals: 2,
    className: "shadow-green-500",
    hoverclassName: "hover:shadow-green-500",
  },
  {
    key: "balance",
    label: "Total Stake Balance",
    decimals: 2,
    className: "shadow-pink-500",
    hoverclassName: "hover:shadow-pink-500",
  },
  {
    key: "reward",
    label: "Total Cumulative Rewards",
    decimals: 2,
    className: "shadow-blue-500",
    hoverclassName: "hover:shadow-blue-500",
  },
];

export const columns: ColumnDef<StakeAccount>[] = [
  {
    accessorKey: "id",
    header: "Stake Account",
    cell: ({ row }) => <div>{row.getValue("id") as string}</div>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div>{(row.getValue("amount") as number).toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "activationEpoch",
    header: "Activation Epoch",
    cell: ({ row }) => <div>{row.getValue("activationEpoch") as number}</div>,
  },
  {
    accessorKey: "deactivationEpoch",
    header: "Deactivation Epoch",
    cell: ({ row }) => <div>{row.getValue("deactivationEpoch") as number}</div>,
  },
  {
    accessorKey: "totalRewardsCollected",
    header: "Total Rewards Collected",
    cell: ({ row }) => (
      <div>{(row.getValue("totalRewardsCollected") as number).toFixed(2)}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const stakeAccount = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(stakeAccount.id)}
            >
              Copy account ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function Data({ address }: { address: string }) {
  const [data, setData] = useState<StakeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    setTimeout(() => {
      setData(dummyData);
      setLoading(false);
    }, 2000);
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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (loading) {
    return (
      <div role="status" className="max-w-xl min-w-[500px] animate-pulse">
        <div className="h-2.5 bg-gray-700 w-48 mb-4 rounded-full"></div>
        <div className="h-2 bg-gray-700 max-w-[360px] mb-2.5 rounded-full"></div>
        <div className="h-2 bg-gray-700 mb-2.5 rounded-full"></div>
        <div className="h-2 bg-gray-700 max-w-[330px] rounded-full mb-2.5"></div>
        <div className="h-2 bg-gray-700 max-w-[300px] rounded-full mb-2.5"></div>
        <div className="h-2 bg-gray-700 max-w-[360px] rounded-full"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 xxl:grid-cols-3 gap-4 mb-10">
        {stats.map((item) => (
          <Card
            key={item.key}
            className={`sm:p-4 p-0 border h-32 min-w-72 rounded-xl flex flex-col items-center shadow-md justify-center ${item.className} hover:shadow-2xl ${item.hoverclassName}`}
          >
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-center justify-center text-3xl">
              10000
            </CardTitle>
          </Card>
        ))}
      </div>

      <div className="mb-10 mt-20">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter accounts..."
            value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("id")?.setFilterValue(event.target.value)
            }
            className="max-w-sm border-purple-400 rounded-full p-5"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto border-purple-400 rounded-full"
              >
                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black">
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
        <div className="rounded-2xl border shadow-2xl animated-input-xl p-5 overflow-x-auto bg-black">
          <Table className="w-full bg-black rounded-2xl">
            <TableHeader className="rounded-xl">
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
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-purple-400 rounded-full"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-purple-400 rounded-full"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
