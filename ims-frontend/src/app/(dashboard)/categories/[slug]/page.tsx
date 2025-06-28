import CategoryDetailsClient from "../../../../components/categories/CategoryDetailsClient";

// This function is required for static export with dynamic routes
export async function generateStaticParams() {
  // For static export, we need to return an empty array or known slugs
  // Since we don't know all possible slugs at build time, we'll return empty
  // The page will be generated on-demand when accessed
  return [];
}

export default function CategoryDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  return <CategoryDetailsClient slug={params.slug} />;
}
