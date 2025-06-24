"use client";
import { Loader } from "@/components";
import { DataTable } from "@/components/ui/data-table";
import { dealerColumns } from "@/components/columns/dealers-column";
import { useDealers } from "@/services/queries";

export default function DealersTable() {
  const { data, error, isLoading } = useDealers();

  if (isLoading)
    return (
      <div className="flex justify-center items-center p-5">
        <Loader />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center p-5">
        Error loading dealers
      </div>
    );

  return (
    <DataTable
      columns={dealerColumns}
      data={data ?? []}
      globalSearchKeys={["company_name", "contact_person", "phone", "email"]}
      searchPlaceholder="Search dealers..."
    />
  );
}
