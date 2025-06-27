"use client";
import React, { useState, useEffect } from "react";
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
import MediaModel from "@/components/common/MediaModel";
import { useDealers, useMedias } from "@/services/queries";
import { axiosInstance } from "@/services/fetcher";
import { mutate } from "swr";
import { toast } from "sonner";
import { Inventory } from "@/types/inventory";

interface UpdateProductForm {
  name?: string;
  dealer_id?: string;
  dealer_price?: number;
  description?: string;
  image_id?: string;
  status?: string;
}

interface UpdateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Inventory;
}

export default function UpdateProductDialog({
  open,
  onOpenChange,
  product,
}: UpdateProductDialogProps) {
  const [showMediaModel, setShowMediaModel] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: dealers } = useDealers();
  const { data: mediaList } = useMedias();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UpdateProductForm>();

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        dealer_id: product.dealer_id || "",
        dealer_price: product.dealer_price || undefined,
        description: product.description || "",
        image_id: product.image_id || "",
        status: product.status || "in_stock",
      });
      if (product.image_id && mediaList) {
        const mediaObj = mediaList.find((m: any) => m.id === product.image_id);
        setSelectedMedia(mediaObj || { id: product.image_id });
      } else {
        setSelectedMedia(null);
      }
    }
  }, [product, mediaList, reset]);

  const handleChooseMedia = (mediaId: string) => {
    const mediaObj = mediaList?.find((m: any) => m.id === mediaId);
    setSelectedMedia(mediaObj || { id: mediaId });
    setValue("image_id", mediaId);
    setShowMediaModel(false);
  };

  const onSubmit = async (data: UpdateProductForm) => {
    setIsSubmitting(true);
    try {
      // Only send fields that are changed
      const payload: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          payload[key] = value;
        }
      });
      await axiosInstance.put(`/api/products/${product.slug}`, payload);
      toast.success("Product updated successfully!");
      onOpenChange(false);
      mutate(`/api/products/${product.slug}`);
      mutate("/api/products");
    } catch (err: any) {
      if (err.response) {
        toast.error(
          err.response.data?.detail ||
            err.response.data?.message ||
            "Failed to update product. Please check your input and try again."
        );
      } else {
        toast.error("Failed to update product. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register("name")} placeholder="Product Name" />
          <div>
            <label className="block text-sm font-medium mb-1">Dealer</label>
            <select
              {...register("dealer_id")}
              className="w-full border rounded px-3 py-2"
              defaultValue={product.dealer_id || ""}
            >
              <option value="" disabled>
                Select Dealer
              </option>
              {dealers?.map((dealer) => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.company_name}
                </option>
              ))}
            </select>
          </div>
          <Input
            {...register("dealer_price", { valueAsNumber: true })}
            placeholder="Dealer Price (NPR)"
            type="number"
          />
          <Input {...register("description")} placeholder="Description" />
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              {...register("status")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
          {/* Image selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Image (optional)
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMediaModel(true)}
            >
              Choose Image from Media Center
            </Button>
            {selectedMedia && selectedMedia.image_url && (
              <div className="mt-2 flex items-center space-x-2">
                <img
                  src={selectedMedia.image_url}
                  alt={selectedMedia.filename || "Selected Media"}
                  className="w-16 h-16 object-cover rounded border"
                />
                <span className="text-xs text-gray-700 truncate">
                  {selectedMedia.filename}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Product"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
        <MediaModel
          open={showMediaModel}
          onOpenChange={setShowMediaModel}
          onChoose={handleChooseMedia}
        />
      </DialogContent>
    </Dialog>
  );
}
