import { FC, ReactNode, createContext, useContext } from "react";

export const LayoutContext = createContext<FC<LayoutProps>>(PlainLayout);

export function useLayoutTemplate() {
  return useContext(LayoutContext);
}

export function PlainLayout(p: LayoutProps) {
  return (
    <div>
      {p.header && <div>{p.header}</div>}
      {p.body && <div>{p.body}</div>}
      {p.footer && <div>{p.footer}</div>}
    </div>
  );
}

export type LayoutProps = {
  header?: ReactNode;
  body?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};
