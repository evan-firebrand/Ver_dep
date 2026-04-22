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
  return pathname === href || pathname.startsWith(`${href}/`);
}

const WRAPPER_CLASSES = 'flex items-center gap-5 text-sm font-medium';
const INACTIVE_CLASSES = 'text-zinc-300 transition-colors hover:text-amber-400';
const ACTIVE_CLASSES = 'text-amber-400';

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className={WRAPPER_CLASSES}>
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={active ? ACTIVE_CLASSES : INACTIVE_CLASSES}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Server-renderable fallback with the same shape as NavLinks but no active
 * state. Used while NavLinks is waiting for client-side hydration under
 * Cache Components.
 */
export function NavLinksFallback() {
  return (
    <div className={WRAPPER_CLASSES}>
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className={INACTIVE_CLASSES}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}
