import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Label } from "../ui/label";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "@/services/fetcher";
import { mutate } from "swr";
import { Loader } from "@/components";

interface FormData {
  filename: string;
  image: File | null;
}

interface UpdateMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: {
    id: string;
    filename: string;
    image_url: string;
  } | null;
}

export default function UpdateMediaDialog({
  open,
  onOpenChange,
  media,
}: UpdateMediaDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      filename: media?.filename || "",
      image: null,
    },
  });

  // When media changes, reset form and preview
  useEffect(() => {
    reset({ filename: media?.filename || "", image: null });
    setPreviewUrl(media?.image_url || null);
    setSelectedFile(null);
  }, [media, reset]);

  // File validation function
  const validateFile = (file: File | null) => {
    if (!file) return true; // allow not updating image
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return "Only PNG and JPG files are allowed";
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }
    return true;
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validation = validateFile(file);
      if (validation !== true) {
        toast.error(validation as string);
        return;
      }
      setSelectedFile(file);
      setValue("image", file);
      clearErrors("image");
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setRemoveImage(false);
    }
  };

  // Remove selected file
  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (previewUrl && selectedFile) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setValue("image", null);
    setRemoveImage(true);
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!media) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("filename", data.filename);
    if (selectedFile) {
      formData.append("image", selectedFile);
    } else if (removeImage) {
      formData.append("remove_image", "true");
    }
    try {
      await axiosInstance.put(`/api/media-center/${media.id}`, formData);
      setSubmitStatus("success");
      onOpenChange(false);
      mutate("/api/media-center");
      toast.success("Media updated successfully!");
    } catch (err) {
      setSubmitStatus("error");
      toast.error("Failed to update media. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset({ filename: media?.filename || "", image: null });
      setPreviewUrl(media?.image_url || null);
      setSelectedFile(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Media</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Filename Input */}
          <div className="space-y-2">
            <Label htmlFor="filename">File Name</Label>
            <Input
              id="filename"
              placeholder="Enter file name"
              {...register("filename", {
                required: "File name is required",
                minLength: {
                  value: 1,
                  message: "File name must not be empty",
                },
              })}
              className={errors.filename ? "border-red-500" : ""}
            />
            {errors.filename && (
              <p className="text-sm text-red-500">{errors.filename.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Image Upload</Label>
            <input
              id="image"
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {/* Upload Area */}
            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors hover:border-primary/50 hover:bg-primary/5
                  ${
                    selectedFile === null && errors.image
                      ? "border-red-500"
                      : "border-gray-300"
                  }
                `}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload an image
                </p>
                <p className="text-xs text-gray-500">
                  PNG or JPG files only • Max 5MB
                </p>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile?.name || media?.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedFile?.size
                        ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                        : null}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            )}
            {/* Manual validation since we're not using react-hook-form's file validation */}
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!!errors.filename || isUploading}>
              {isUploading ? <Loader className="mr-2" /> : null}
              {isUploading ? "Updating..." : "Update Media"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
