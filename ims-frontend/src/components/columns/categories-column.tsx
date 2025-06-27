import { ColumnDef } from "@tanstack/react-table";
import { Dealer } from "@/types/dealers";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
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
import { UpdateCategory } from "@/components";
import { Category } from "@/types/categories";

export const categoriesColumns: ColumnDef<Category>[] = [
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
    accessorKey: "name",
    header: "Category Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const isActive =
        typeof status === "string" && status.toLowerCase() === "active";
      const color = isActive ? "bg-green-500" : "bg-red-500";
      return (
        <span className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${color}`}></span>
          <span className="capitalize">{status ? status : "Unknown"}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: true,
    cell: function ActionsCell({ row }) {
      const category = row.original;
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);
      const [isDeleting, setIsDeleting] = useState(false);
      const [showUpdateDialog, setShowUpdateDialog] = useState(false);

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          await axiosInstance.delete(`/api/categories/${category.slug}`);
          toast.success("Dealer deleted successfully!");
          mutate("/api/categories");
        } catch (err) {
          toast.error("Failed to delete dealer. Please try again.");
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
                  href={`/categories/${category.slug}`}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" /> View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowUpdateDialog(true)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2 text-red-600" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <UpdateCategory
            slug={category.slug}
            open={showUpdateDialog}
            onOpenChange={setShowUpdateDialog}
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
                Are you sure you want to delete this dealer? This action cannot
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
