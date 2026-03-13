import { cn } from "@/lib/utils";

interface TrendPillProps {
  direction: 'up' | 'down' | 'flat';
  value: string;
  className?: string;
}

const directionConfig = {
  up: {
    prefix: '↑',
    bg: 'bg-growth-green/10',
    text: 'text-growth-green',
  },
  down: {
    prefix: '↓',
    bg: 'bg-terra-red/10',
    text: 'text-terra-red',
  },
  flat: {
    prefix: '→',
    bg: 'bg-stone-gray/10',
    text: 'text-stone-gray',
  },
};

const TrendPill = ({ direction, value, className }: TrendPillProps) => {
  const config = directionConfig[direction];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-body font-semibold text-[13px]",
        config.bg,
        config.text,
        className
      )}
    >
      {config.prefix} {value}
    </span>
  );
};

export default TrendPill;
