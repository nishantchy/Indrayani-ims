"use client";
import { useCategories } from "@/services/queries";
import React from "react";

export default function TotalCategories() {
  const { data, error } = useCategories();
  if (error)
    return (
      <div className="flex items-center justify-center">
        <p className="text-xl font-semibold text-red-700">
          Error Loading total Categories
        </p>
      </div>
    );
  const total_categories = data?.length;

  return (
    <div className="flex justify-start items-center">
      <p className="py-2 px-3 rounded-md bg-primary-600 text-white font-semibold text-sm">
        Total Categories: {total_categories}
      </p>
    </div>
  );
}
