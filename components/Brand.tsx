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
      <img src="/icon.svg?v=3" alt="" width={34} height={34} className="shrink-0" />
      {!compact && (
        <span>
          ailettergen<span className="text-emerald-500">.</span>
        </span>
      )}
    </span>
  );
}
