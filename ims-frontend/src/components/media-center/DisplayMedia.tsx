"use client";
import React, { useState, useEffect, useRef } from "react";
import { useMedias } from "@/services/queries";
import { Loader } from "@/components";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { axiosInstance } from "@/services/fetcher";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import UpdateMediaDialog from "./UpdateMedia";

interface MediaItem {
  id: string;
  filename: string;
  image_url: string;
  created_at?: string;
  file_size?: number;
}

export default function DisplayMedia() {
  const { data, isLoading, error, mutate } = useMedias();
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [imageError, setImageError] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  // Ref for the area that should not trigger uncheck
  const containerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedItem = searchParams.get("item");

  // Find the selected media item for update
  const selectedMedia = data?.find((item) => item.id === selectedItem) || null;

  // Uncheck if clicked outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!selectedItem) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        const params = new URLSearchParams(window.location.search);
        params.delete("item");
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [selectedItem, router]);

  const handleImageClick = (item: MediaItem) => {
    setSelectedImage(item);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleImageError = (itemId: string) => {
    setImageError((prev) => new Set(prev).add(itemId));
  };

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    const params = new URLSearchParams(window.location.search);
    if (checked) {
      params.set("item", itemId);
    } else {
      params.delete("item");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleDeleteClick = () => {
    if (selectedItem) {
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/api/media-center/${selectedItem}`);

      // Clear selection and refresh data
      const params = new URLSearchParams(window.location.search);
      params.delete("item");
      router.replace(`?${params.toString()}`, { scroll: false });
      setShowDeleteDialog(false);

      // Refresh the data
      mutate();

      toast.success("Media deleted successfully!");
    } catch (error: any) {
      // Try to extract backend error message
      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message;

      if (
        backendMessage &&
        backendMessage.includes(
          "Cannot delete media: it is used by a product or dealer"
        )
      ) {
        toast.error(
          "This image cannot be deleted because it is used by a product or dealer. Remove the reference before deleting."
        );
      } else {
        toast.error("Failed to delete media. Please try again.");
      }
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className=" bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading media files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=" bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Media
          </h3>
          <p className="text-gray-600">
            Unable to load media files. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className=" bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Media Center</h1>
            <p className="mt-2 text-gray-600">
              Manage and view your media files
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Media Files
            </h3>
            <p className="text-gray-600">
              Upload some images to get started with your media center.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        ref={containerRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Center</h1>
              <p className="mt-2 text-gray-600">
                {data.length} {data.length === 1 ? "file" : "files"} in your
                media library
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Click any image to view full size</span>
            </div>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="mb-6">
          {selectedItem && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  1 item selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUpdateDialog(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {data.map((item) => {
            const itemId = item.id;
            const isSelected = selectedItem === itemId;

            return (
              <div
                key={itemId}
                className={`relative bg-white rounded-lg shadow-sm border overflow-hidden transition-all ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200"
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(itemId, checked as boolean)
                    }
                    className="bg-white shadow-sm border-gray-300"
                  />
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => handleImageClick(item)}
                >
                  <div className="aspect-square relative">
                    {imageError.has(itemId) ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <svg
                            className="w-8 h-8 text-gray-400 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <p className="text-xs text-gray-500">
                            Failed to load
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={item.image_url}
                        alt={item.filename}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(itemId)}
                      />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="p-3">
                    <p
                      className="text-xs font-medium text-gray-900 truncate"
                      title={item.filename}
                    >
                      {item.filename}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                      <span>{formatFileSize(item.file_size)}</span>
                      {item.created_at && (
                        <span>{formatDate(item.created_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this item? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Update Media Dialog */}
        <UpdateMediaDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          media={selectedMedia}
        />

        {/* Modal for full-size image */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <div className="relative max-w-4xl max-h-full">
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Image */}
              <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
                <div className="relative" style={{ maxHeight: "80vh" }}>
                  <Image
                    src={selectedImage.image_url}
                    alt={selectedImage.filename}
                    width={800}
                    height={600}
                    className="object-contain w-full h-full"
                    style={{ maxHeight: "70vh" }}
                  />
                </div>

                {/* Image details */}
                <div className="bg-white px-6 py-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedImage.filename}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      {formatFileSize(selectedImage.file_size)}
                    </span>
                    {selectedImage.created_at && (
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8l4-4m4 4v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m4 0V9a2 2 0 012-2h4a2 2 0 012 2v4"
                          />
                        </svg>
                        {formatDate(selectedImage.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
