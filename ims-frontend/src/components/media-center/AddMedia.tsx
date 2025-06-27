"use client";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
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
import { Label } from "../ui/label";
import { Plus, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "@/services/fetcher";
import { mutate } from "swr";
import { Loader } from "@/components";

interface AddMediaDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface FormData {
  filename: string;
  image: File | null;
}

export default function AddMediaDialog({
  open: controlledOpen,
  onOpenChange,
}: AddMediaDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    clearErrors,
  } = useForm<FormData>();

  const watchedFilename = watch("filename");

  // File validation function
  const validateFile = (file: File | null) => {
    if (!file) {
      return "Please select an image";
    }

    // Check file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return "Only PNG and JPG files are allowed";
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
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
      // Validate file
      const validation = validateFile(file);
      if (validation !== true) {
        return; // Let the form validation handle the error
      }
      setSelectedFile(file);
      setValue("image", file);
      clearErrors("image");
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Auto-populate filename if empty
      if (!watchedFilename) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        setValue("filename", nameWithoutExtension);
      }
    }
  };

  // Remove selected file
  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setValue("image", null);
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!selectedFile) {
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("filename", data.filename);
    formData.append("image", selectedFile);
    try {
      await axiosInstance.post("/api/media-center", formData);
      setSubmitStatus("success");
      handleDialogClose(false);
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setIsUploading(false);
    }
    mutate("/api/media-center");
  };

  // Handle dialog close
  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          Add New Media
          <Plus size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Media</DialogTitle>
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

            {/* File Input (Hidden) */}
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
              /* Preview Area */
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
                      {selectedFile?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedFile?.size &&
                        `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
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
            {!selectedFile && (
              <p className="text-sm text-red-500">Please select an image</p>
            )}
          </div>

          {/* Form Actions */}
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!!errors.filename || !selectedFile || isUploading}
            >
              {isUploading ? <Loader className="mr-2" /> : null}
              {isUploading ? "Uploading..." : "Add Media"}
            </Button>
          </DialogFooter>
          {submitStatus === "success" &&
            toast("New Media has been uploaded successfully!")}
          {submitStatus === "error" &&
            toast("Failed to upload media. Please try again.")}
        </form>
      </DialogContent>
    </Dialog>
  );
}
