'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/this-week', label: 'This Week' },
  { href: '/events', label: 'Events' },
  { href: '/acts', label: 'Acts' },
  { href: '/venues', label: 'Venues' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-amber-400 hover:text-amber-300"
        >
          NOLA Music Tracker
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'text-amber-400'
                    : 'text-zinc-300 transition-colors hover:text-amber-400'
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
