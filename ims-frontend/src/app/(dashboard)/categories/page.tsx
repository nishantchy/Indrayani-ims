import {
  TotalCategories,
  CategoriesTable,
  AddCategoryDialogue,
} from "@/components";
import React from "react";

export default function CategoriesPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <TotalCategories />
        <AddCategoryDialogue />
      </div>
      <CategoriesTable />
    </div>
  );
}
