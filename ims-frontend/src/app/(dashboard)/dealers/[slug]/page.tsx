"use client";
import React from "react";
import { useDealer } from "@/services/queries";
import { useParams } from "next/navigation";
import { Loader } from "@/components";
import Image from "next/image";

export default function DealersDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const { data, error, isLoading } = useDealer(slug);

  if (isLoading)
    return (
      <div className="flex justify-center items-center p-6">
        <Loader />
      </div>
    );
  if (error)
    return <div className="p-6 text-red-600">Error loading dealer</div>;
  if (!data) return <div className="p-6">No dealer found.</div>;

  const imageUrl = data.images?.[0]?.image_url;
  const statusColor =
    data.status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-8">
        {/* Image Section */}
        <div className="flex-shrink-0 flex flex-col items-center md:items-start">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={data.company_name}
              width={160}
              height={160}
              className="rounded-lg border mb-4 object-cover"
            />
          ) : (
            <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-4">
              No Image
            </div>
          )}
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
          >
            {data.status}
          </span>
        </div>
        {/* Details Section */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data.company_name}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-700">
            <div>
              <span className="font-semibold">Dealer Code:</span>{" "}
              {data.dealer_code}
            </div>
            <div>
              <span className="font-semibold">Slug:</span> {data.slug}
            </div>
            <div>
              <span className="font-semibold">Contact Person:</span>{" "}
              {data.contact_person || (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
            <div>
              <span className="font-semibold">Phone:</span> {data.phone}
            </div>
            <div>
              <span className="font-semibold">Email:</span>{" "}
              {data.email || <span className="text-gray-400">N/A</span>}
            </div>
            <div>
              <span className="font-semibold">Address:</span>{" "}
              {data.address || <span className="text-gray-400">N/A</span>}
            </div>
            <div>
              <span className="font-semibold">GST Number:</span>{" "}
              {data.gst_number || <span className="text-gray-400">N/A</span>}
            </div>
            <div>
              <span className="font-semibold">Created At:</span>{" "}
              {new Date(data.created_at).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Updated At:</span>{" "}
              {new Date(data.updated_at).toLocaleString()}
            </div>
          </div>
          {data.notes && (
            <div className="mt-4">
              <span className="font-semibold">Notes:</span>
              <div className="bg-gray-50 border rounded-lg p-3 mt-1 text-gray-700 whitespace-pre-line">
                {data.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
