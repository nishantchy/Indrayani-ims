"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { axiosInstance } from "@/services/fetcher";
import { mutate } from "swr";
import { toast } from "sonner";
import { Inventory } from "@/types/inventory";

interface AddStockForm {
  quantity: number;
  notes?: string;
}

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Inventory;
}

export default function AddStockDialog({
  open,
  onOpenChange,
  product,
}: AddStockDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddStockForm>();

  const onSubmit = async (data: AddStockForm) => {
    setIsSubmitting(true);
    try {
      await axiosInstance.post(`/api/products/${product.slug}/stock`, data);
      toast.success("Stock updated successfully!");
      onOpenChange(false);
      reset();
      mutate("/api/products");
      mutate(`/api/products/${product.slug}`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to update stock. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock for {product.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("quantity", {
              required: "Quantity is required",
              valueAsNumber: true,
              min: { value: 1, message: "Quantity must be at least 1" },
            })}
            placeholder="Quantity to add"
            type="number"
            className={errors.quantity ? "border-red-500" : ""}
          />
          {errors.quantity && (
            <p className="text-sm text-red-500">{errors.quantity.message}</p>
          )}
          <Input {...register("notes")} placeholder="Notes (optional)" />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Stock"}
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
