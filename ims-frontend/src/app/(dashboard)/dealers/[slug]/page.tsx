import { DealerDetailsClient } from "@/components";

export async function generateStaticParams() {
  return [];
}

export default async function DealersDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <DealerDetailsClient slug={resolvedParams.slug} />;
}
