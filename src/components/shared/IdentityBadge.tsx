import { cn } from '@/lib/utils';

interface IdentityBadgeProps {
  colorIndex: number;
  shapeIndex: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const shapes = [
  // Prism - triangle
  <polygon key="prism" points="12,2 22,20 2,20" fill="currentColor" />,
  // Sphere - circle
  <circle key="sphere" cx="12" cy="12" r="10" fill="currentColor" />,
  // Node - diamond
  <polygon key="node" points="12,2 22,12 12,22 2,12" fill="currentColor" />,
  // Cube - square
  <rect key="cube" x="3" y="3" width="18" height="18" rx="2" fill="currentColor" />,
  // Helix - hexagon
  <polygon key="helix" points="12,2 21,7 21,17 12,22 3,17 3,7" fill="currentColor" />,
  // Wave - rounded triangle
  <path key="wave" d="M12 2 C18 8, 22 14, 20 20 L4 20 C2 14, 6 8, 12 2" fill="currentColor" />,
];

const colorClasses = [
  'text-identity-1',
  'text-identity-2',
  'text-identity-3',
  'text-identity-4',
  'text-identity-5',
  'text-identity-6',
];

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

export function IdentityBadge({ colorIndex, shapeIndex, size = 'md', className }: IdentityBadgeProps) {
  const colorClass = colorClasses[(colorIndex - 1) % colorClasses.length];
  const shape = shapes[(shapeIndex - 1) % shapes.length];

  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-lg bg-card border border-border",
        sizeClasses[size],
        className
      )}
    >
      <svg 
        viewBox="0 0 24 24" 
        className={cn("w-1/2 h-1/2", colorClass)}
      >
        {shape}
      </svg>
    </div>
  );
}
