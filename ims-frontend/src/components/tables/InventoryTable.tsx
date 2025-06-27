"use client";
import { Loader } from "@/components";
import { DataTable } from "@/components/ui/data-table";
import { inventoryColumns } from "@/components/columns/inventory-columns";
import { useInventories } from "@/services/queries";

export default function InventoryTable() {
  const { data, error, isLoading } = useInventories();

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
      columns={inventoryColumns}
      data={data ?? []}
      globalSearchKeys={[
        "name",
        "model_number",
        "dealer_name",
        "category_name",
      ]}
      searchPlaceholder="Search inventory items..."
    />
  );
}
