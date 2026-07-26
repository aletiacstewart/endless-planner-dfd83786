import { useEffect, useState, type ReactNode } from "react";

interface Props {
  /** Change this to trigger a page-flip animation. */
  flipKey: string;
  /** "next" flips right → forward, "prev" flips left → back. */
  direction?: "next" | "prev";
  children: ReactNode;
}

/**
 * Lightweight CSS page-flip. Re-mounts children when flipKey changes and
 * plays a short flip-in animation whose direction is set via CSS var.
 */
export function PageFlip({ flipKey, direction = "next", children }: Props) {
  const [current, setCurrent] = useState({ key: flipKey, dir: direction });

  useEffect(() => {
    if (flipKey !== current.key) {
      setCurrent({ key: flipKey, dir: direction });
    }
  }, [flipKey, direction, current.key]);

  return (
    <div className="page-flip-stage">
      <div
        key={current.key}
        className="page-flip-in"
        style={{ ["--flip-from" as string]: current.dir === "next" ? "6deg" : "-6deg" }}
      >
        {children}
      </div>
    </div>
  );
}
