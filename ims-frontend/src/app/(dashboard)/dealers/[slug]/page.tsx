import { DealerDetailsClient } from "@/components";

export default async function DealersDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <DealerDetailsClient slug={resolvedParams.slug} />;
}
