"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function BrandMark({ className = "size-10" }: { className?: string }) {
  const [logo, setLogo] = React.useState<string>("");

  React.useEffect(() => {
    const readLogo = () => setLogo(window.localStorage.getItem("tet-community-logo") ?? "");
    readLogo();
    window.addEventListener("storage", readLogo);
    window.addEventListener("tet-community-logo", readLogo);

    return () => {
      window.removeEventListener("storage", readLogo);
      window.removeEventListener("tet-community-logo", readLogo);
    };
  }, []);

  return (
    <div
      className={cn(
        "overflow-visible drop-shadow-[0_0_12px_rgba(239,16,24,0.28)]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo || "/brand/tet-community-logo.png"} alt="TET Community logo" className="h-full w-full object-contain" />
    </div>
  );
}
