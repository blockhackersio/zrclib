import { Button as FbButton, ButtonProps } from "flowbite-react";

export function Button(p: ButtonProps) {
  return <FbButton className="active:scale-95" {...p} />;
}

export function IconButton(p: ButtonProps) {
  return <FbButton className="active:scale-95" {...p} />;
}
