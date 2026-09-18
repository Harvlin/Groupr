import type { TimeBucket } from '@/types';

interface BucketTimelineProps {
  buckets: Record<TimeBucket, number>;
}

const labels: Record<TimeBucket, string> = {
  early: 'Early',
  middle: 'Middle',
  late: 'Late',
};

export function BucketTimeline({ buckets }: BucketTimelineProps) {
  const entries = Object.entries(buckets) as [TimeBucket, number][];
  const max = Math.max(...entries.map(([, value]) => value));

  return (
    <div className="flex items-end justify-between gap-2 lg:gap-4">
      {entries.map(([bucket, value]) => {
        const heightPercent = max > 0 ? (value / max) * 100 : 0;
        return (
          <div key={bucket} className="flex flex-1 flex-col items-center gap-3">
            <div className="relative flex w-full items-end justify-center rounded-t-card bg-surface-muted" style={{ height: '140px' }}>
              <div
                className="w-full rounded-t-card bg-surface-forest transition-all duration-700 ease-wise"
                style={{ height: `${heightPercent}%` }}
              />
              <span className="absolute bottom-2 text-xs font-bold text-accent-lime">
                {value}
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">{labels[bucket]}</p>
              <p className="text-xs text-text-tertiary">phase</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
