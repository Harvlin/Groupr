import type { ContributionCategory, CategoryBreakdown } from '@/types';

const categoryLabels: Record<ContributionCategory, string> = {
  research: 'Research',
  core_writing: 'Core writing',
  editing: 'Editing',
  design: 'Design',
  coding: 'Coding',
  coordination: 'Coordination',
};

interface CategoryChartProps {
  data: CategoryBreakdown[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const sorted = [...data].sort((a, b) => b.percentage - a.percentage);
  const max = Math.max(...sorted.map((d) => d.percentage));

  return (
    <div className="space-y-4">
      {sorted.map((item, index) => (
        <div key={item.category} className="group">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-text-primary">
              {categoryLabels[item.category]}
            </span>
            <span className="font-semibold text-text-primary">
              {item.percentage}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full transition-all duration-700 ease-wise"
              style={{
                width: `${(item.percentage / max) * 100}%`,
                backgroundColor: index === 0 ? '#9FE870' : '#ECF9F9',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
