import { Loader2 } from "lucide-react";

interface LoaderProps {
  /** Size: "xs" | "sm" | "md" | "lg". Default "md". */
  size?: "xs" | "sm" | "md" | "lg";
  /** Optional className for the icon (e.g. text color). */
  className?: string;
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

export default function Loader({ size = "md", className = "" }: LoaderProps) {
  return (
    <Loader2
      className={`animate-spin text-gray-600 ${sizeClasses[size]} ${className}`.trim()}
      aria-hidden
    />
  );
}

interface FullPageLoaderProps {
  /** Optional size for the spinner. Default "lg". */
  size?: "sm" | "md" | "lg";
}

/** Centered full-page loader. Use in loading.tsx and any full-screen loading state. */
export function FullPageLoader({ size = "lg" }: FullPageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader size={size} className="text-gray-600" />
    </div>
  );
}
