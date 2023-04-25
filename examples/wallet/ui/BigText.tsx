import { ReactNode } from "react";

export function BigText(p: { children: ReactNode }) {
  return <div className="text-4xl">{p.children}</div>;
}
