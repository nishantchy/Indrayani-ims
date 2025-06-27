"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { axiosInstance } from "@/services/fetcher";
import { mutate } from "swr";
import { toast } from "sonner";

interface CategoryForm {
  name: string;
  description?: string;
}

export default function AddCategoryDialogue() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryForm>();

  const onSubmit = async (data: CategoryForm) => {
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/api/categories", data);
      toast.success("Category created successfully!");
      setOpen(false);
      reset();
      mutate("/api/categories");
    } catch (err) {
      toast.error("Failed to create category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Add New Category <Plus width={20} height={20} color="white" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("name", { required: "Category Name is required" })}
            placeholder="Category Name *"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
          <Input
            {...register("description")}
            placeholder="Description (optional)"
          />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Category"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
