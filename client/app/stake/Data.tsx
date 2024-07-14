// Data.tsx

"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronDownIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
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
  pubkey: string;
  delegatedStake: number;
  activationEpoch: number;
  deactivationEpoch: string | number;
  totalRewards: number;
};

type StakeAnalysisResult = {
  totalAccountsFound: number;
  totalAmountStaked: number;
  totalRewardsEarned: number;
  stakeAccounts: StakeAccount[];
};

export const columns: ColumnDef<StakeAccount>[] = [
  {
    accessorKey: "pubkey",
    header: "Stake Account",
    cell: ({ row }) => <div>{row.getValue("pubkey") as string}</div>,
  },
  {
    accessorKey: "delegatedStake",
    header: "Amount",
    cell: ({ row }) => (
      <div>{(row.getValue("delegatedStake") as number).toFixed(2)} SOL</div>
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
    cell: ({ row }) => (
      <div>{row.getValue("deactivationEpoch") as string | number}</div>
    ),
  },
  {
    accessorKey: "totalRewards",
    header: "Total Rewards Collected",
    cell: ({ row }) => (
      <div>{(row.getValue("totalRewards") as number).toFixed(2)} SOL</div>
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(stakeAccount.pubkey)}
            >
              Copy account ID
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(
                  stakeAccount.totalRewards.toString()
                )
              }
            >
              Copy reward
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function Data({ address }: { address: string }) {
  const [data, setData] = useState<StakeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalAccountsFound: number;
    totalAmountStaked: number;
    totalRewardsEarned: number;
  }>({
    totalAccountsFound: 0,
    totalAmountStaked: 0,
    totalRewardsEarned: 0,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/stake-analysis?walletAddress=${address}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result: StakeAnalysisResult = await response.json();
        setData(result.stakeAccounts);
        setStats({
          totalAccountsFound: result.totalAccountsFound,
          totalAmountStaked: result.totalAmountStaked,
          totalRewardsEarned: result.totalRewardsEarned,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

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

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3  lg:grid-cols-3 xl:grid-cols-3 xxl:grid-cols-3 gap-4 mb-10 lg:mx-56">
        <Card className="shadow-green-500 hover:shadow-2xl h-32 shadow-lg hover:shadow-green-500 rounded-xl p-5">
          <CardDescription>Number of Stake Accounts</CardDescription>
          <CardTitle className="text-center justify-center text-3xl mt-5">
            {stats.totalAccountsFound}
          </CardTitle>
        </Card>
        <Card className="shadow-pink-500 hover:shadow-2xl shadow-lg hover:shadow-pink-500 rounded-xl p-5">
          <CardDescription>Total Stake Balance</CardDescription>
          <CardTitle className="text-center justify-center text-3xl mt-5">
            {stats.totalAmountStaked.toFixed(2)} SOL
          </CardTitle>
        </Card>
        <Card className="shadow-blue-500 hover:shadow-2xl shadow-lg hover:shadow-blue-500 rounded-xl p-5">
          <CardDescription>Total Cumulative Rewards</CardDescription>
          <CardTitle className="text-center justify-center text-3xl mt-5">
            {stats.totalRewardsEarned.toFixed(2)} SOL
          </CardTitle>
        </Card>
      </div>

      <div className="mb-10 mt-20">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter accounts..."
            value={
              (table.getColumn("pubkey")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("pubkey")?.setFilterValue(event.target.value)
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
