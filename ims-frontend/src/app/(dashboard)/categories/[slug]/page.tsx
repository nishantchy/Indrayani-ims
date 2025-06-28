import { CategoryDetailsClient } from "@/components";

export default async function CategoryDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <CategoryDetailsClient slug={resolvedParams.slug} />;
}
