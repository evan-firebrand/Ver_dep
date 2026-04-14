import type { Genre } from '@/lib/supabase';

interface Props {
  name: string;
  genres?: Genre[];
}

export function ActBadge({ name, genres = [] }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-700 px-3 py-1 text-sm">
      <span className="font-medium text-zinc-100">{name}</span>
      {genres.length > 0 && (
        <>
          <span className="text-zinc-500">·</span>
          <span className="text-xs text-zinc-400">{genres[0]}</span>
        </>
      )}
    </span>
  );
}
