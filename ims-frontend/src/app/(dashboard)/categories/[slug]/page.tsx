"use client";
import { Loader } from "@/components";
import { useCategory } from "@/services/queries";
import { useParams } from "next/navigation";
import React from "react";
import { Category } from "@/types/categories";

// This function is required for static export with dynamic routes
export async function generateStaticParams() {
  // For static export, we need to return an empty array or known slugs
  // Since we don't know all possible slugs at build time, we'll return empty
  // The page will be generated on-demand when accessed
  return [];
}

export default function CategoryDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const { data, error, isLoading } = useCategory(slug || "");
  const category: Category | undefined = Array.isArray(data) ? data[0] : data;

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading Category information...</p>
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
            Error Loading Category
          </h3>
          <p className="text-gray-600">
            Unable to load Category information. Please try again later.
          </p>
        </div>
      </div>
    );

  if (!category)
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
            No Category Found
          </h3>
          <p className="text-gray-600">
            The requested Category information could not be found.
          </p>
        </div>
      </div>
    );

  const statusColor =
    category.status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-red-50 text-red-700 border-red-200";
  const dotColor = category.status === "active" ? "bg-green-500" : "bg-red-500";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md border p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h1>
              <p className="mt-1 text-sm text-gray-600">Category Details</p>
            </div>
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${statusColor}`}
            >
              <span className={`h-2 w-2 rounded-full mr-2 ${dotColor}`}></span>
              {category.status.charAt(0).toUpperCase() +
                category.status.slice(1)}
            </div>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {category.description || (
                <span className="italic text-gray-400">
                  No description provided.
                </span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div>
              <span className="block text-xs text-gray-500">Slug</span>
              <span className="font-mono text-gray-800">{category.slug}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Created At</span>
              <span className="text-gray-800">
                {new Date(category.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Updated At</span>
              <span className="text-gray-800">
                {new Date(category.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
