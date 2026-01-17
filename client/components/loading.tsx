"use client";

import { Spinner } from "./ui/spinner";

export function LoadingComponent() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Spinner className="w-20 h-20" />
    </div>
  );
}
