import Link from 'next/link';

import type { Act, ActType } from '@/lib/notion';

interface Props {
  act: Act;
  eventCount?: number;
}

const actTypeColors: Record<ActType, string> = {
  Band: 'bg-purple-900/60 text-purple-300',
  'Solo Artist': 'bg-blue-900/60 text-blue-300',
  'Brass Band': 'bg-amber-900/60 text-amber-300',
  DJ: 'bg-green-900/60 text-green-300',
  'Drag Performer': 'bg-pink-900/60 text-pink-300',
  'Orchestra / Ensemble': 'bg-indigo-900/60 text-indigo-300',
  'Choir / Gospel': 'bg-teal-900/60 text-teal-300',
  'Duo / Trio': 'bg-rose-900/60 text-rose-300',
};

export function ActCard({ act, eventCount }: Props) {
  return (
    <Link
      href={`/acts/${act.id}`}
      className="flex flex-col gap-3 rounded-lg border border-zinc-700 bg-zinc-800 p-4 transition-colors hover:border-amber-500/60 hover:bg-zinc-800/80"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base leading-snug font-semibold text-zinc-100">
          {act.name || 'Unknown Act'}
        </h3>
        {typeof eventCount === 'number' && eventCount > 0 && (
          <span className="shrink-0 rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
            {eventCount} {eventCount === 1 ? 'event' : 'events'}
          </span>
        )}
      </div>

      {act.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {act.genres.map((genre) => (
            <span
              key={genre}
              className="rounded-full bg-zinc-700/60 px-2 py-0.5 text-xs text-zinc-400"
            >
              {genre}
            </span>
          ))}
        </div>
      )}

      {act.actType && (
        <div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${actTypeColors[act.actType]}`}
          >
            {act.actType}
          </span>
        </div>
      )}
    </Link>
  );
}
