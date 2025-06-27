import { DealersTable } from "@/components";
import { DealersDialogHandle } from "@/components";

export default function DealersPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6">
      <div className="flex justify-end items-center mb-4">
        <DealersDialogHandle />
      </div>
      <DealersTable />
    </div>
  );
}
