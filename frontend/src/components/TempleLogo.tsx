"use client";

import React from "react";

interface TempleLogoProps {
  className?: string;
  size?: number;
}

export function TempleLogo({ className = "text-[#5A2314]", size = 28 }: TempleLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pediment roof triangle */}
      <path d="M16 3L3 10H29L16 3Z" />
      {/* Architrave bar under roof */}
      <rect x="4" y="11" width="24" height="2.5" rx="0.5" />
      {/* 4 Classical Columns */}
      <rect x="6" y="14.5" width="2.8" height="11" rx="0.5" />
      <rect x="11.8" y="14.5" width="2.8" height="11" rx="0.5" />
      <rect x="17.4" y="14.5" width="2.8" height="11" rx="0.5" />
      <rect x="23.2" y="14.5" width="2.8" height="11" rx="0.5" />
      {/* Base platform */}
      <rect x="3" y="26.5" width="26" height="2.5" rx="0.5" />
    </svg>
  );
}
