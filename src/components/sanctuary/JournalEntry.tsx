import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface JournalEntryProps {
  entry: {
    id: string;
    content: string;
    mood: string | null;
    created_at: string;
  };
  onClick?: () => void;
}

const moodEmojis: Record<string, string> = {
  'peaceful': '🌿',
  'anxious': '😰',
  'hopeful': '✨',
  'tired': '😴',
  'grateful': '🙏',
  'lonely': '🌙',
  'content': '😌',
  'overwhelmed': '🌊',
};

export function JournalEntry({ entry, onClick }: JournalEntryProps) {
  const moodEmoji = entry.mood ? moodEmojis[entry.mood] || '📝' : '📝';
  
  return (
    <button
      onClick={onClick}
      className="w-full text-left sanctuary-card hover:bg-card/80 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{moodEmoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {entry.mood && (
              <span className="text-sm font-medium text-sanctuary capitalize">
                Feeling {entry.mood}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {format(new Date(entry.created_at), 'MMM d')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {entry.content}
          </p>
        </div>
      </div>
    </button>
  );
}
