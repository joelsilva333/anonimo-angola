const glassCard = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.38)",
  borderRadius: "24px",
  boxShadow: "0 4px 24px rgba(30,30,30,0.06)",
};

function Bar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-gray-300/50 ${className}`}
    />
  );
}

export default function PostSkeleton() {
  return (
    <div
      className="w-full flex flex-col gap-4 p-6"
      style={glassCard}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gray-300/50 animate-pulse shrink-0" />
        <div className="flex flex-col gap-2">
          <Bar className="h-3 w-28" />
          <Bar className="h-2.5 w-16" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-5/6" />
        <Bar className="h-4 w-2/3" />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Bar className="h-8 w-full rounded-xl" />
        <Bar className="h-8 w-full rounded-xl" />
        <Bar className="h-8 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="w-full flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}
