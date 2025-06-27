"use client";
import { useInventories } from "@/services/queries";
import React from "react";

export default function TotalInventoryItems() {
  const { data, error } = useInventories();
  const total_products = data?.length;
  if (error)
    return (
      <div className="flex items-center justify-center text-red-700 font-semibold">
        Error loading total Products.
      </div>
    );
  return (
    <div className="flex justify-start items-center">
      <p className="py-2 px-3 rounded-md bg-primary-600 text-white font-semibold text-sm">
        Total Inventory Items: {total_products}
      </p>
    </div>
  );
}
