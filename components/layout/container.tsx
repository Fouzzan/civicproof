import { cn } from "cn";

type ContainerProps = {
  /**
   * `page` — the 1280px marketing and dashboard width.
   * `form`  — the narrow reading measure used by the reporting flow.
   * `case`  — between the two: wide enough for a case record, narrow enough to read.
   */
  readonly width?: "page" | "form" | "case";
  readonly className?: string;
  readonly children: React.ReactNode;
};

const WIDTH = {
  page: "max-w-7xl",
  form: "max-w-3xl",
  case: "max-w-5xl",
} as const;

/**
 * The single source of truth for horizontal rhythm.
 *
 * Every page-level surface goes through here, so the gutter and maximum width
 * are defined once rather than re-typed — and a layout change is one edit, not
 * a search across pages.
 */
export function Container({ width = "page", className, children }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        WIDTH[width],
        className,
      )}
    >
      {children}
    </div>
  );
}
