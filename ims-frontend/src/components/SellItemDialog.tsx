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

interface SellItemForm {
  quantity: number;
  sale_price: number;
  notes?: string;
}

interface SellItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Inventory;
}

export default function SellItemDialog({
  open,
  onOpenChange,
  product,
}: SellItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SellItemForm>();

  const onSubmit = async (data: SellItemForm) => {
    setIsSubmitting(true);
    try {
      await axiosInstance.post(`/api/products/${product.slug}/sell`, data);
      toast.success("Sale recorded successfully!");
      onOpenChange(false);
      reset();
      mutate("/api/products");
      mutate(`/api/products/${product.slug}`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Failed to record sale. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sell Item: {product.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("quantity", {
              required: "Quantity is required",
              valueAsNumber: true,
              min: { value: 1, message: "Quantity must be at least 1" },
            })}
            placeholder="Quantity to sell"
            type="number"
            className={errors.quantity ? "border-red-500" : ""}
          />
          {errors.quantity && (
            <p className="text-sm text-red-500">{errors.quantity.message}</p>
          )}
          <Input
            {...register("sale_price", {
              required: "Sale price is required",
              valueAsNumber: true,
              min: { value: 0, message: "Sale price must be non-negative" },
            })}
            placeholder="Sale price per item"
            type="number"
            className={errors.sale_price ? "border-red-500" : ""}
          />
          {errors.sale_price && (
            <p className="text-sm text-red-500">{errors.sale_price.message}</p>
          )}
          <Input {...register("notes")} placeholder="Notes (optional)" />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Sale"}
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
