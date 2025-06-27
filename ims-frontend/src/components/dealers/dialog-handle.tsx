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
import MediaModel from "@/components/common/MediaModel";
import { useMedias } from "@/services/queries";
import { axiosInstance } from "@/services/fetcher";
import { mutate } from "swr";
import { toast } from "sonner";

interface DealerForm {
  company_name: string;
  contact_person?: string;
  phone: string;
  email?: string;
  address?: string;
  gst_number?: string;
  dealer_status: "active" | "inactive";
  notes?: string;
  image_id?: string;
}

export default function DealersDialogHandle() {
  const [open, setOpen] = useState(false);
  const [showMediaModel, setShowMediaModel] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: mediaList } = useMedias();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<DealerForm>({
    defaultValues: {
      dealer_status: "active",
    },
  });

  const handleChooseMedia = (mediaId: string) => {
    const mediaObj = mediaList?.find((m: any) => m.id === mediaId);
    setSelectedMedia(mediaObj || { id: mediaId });
    setValue("image_id", mediaId);
    setShowMediaModel(false);
  };

  const onSubmit = async (data: DealerForm) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("company_name", data.company_name);
      formData.append("phone", data.phone);
      formData.append("dealer_status", data.dealer_status);
      if (data.contact_person)
        formData.append("contact_person", data.contact_person);
      if (data.email) formData.append("email", data.email);
      if (data.address) formData.append("address", data.address);
      if (data.gst_number) formData.append("gst_number", data.gst_number);
      if (data.notes) formData.append("notes", data.notes);
      if (data.image_id) formData.append("image_id", data.image_id);
      await axiosInstance.post("/api/dealers", formData);
      toast.success("Dealer created successfully!");
      setOpen(false);
      reset();
      setSelectedMedia(null);
      mutate("/api/dealers");
    } catch (err) {
      toast.error("Failed to create dealer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Add New Dealer <Plus width={20} height={20} color="white" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Dealer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("company_name", {
              required: "Company Name is required",
            })}
            placeholder="Company Name *"
            className={errors.company_name ? "border-red-500" : ""}
          />
          {errors.company_name && (
            <p className="text-sm text-red-500">
              {errors.company_name.message}
            </p>
          )}
          <Input
            {...register("contact_person")}
            placeholder="Contact Person (optional)"
          />
          <Input
            {...register("phone", { required: "Phone is required" })}
            placeholder="Phone *"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
          <Input
            {...register("email")}
            placeholder="Email (optional)"
            type="email"
          />
          <Input {...register("address")} placeholder="Address (optional)" />
          <Input
            {...register("gst_number")}
            placeholder="GST Number (optional)"
          />
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              {...register("dealer_status", { required: true })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <Input {...register("notes")} placeholder="Notes (optional)" />
          {/* Image selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Dealer Image (optional)
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
              {isSubmitting ? "Adding..." : "Add Dealer"}
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
