"use client";
import { useDealers } from "@/services/queries";
import React from "react";

export default function TotalDealers() {
  const { data, error } = useDealers();
  if (error)
    return (
      <div className="flex items-center justify-center">
        <p className="text-xl font-semibold text-red-700">
          Error Loading total Dealers
        </p>
      </div>
    );
  const total_dealers = data?.length;

  return (
    <div className="flex justify-start items-center">
      <p className="py-2 px-3 rounded-md bg-primary-600 text-white font-semibold text-sm">
        Total Dealers: {total_dealers}
      </p>
    </div>
  );
}
