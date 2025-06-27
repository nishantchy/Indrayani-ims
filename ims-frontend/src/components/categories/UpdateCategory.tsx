"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { axiosInstance } from "@/services/fetcher";
import { mutate } from "swr";
import { toast } from "sonner";
import useSWR from "swr";
import { Category } from "@/types/categories";

interface CategoryForm {
  name?: string;
  description?: string;
}

interface UpdateCategoryProps {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateCategory({
  slug,
  open,
  onOpenChange,
}: UpdateCategoryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: category, isLoading } = useSWR<Category>(
    slug ? `/api/categories/${slug}` : null,
    (url: string) => axiosInstance.get(url).then((res) => res.data)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryForm>();

  useEffect(() => {
    if (category) {
      reset({
        name: category.name || "",
        description: category.description || "",
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryForm) => {
    setIsSubmitting(true);
    try {
      await axiosInstance.put(`/api/categories/${slug}`, data);
      toast.success("Category updated successfully!");
      onOpenChange(false);
      mutate(`/api/categories/${slug}`);
      mutate("/api/categories");
    } catch (err) {
      toast.error("Failed to update category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Category</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register("name")} placeholder="Category Name" />
            <Input {...register("description")} placeholder="Description" />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Category"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
