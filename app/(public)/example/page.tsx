"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface ExampleItem {
  id: number;
  name: string;
  value: number;
}

interface ExampleApiResponse {
  message: string;
  timestamp: string;
  data: {
    items: ExampleItem[];
  };
}

const columns: ColumnDef<ExampleItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableSorting: true,
  },
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
  },
  {
    accessorKey: "value",
    header: "Value",
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">{row.getValue("value")}</div>
      );
    },
  },
];

export default function ExamplePage() {
  const { data, isLoading, error, refetch } = useQuery<ExampleApiResponse>({
    queryKey: ["example"],
    queryFn: async () => {
      const response = await api.get<ExampleApiResponse>("/example");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Example Data Fetching</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Example Data Fetching</h1>
        <div className="text-destructive">
          Error:{" "}
          {error instanceof Error ? error.message : "Failed to fetch data"}
        </div>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Example Data Fetching</h1>
      <p className="mb-4">
        This page demonstrates data fetching with TanStack Query and table
        display.
      </p>

      {data && (
        <>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Message: {data.message}</p>
            <p className="text-sm text-muted-foreground">Timestamp: {data.timestamp}</p>
          </div>
          <DataTable columns={columns} data={data.data.items} />
        </>
      )}
    </div>
  );
}
