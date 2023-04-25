import { Button } from "@/ui/Button";
import { Horizontal } from "@/ui/Horizontal";
import { Vertical } from "@/ui/Vertical";
import { ReactNode } from "react";
import { IconType } from "react-icons";
import Link from "next/link";

export function WalletActionButton({
  icon: Icon,
  title,
  label,
  href,
}: {
  href: string;
  icon: IconType;
  title: string;
  label: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link href={href} title={title}>
      <Vertical>
        <Horizontal>
          <Icon size="30" />
        </Horizontal>
        <Horizontal>{label}</Horizontal>
      </Vertical>
    </Link>
  );
}
