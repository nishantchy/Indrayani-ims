"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useInventory } from "@/services/queries";
import { Loader } from "@/components";
import Image from "next/image";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const { data, error, isLoading } = useInventory(slug ?? "");
  const product = Array.isArray(data) ? data[0] : data;

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading product information...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
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
            Error Loading Product
          </h3>
          <p className="text-gray-600">
            Unable to load product information. Please try again later.
          </p>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.513.73-6.291 1.978C5.71 15.97 5.858 15 6 14h.007c.776 0 1.4-.672 1.4-1.5S6.783 11 6.007 11H6c-.142-1-.29-1.97-.291-3.022C7.487 6.27 9.66 5.5 12 5.5s4.513.77 6.291 2.478c-.001 1.052-.149 2.022-.291 3.022h-.007c-.776 0-1.4.672-1.4 1.5s.624 1.5 1.4 1.5H18c.142 1 .29 1.97.291 3.022z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Product Found
          </h3>
          <p className="text-gray-600">
            The requested product information could not be found.
          </p>
        </div>
      </div>
    );

  const imageUrl = product.images?.[0]?.image_url;
  const statusColor =
    product.status === "in_stock"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : product.status === "out_of_stock"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-yellow-50 text-yellow-700 border-yellow-200";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Details
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Detailed information about the product
              </p>
            </div>
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${statusColor}`}
            >
              {product.status
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Product Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              {imageUrl ? (
                <div className="relative">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    width={220}
                    height={220}
                    className="rounded-xl border-4 border-white shadow-lg object-cover"
                  />
                </div>
              ) : (
                <div className="w-44 h-44 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                  {product.product_code}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {product.model_number}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {product.category_name}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4"
                    />
                  </svg>
                  {product.dealer_name}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-lg font-semibold text-gray-900 mb-2">
                <span>Price: ₨ {product.dealer_price.toLocaleString()}</span>
                <span>Stock: {product.stock}</span>
                <span>Total Sales: {product.total_sales}</span>
              </div>
              <div className="text-sm text-gray-500">
                Status:{" "}
                <span className="font-medium text-gray-900">
                  {product.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Product Description
                </h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed capitalize">
                  {product.description || "No description provided."}
                </p>
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">
                    Stock Notes
                  </h4>
                  {product.stock_updates.length > 0 ? (
                    <ul className="capitalize list-disc pl-5 space-y-1">
                      {product.stock_updates.map((s, i) => (
                        <li key={i}>{s.notes || "No note"}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500">
                      No stock notes provided.
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Additional Information
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div>
                    <span className="font-medium">Product Code:</span>{" "}
                    {product.product_code}
                  </div>
                  <div>
                    <span className="font-medium">Model Number:</span>{" "}
                    {product.model_number}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>{" "}
                    {product.category_name}
                  </div>
                  <div>
                    <span className="font-medium">Dealer:</span>{" "}
                    {product.dealer_name}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(product.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Stock Updates and Sales History */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stock Updates Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 bg-blue-50 px-4 py-2 rounded-md inline-block">
              Stock Updates
            </h3>
            {product.stock_updates && product.stock_updates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 font-medium text-gray-700">
                        Date
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-700">
                        Quantity
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-700">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.stock_updates.map((s, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-4 py-2">
                          {s.date ? new Date(s.date).toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-2">{s.quantity}</td>
                        <td className="px-4 py-2">{s.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500">No stock updates available.</div>
            )}
          </div>
          {/* Sales History Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 bg-blue-50 px-4 py-2 rounded-md inline-block">
              Sales History
            </h3>
            {product.sales_history && product.sales_history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 font-medium text-gray-700">
                        Date
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-700">
                        Quantity
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-700">
                        Sale Price
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-700">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.sales_history.map((s, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-4 py-2">
                          {s.date ? new Date(s.date).toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-2">{s.quantity}</td>
                        <td className="px-4 py-2">
                          {s.sale_price
                            ? `₨ ${s.sale_price.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-4 py-2">{s.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500">No sales history available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
