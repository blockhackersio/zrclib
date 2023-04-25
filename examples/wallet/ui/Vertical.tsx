import classNames from "classnames";
import { ReactNode } from "react";

export function Vertical({
  gap,
  ...p
}: {
  children: ReactNode;
  gap?: boolean;
}) {
  return (
    <div
      className={classNames("flex flex-col  justify-items-center", {
        "gap-4": gap,
      })}
      {...p}
    />
  );
}
