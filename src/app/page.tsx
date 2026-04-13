import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-4 text-sm font-semibold tracking-widest text-amber-400 uppercase">
          New Orleans
        </p>
        <h1 className="mb-6 max-w-2xl text-5xl font-bold tracking-tight text-zinc-50 sm:text-6xl">
          NOLA Music Tracker
        </h1>
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-zinc-400">
          Live music, festivals, second lines, and events happening across New
          Orleans — all in one place.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/events"
            className="rounded-full bg-amber-500 px-8 py-3 text-base font-semibold text-zinc-900 transition-colors hover:bg-amber-400"
          >
            Browse Events
          </Link>
          <Link
            href="/venues"
            className="rounded-full border border-zinc-600 px-8 py-3 text-base font-semibold text-zinc-300 transition-colors hover:border-zinc-400 hover:text-zinc-100"
          >
            Browse Venues
          </Link>
        </div>
      </section>

      {/* What's tracked */}
      <section className="border-t border-zinc-800 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-sm font-semibold tracking-widest text-zinc-500 uppercase">
            What we track
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {[
              'Live Music',
              'Festivals',
              'Second Lines',
              'Parades',
              'Community Events',
            ].map((type) => (
              <div
                key={type}
                className="rounded-lg border border-zinc-800 bg-zinc-800/40 px-4 py-3 text-center text-sm text-zinc-400"
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="border-t border-zinc-800 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-sm font-semibold tracking-widest text-zinc-500 uppercase">
            Neighborhoods
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Frenchmen Street',
              'French Quarter',
              'Marigny',
              'Bywater',
              'Treme',
              'Uptown',
              'CBD / Warehouse',
              'Mid-City',
              'Garden District',
              'Gentilly',
            ].map((n) => (
              <span
                key={n}
                className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-500"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
