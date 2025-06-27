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
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import MediaModel from "@/components/common/MediaModel";
import { useMedias, useCategories, useDealers } from "@/services/queries";
import { axiosInstance } from "@/services/fetcher";
import { mutate } from "swr";
import { toast } from "sonner";

interface ProductForm {
  category_id: string;
  name: string;
  model_number: string;
  dealer_id: string;
  dealer_price: number;
  description?: string;
  image_id?: string;
  initial_stock: number;
  stock_notes?: string;
}

export default function AddProductsDialog() {
  const [open, setOpen] = useState(false);
  const [showMediaModel, setShowMediaModel] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: mediaList } = useMedias();
  const { data: categories } = useCategories();
  const { data: dealers } = useDealers();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<ProductForm>();

  const selectedCategoryId = watch("category_id");
  const selectedDealerId = watch("dealer_id");

  const handleChooseMedia = (mediaId: string) => {
    const mediaObj = mediaList?.find((m: any) => m.id === mediaId);
    setSelectedMedia(mediaObj || { id: mediaId });
    setValue("image_id", mediaId);
    setShowMediaModel(false);
  };

  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting product data:", data);
      await axiosInstance.post("/api/products", data);
      toast.success("Product created successfully!");
      setOpen(false);
      reset();
      setSelectedMedia(null);
      mutate("/api/products");
    } catch (err: any) {
      // Enhanced error logging
      if (err.response) {
        console.error("Backend error:", err.response.data);
        toast.error(
          err.response.data?.detail ||
            err.response.data?.message ||
            "Failed to create product. Please check your input and try again."
        );
      } else {
        console.error("Unknown error:", err);
        toast.error("Failed to create product. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Add New Product <Plus width={20} height={20} color="white" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              {...register("category_id", { required: "Category is required" })}
              className={`w-full border rounded px-3 py-2 ${
                errors.category_id ? "border-red-500" : ""
              }`}
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-sm text-red-500">
                {errors.category_id.message as string}
              </p>
            )}
          </div>

          {/* Name */}
          <Input
            {...register("name", { required: "Product Name is required" })}
            placeholder="Product Name *"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}

          {/* Model Number */}
          <Input
            {...register("model_number", {
              required: "Model Number is required",
            })}
            placeholder="Model Number *"
            className={errors.model_number ? "border-red-500" : ""}
          />
          {errors.model_number && (
            <p className="text-sm text-red-500">
              {errors.model_number.message}
            </p>
          )}

          {/* Dealer */}
          <div>
            <label className="block text-sm font-medium mb-1">Dealer *</label>
            <select
              {...register("dealer_id", { required: "Dealer is required" })}
              className={`w-full border rounded px-3 py-2 ${
                errors.dealer_id ? "border-red-500" : ""
              }`}
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
            {errors.dealer_id && (
              <p className="text-sm text-red-500">
                {errors.dealer_id.message as string}
              </p>
            )}
          </div>

          {/* Dealer Price */}
          <Input
            {...register("dealer_price", {
              required: "Dealer Price is required",
              valueAsNumber: true,
              min: { value: 0, message: "Price must be non-negative" },
            })}
            placeholder="Dealer Price (NPR) *"
            type="number"
            className={errors.dealer_price ? "border-red-500" : ""}
          />
          {errors.dealer_price && (
            <p className="text-sm text-red-500">
              {errors.dealer_price.message}
            </p>
          )}

          {/* Initial Stock */}
          <Input
            {...register("initial_stock", {
              required: "Initial Stock is required",
              valueAsNumber: true,
              min: { value: 0, message: "Stock must be non-negative" },
            })}
            placeholder="Initial Stock *"
            type="number"
            className={errors.initial_stock ? "border-red-500" : ""}
          />
          {errors.initial_stock && (
            <p className="text-sm text-red-500">
              {errors.initial_stock.message}
            </p>
          )}

          {/* Description */}
          <Input
            {...register("description")}
            placeholder="Description (optional)"
          />

          {/* Stock Notes */}
          <Input
            {...register("stock_notes")}
            placeholder="Stock Notes (optional)"
          />

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
              {isSubmitting ? "Adding..." : "Add Product"}
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
