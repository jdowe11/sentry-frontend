"use client";

import React from "react";
import MatrixRainCanvas from "@/components/MatrixRainCanvas";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full min-h-screen bg-background overflow-hidden select-none flex items-center justify-center">
      {/* Persistent cmatrix digital rain background — stays mounted across all auth routes */}
      <MatrixRainCanvas opacity={0.28} />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,150,105,0.04)_0,transparent_70%)] pointer-events-none" />

      {/* Page content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
