import type { ReactNode } from "react";
import { SketchBackground } from "@/components/background/SketchBackground/SketchBackground";
import type { SketchPageKey } from "@/components/background/SketchBackground/sketch.types";
import { joinClassNames } from "@/components/background/SketchBackground/sketch.utils";

type SketchPageShellProps = {
  page: SketchPageKey;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  maxItems?: number;
};

export function SketchPageShell({
  page,
  children,
  className,
  contentClassName,
  maxItems,
}: SketchPageShellProps) {
  // Mark protected content with data-sketch-safe-zone="hard" or "soft" inside this shell.
  return (
    <div className={joinClassNames("sketch-page-shell", className)} data-sketch-shell>
      <SketchBackground page={page} maxItems={maxItems} />
      <div className={joinClassNames("sketch-page-content", contentClassName)}>{children}</div>
    </div>
  );
}
