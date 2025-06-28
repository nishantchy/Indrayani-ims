import { ProductDetailsClient } from "@/components";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <ProductDetailsClient slug={resolvedParams.slug} />;
}
