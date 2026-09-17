"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    title: "Start here",
    items: [
      { href: "/", label: "Overview" },
      { href: "/getting-started", label: "Getting started" },
      { href: "/playground", label: "Playground" },
    ],
  },
  {
    title: "Guides",
    items: [
      { href: "/guides/finding-your-form", label: "Finding your form" },
      { href: "/guides/question-types", label: "Question types" },
    ],
  },
  {
    title: "Packages",
    items: [
      { href: "/packages/core", label: "@ez-gform/core" },
      { href: "/packages/react", label: "@ez-gform/react" },
      { href: "/packages/codegen", label: "@ez-gform/codegen" },
      { href: "/packages/cli", label: "@ez-gform/cli" },
    ],
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <nav className="sidebar" aria-label="Documentation">
      <Link href="/" className="sidebar-brand">
        ez-gform
      </Link>
      {NAV.map((group) => {
        return (
          <div className="sidebar-group" key={group.title}>
            <p className="sidebar-group-title">{group.title}</p>
            <ul>
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={
                        active ? "sidebar-link active" : "sidebar-link"
                      }
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <a
        className="sidebar-external"
        href="https://github.com/webadeva/ez-gform"
        target="_blank"
        rel="noreferrer"
      >
        GitHub ↗
      </a>
    </nav>
  );
};
