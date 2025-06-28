import { CategoryDetailsClient } from "@/components";

export async function generateStaticParams() {
  return [];
}

export default async function CategoryDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <CategoryDetailsClient slug={resolvedParams.slug} />;
}
