import Link from 'next/link';

import type { Genre } from '@/lib/supabase';

interface Props {
  /** Act id. When provided, the badge links to /acts/[id]. */
  id?: string;
  name: string;
  genres?: Genre[];
}

const BASE_CLASSES =
  'inline-flex items-center gap-1.5 rounded-full bg-zinc-700 px-3 py-1 text-sm transition-colors';

export function ActBadge({ id, name, genres = [] }: Props) {
  const content = (
    <>
      <span className="font-medium text-zinc-100">{name}</span>
      {genres.length > 0 && (
        <>
          <span className="text-zinc-500">·</span>
          <span className="text-xs text-zinc-400">{genres[0]}</span>
        </>
      )}
    </>
  );

  if (id) {
    return (
      <Link
        href={`/acts/${id}`}
        className={`${BASE_CLASSES} hover:bg-zinc-600`}
      >
        {content}
      </Link>
    );
  }

  return <span className={BASE_CLASSES}>{content}</span>;
}
