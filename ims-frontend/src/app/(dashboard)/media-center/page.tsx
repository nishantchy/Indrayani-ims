import { DisplayMedia, AddMediaDialog } from "@/components";
import React from "react";

export default function MediaCenterPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6">
      <div className="flex justify-end items-center mb-4">
        <AddMediaDialog />
      </div>
      <DisplayMedia />
    </div>
  );
}
