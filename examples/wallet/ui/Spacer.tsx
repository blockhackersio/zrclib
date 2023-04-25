import classNames from "classnames";

// import { InjectedConnector } from "wagmi/connectors/injected";
export function Spacer({
  // children,
  space = "small",
}: {
  // children: ReactNode;
  space: "small" | "medium" | "large";
}) {
  // const hClass = "h-1";
  return (
    <div
      className={classNames({
        "h-4": space === "small",
        "h-6": space === "medium",
        "h-10": space === "large",
      })}
    />
  );
}
