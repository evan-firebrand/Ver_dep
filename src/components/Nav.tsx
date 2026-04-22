import Link from 'next/link';
import { Suspense } from 'react';

import { NavLinks, NavLinksFallback } from './NavLinks';

export function Nav() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-amber-400 hover:text-amber-300"
        >
          NOLA Music Tracker
        </Link>
        <Suspense fallback={<NavLinksFallback />}>
          <NavLinks />
        </Suspense>
      </div>
    </nav>
  );
}
