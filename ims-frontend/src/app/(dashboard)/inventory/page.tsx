import {
  InventoryTable,
  TotalInventoryItems,
  AddProductsDialog,
} from "@/components";
import React from "react";

export default function InventoryPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <TotalInventoryItems />
        <AddProductsDialog />
      </div>
      <InventoryTable />
    </div>
  );
}
