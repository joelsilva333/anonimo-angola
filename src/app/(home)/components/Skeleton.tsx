import React from "react";

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
};

export default function Skeleton({
  width = "100%",
  height = "100%",
  circle = false,
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-300 ${
        circle ? "rounded-full" : "rounded-md"
      } ${className}`}
      style={{ width, height }}
    />
  );
}
