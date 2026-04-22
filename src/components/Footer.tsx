export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-zinc-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          NOLA Music Tracker — live music, festivals, second lines, and events
          across New Orleans.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-xs text-zinc-600">
            Event data refreshed hourly
          </span>
          <a
            href="https://github.com/evan-firebrand/ver_dep/issues/new?labels=event-submission&title=Submit+an+event"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-300"
          >
            Submit an event ↗
          </a>
          <a
            href="https://github.com/evan-firebrand/ver_dep"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-300"
          >
            Source ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
