import React, { useState } from "react";
import { useMedias } from "@/services/queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "@/components";
import AddMediaDialog from "../media-center/AddMedia";
import { toast } from "sonner";

interface MediaModelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoose: (mediaId: string) => void;
}

export default function MediaModel({
  open,
  onOpenChange,
  onChoose,
}: MediaModelProps) {
  const { data, isLoading, error, mutate } = useMedias();
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleChoose = () => {
    if (selectedMediaId) {
      onChoose(selectedMediaId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full !max-w-screen-xl mx-auto min-h-2/3">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <span className="text-gray-700 font-medium">
            Choose an image for the dealer
          </span>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">
            Failed to load media. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {data && data.length > 0 ? (
              data.map((media) => (
                <div
                  key={media.id}
                  className={`relative border rounded-lg p-2 flex flex-col items-center transition-all ${
                    selectedMediaId === media.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedMediaId(media.id)}
                  style={{ cursor: "pointer" }}
                >
                  <Checkbox
                    checked={selectedMediaId === media.id}
                    onCheckedChange={() => setSelectedMediaId(media.id)}
                    className="absolute top-2 left-2 z-10 bg-white"
                  />
                  <img
                    src={media.image_url}
                    alt={media.filename}
                    className="w-24 h-24 object-cover rounded mb-2 border"
                  />
                  <div className="text-xs text-gray-700 truncate w-full text-center">
                    {media.filename}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No media found. Add new media to get started.
              </div>
            )}
          </div>
        )}
        <DialogFooter className="mt-4 flex flex-row gap-2 justify-end">
          {/* <Button
            onClick={() => setShowAddDialog(true)}
            variant="secondary"
            size="sm"
          >
            Add New Media
          </Button> */}
          <AddMediaDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
          />
          <Button
            onClick={handleChoose}
            disabled={!selectedMediaId}
            size="default"
          >
            Choose
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" size="default">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
