import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Loader({ size = "md", className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div
      className={cn(
        "inline-block rounded-full border-solid border-gray-200 border-t-[#134e4a] animate-spin",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Example usage component
export function LoaderExamples() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Loading Spinner Examples
        </h1>
        <p className="text-gray-600">Different sizes of the loader component</p>
      </div>

      <div className="flex items-center space-x-8">
        <div className="text-center space-y-2">
          <Loader size="sm" />
          <p className="text-sm text-gray-500">Small</p>
        </div>

        <div className="text-center space-y-2">
          <Loader size="md" />
          <p className="text-sm text-gray-500">Medium</p>
        </div>

        <div className="text-center space-y-2">
          <Loader size="lg" />
          <p className="text-sm text-gray-500">Large</p>
        </div>

        <div className="text-center space-y-2">
          <Loader size="xl" />
          <p className="text-sm text-gray-500">Extra Large</p>
        </div>
      </div>

      <div className="space-y-4 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Usage Examples</h2>

        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader size="sm" />
            <span className="text-gray-700">Loading data...</span>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Loader size="md" />
            <span className="text-gray-700">Processing request...</span>
          </div>
        </div>

        <div className="bg-[#134e4a] p-6 rounded-lg text-white">
          <div className="flex items-center justify-center space-x-2">
            <Loader size="md" className="border-white/30 border-t-white" />
            <span>Loading on dark background...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
