"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

const PAGES = NAV.flatMap((group) => {
  return group.items;
});

/** Previous / next links in sidebar order, shown at the bottom of every page. */
export const Pager = () => {
  const pathname = usePathname();
  const index = PAGES.findIndex((item) => {
    return item.href === pathname;
  });
  if (index === -1) return null;
  const prev = PAGES[index - 1];
  const next = PAGES[index + 1];

  return (
    <nav className="pager" aria-label="Previous and next page">
      {prev && (
        <Link href={prev.href}>
          <small>Previous</small>
          {prev.label}
        </Link>
      )}
      {next && (
        <Link href={next.href} className="next">
          <small>Next</small>
          {next.label}
        </Link>
      )}
    </nav>
  );
};

export const Sidebar = () => {
  const pathname = usePathname();
  // Only matters below the mobile breakpoint; on desktop the nav is always shown.
  const [open, setOpen] = useState(false);

  return (
    <nav className="sidebar" aria-label="Documentation">
      <div className="sidebar-top">
        <Link href="/" className="sidebar-brand">
          ez<span>-</span>gform
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="sidebar-nav"
          onClick={() => {
            setOpen(!open);
          }}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <div
        id="sidebar-nav"
        className={open ? "sidebar-nav open" : "sidebar-nav"}
      >
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
                        onClick={() => {
                          setOpen(false);
                        }}
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
          GitHub
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
          </svg>
        </a>
      </div>
    </nav>
  );
};
