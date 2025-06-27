import { ColumnDef } from "@tanstack/react-table";
import { Inventory } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Plus } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { axiosInstance } from "@/services/fetcher";
import { mutate } from "swr";
import { toast } from "sonner";
import Image from "next/image";
import { UpdateProductDialog, AddStockDialog } from "@/components";
import SellItemDialog from "../SellItemDialog";

export const inventoryColumns: ColumnDef<Inventory>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "product_code",
    header: "Product Code",
    cell: ({ row }) => row.original.product_code,
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "image",
    header: "Image",
    cell: ({ row }) => {
      const img = row.original.images?.[0]?.image_url;
      return img ? (
        <Image
          src={img}
          alt={row.original.name}
          width={40}
          height={40}
          className="rounded object-cover"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
          N/A
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "model_number",
    header: "Model",
    cell: ({ row }) => row.original.model_number,
  },
  {
    accessorKey: "category_name",
    header: "Category",
    cell: ({ row }) => row.original.category_name,
  },
  {
    accessorKey: "dealer_name",
    header: "Dealer",
    cell: ({ row }) => row.original.dealer_name,
  },
  {
    accessorKey: "dealer_price",
    header: "Dealer Price",
    cell: ({ row }) =>
      row.original.dealer_price
        ? `₨ ${row.original.dealer_price.toLocaleString()}`
        : "-",
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => row.original.stock,
  },
  {
    accessorKey: "total_sales",
    header: "Total Sales",
    cell: ({ row }) => row.original.total_sales,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let color = "bg-gray-400";
      if (status === "in_stock") color = "bg-green-500";
      else if (status === "out_of_stock") color = "bg-red-500";
      else if (status === "discontinued") color = "bg-yellow-500";
      return (
        <span className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${color}`}></span>
          <span className="capitalize">
            {status ? status.replace(/_/g, " ") : "Unknown"}
          </span>
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: true,
    cell: function ActionsCell({ row }) {
      const product = row.original;
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);
      const [isDeleting, setIsDeleting] = useState(false);
      const [showUpdateDialog, setShowUpdateDialog] = useState(false);
      const [showAddStockDialog, setShowAddStockDialog] = useState(false);
      const [showSellItemDialog, setShowSellItemDialog] = useState(false);

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          await axiosInstance.delete(`/api/products/${product.slug}`);
          toast.success("Product deleted successfully!");
          mutate("/api/products");
        } catch (err: any) {
          if (
            err.response &&
            err.response.status === 400 &&
            err.response.data?.detail?.includes("stock")
          ) {
            toast.error(
              "Product can only be deleted if its stock is zero. Please reduce the stock to zero before deleting."
            );
          } else {
            toast.error("Failed to delete product. Please try again.");
          }
        } finally {
          setIsDeleting(false);
          setShowDeleteDialog(false);
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href={`/inventory/${product.slug}`}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" /> View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowUpdateDialog(true)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAddStockDialog(true)}>
                <Plus className="h-4 w-4 mr-2 text-blue-600" /> Update Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSellItemDialog(true)}>
                <Plus className="h-4 w-4 mr-2 text-green-600" /> Sell Item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2 text-red-600" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <UpdateProductDialog
            open={showUpdateDialog}
            onOpenChange={setShowUpdateDialog}
            product={product}
          />
          <AddStockDialog
            open={showAddStockDialog}
            onOpenChange={setShowAddStockDialog}
            product={product}
          />
          <SellItemDialog
            open={showSellItemDialog}
            onOpenChange={setShowSellItemDialog}
            product={product}
          />
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              </AlertDialogHeader>
              <div>
                Are you sure you want to delete this product? This action cannot
                be undone.
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];
