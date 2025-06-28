import { DisplayMedia, AddMediaDialog } from "@/components";
import React, { Suspense } from "react";
import { Loader } from "@/components";

export default function MediaCenterPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6">
      <div className="flex justify-end items-center mb-4">
        <AddMediaDialog />
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center items-center p-8">
            <Loader />
          </div>
        }
      >
        <DisplayMedia />
      </Suspense>
    </div>
  );
}
