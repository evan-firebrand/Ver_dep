import Link from 'next/link';

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
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/events"
            className="text-zinc-300 transition-colors hover:text-amber-400"
          >
            Events
          </Link>
          <Link
            href="/acts"
            className="text-zinc-300 transition-colors hover:text-amber-400"
          >
            Acts
          </Link>
          <Link
            href="/venues"
            className="text-zinc-300 transition-colors hover:text-amber-400"
          >
            Venues
          </Link>
        </div>
      </div>
    </nav>
  );
}
