import classNames from "classnames";
import { ReactNode } from "react";

export function Vertical({
  gap = false,
  center = false,
  ...p
}: {
  className: string;
  children: ReactNode;
  gap?: boolean;
  center?: boolean;
}) {
  return (
    <div
      className={classNames("flex flex-col justify-items-center", p.className, {
        "gap-4": gap,
        "justify-center": center,
      })}
    >
      {p.children}
    </div>
  );
}
