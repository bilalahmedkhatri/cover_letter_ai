import { cn } from "@/lib/utils";
export default function Brand({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("brand", className)}>
      <svg
        aria-hidden="true"
        width="34"
        height="34"
        viewBox="0 0 40 40"
        fill="none"
      >
        <rect width="40" height="40" rx="11" fill="#059669" />
        <path
          d="M12 9h12l5 5v17H12V9Z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M23 9v6h6M16 20h9M16 25h7"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <span>
          ailettergen<span className="text-emerald-500">.</span>
        </span>
      )}
    </span>
  );
}
