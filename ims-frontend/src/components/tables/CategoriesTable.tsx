"use client";
import { Loader } from "@/components";
import { DataTable } from "@/components/ui/data-table";
import { categoriesColumns } from "@/components/columns/categories-column";
import { useCategories } from "@/services/queries";
import { Category } from "@/types/categories";

export default function CategoriesTable() {
  const { data, error, isLoading } = useCategories();

  if (isLoading)
    return (
      <div className="flex justify-center items-center p-5">
        <Loader />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center p-5">
        Error loading Categories
      </div>
    );

  return (
    <DataTable<Category>
      columns={categoriesColumns}
      data={data ?? []}
      globalSearchKeys={["name"]}
      searchPlaceholder="Search categories..."
    />
  );
}
