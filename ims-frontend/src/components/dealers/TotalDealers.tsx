"use client";
import { useDealers } from "@/services/queries";
import React from "react";
import { Loader } from "@/components";

export default function TotalDealers() {
  const { data, isLoading, error } = useDealers();
  if (isLoading)
    return (
      <div className="flex justify-center items-center">
        <Loader />
      </div>
    );
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
      <p>Total Dealers: {total_dealers}</p>
    </div>
  );
}
