import { ReactNode } from "react";

export function LittleText(p: { children: ReactNode }) {
  return <div className="text-sm">{p.children}</div>;
}
