import { Navbar, useTheme } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";
import classNames from "classnames";

type NavLink = { path: string; name: string };

function LinkWrapper(p: {
  active?: boolean;
  disabled?: boolean;
  href: string;
  children?: ReactNode;
  className?: string;
}) {
  const theme = useTheme().theme.navbar.link;
  return (
    <li>
      <Link
        className={classNames(
          theme.base,
          {
            [theme.active.on]: p.active,
            [theme.active.off]: !p.active && !p.disabled,
          },
          theme.disabled[p.disabled ? "on" : "off"],
          p.className
        )}
        href={p.href}
      >
        {p.children}
      </Link>
    </li>
  );
}

function HeaderLayout(p: {
  subtitle?: ReactNode;
  title: ReactNode;
  links: NavLink[];
  rightpanel?: ReactNode;
}) {
  const router = useRouter();
  return (
    <Navbar
      className=" bg-slate-200 py-6 px-4 flex justify-between w-full"
      fluid={true}
      rounded={true}
    >
      <Navbar.Brand href="/">
        <span className="self-center whitespace-nowrap text-xl font-mono font-semibold dark:text-white">
          {p.title}
        </span>
        {p.subtitle && <span className="dark:text-white"> : {p.subtitle}</span>}
      </Navbar.Brand>
      {links.length > 0 && (
        <>
          <Navbar.Toggle />
          <Navbar.Collapse>
            {links.map((link, index) => {
              return (
                <LinkWrapper
                  key={index}
                  href={link.path}
                  active={router.asPath === link.path}
                >
                  {link.name}
                </LinkWrapper>
              );
            })}
          </Navbar.Collapse>
        </>
      )}
      {p.rightpanel}
    </Navbar>
  );
}

const links: NavLink[] = [];

export default function Header(p: {
  subtitle?: ReactNode;
  title: ReactNode;
  rightpanel?: ReactNode;
}) {
  return (
    <header>
      <HeaderLayout
        subtitle={p.subtitle}
        title={p.title}
        links={links}
        rightpanel={p.rightpanel}
      />
    </header>
  );
}
