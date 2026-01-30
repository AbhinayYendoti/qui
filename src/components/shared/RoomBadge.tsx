import { cn } from '@/lib/utils';
import { MOOD_ROOMS } from '@/lib/constants';

interface RoomBadgeProps {
  room: string;
  showLabel?: boolean;
  className?: string;
}

const roomColorClasses: Record<string, string> = {
  'overthinking': 'bg-room-overthinking/20 text-room-overthinking border-room-overthinking/30',
  'social_anxiety': 'bg-room-anxiety/20 text-room-anxiety border-room-anxiety/30',
  'work_stress': 'bg-room-stress/20 text-room-stress border-room-stress/30',
  'lonely': 'bg-room-lonely/20 text-room-lonely border-room-lonely/30',
  'small_wins': 'bg-room-wins/20 text-room-wins border-room-wins/30',
  '2am_thoughts': 'bg-room-2am/20 text-room-2am border-room-2am/30',
};

export function RoomBadge({ room, showLabel = true, className }: RoomBadgeProps) {
  const roomData = MOOD_ROOMS.find(r => r.id === room);
  
  if (!roomData) return null;

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        roomColorClasses[room] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      <span>{roomData.icon}</span>
      {showLabel && <span>{roomData.label}</span>}
    </span>
  );
}
