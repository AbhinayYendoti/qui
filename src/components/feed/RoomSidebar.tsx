import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MOOD_ROOMS } from '@/lib/constants';

export function RoomSidebar() {
  const navigate = useNavigate();
  const { room } = useParams();

  return (
    <aside className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Mood Rooms</h3>
          <div className="space-y-1">
            <button
              onClick={() => navigate('/feed')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                !room
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <span>🌐</span>
              <span>All Rooms</span>
            </button>
            
            {MOOD_ROOMS.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/room/${r.id}`)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  room === r.id
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Each room is a safe space for specific feelings. 
            Share freely. All Introji's are listening.
          </p>
        </div>
      </div>
    </aside>
  );
}
