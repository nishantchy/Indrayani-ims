"use client";
import React, { useState, useEffect } from "react";
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
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import MediaModel from "@/components/common/MediaModel";
import { useMedias } from "@/services/queries";
import { axiosInstance } from "@/services/fetcher";
import { mutate } from "swr";
import { toast } from "sonner";
import useSWR from "swr";

interface DealerForm {
  company_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  gst_number?: string;
  dealer_status?: "active" | "inactive";
  notes?: string;
  image_id?: string;
}

interface UpdateDealerProps {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateDealer({
  slug,
  open,
  onOpenChange,
}: UpdateDealerProps) {
  const [showMediaModel, setShowMediaModel] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: mediaList } = useMedias();

  const { data: dealer, isLoading } = useSWR(
    slug ? `/api/dealers/${slug}` : null,
    (url) => axiosInstance.get(url).then((res) => res.data)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<DealerForm>();

  useEffect(() => {
    if (dealer) {
      reset({
        company_name: dealer.company_name || "",
        contact_person: dealer.contact_person || "",
        phone: dealer.phone || "",
        email: dealer.email || "",
        address: dealer.address || "",
        gst_number: dealer.gst_number || "",
        dealer_status: dealer.status || "active",
        notes: dealer.notes || "",
        image_id: dealer.image_id || "",
      });
      if (dealer.image_id && mediaList) {
        const mediaObj = mediaList.find((m: any) => m.id === dealer.image_id);
        setSelectedMedia(mediaObj || { id: dealer.image_id });
      } else {
        setSelectedMedia(null);
      }
    }
  }, [dealer, mediaList, reset]);

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
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value as string);
        }
      });
      await axiosInstance.put(`/api/dealers/${slug}`, formData);
      toast.success("Dealer updated successfully!");
      onOpenChange(false);
      mutate(`/api/dealers/${slug}`);
      mutate("/api/dealers");
    } catch (err) {
      toast.error("Failed to update dealer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Dealer</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register("company_name")} placeholder="Company Name" />
            <Input
              {...register("contact_person")}
              placeholder="Contact Person"
            />
            <Input {...register("phone")} placeholder="Phone" />
            <Input {...register("email")} placeholder="Email" type="email" />
            <Input {...register("address")} placeholder="Address" />
            <Input {...register("gst_number")} placeholder="GST Number" />
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                {...register("dealer_status")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <Input {...register("notes")} placeholder="Notes" />
            {/* Image selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Dealer Image
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
                {isSubmitting ? "Updating..." : "Update Dealer"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        )}
        <MediaModel
          open={showMediaModel}
          onOpenChange={setShowMediaModel}
          onChoose={handleChooseMedia}
        />
      </DialogContent>
    </Dialog>
  );
}
