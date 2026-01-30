import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { JournalEntry } from '@/components/sanctuary/JournalEntry';
import { CreateEntryDialog } from '@/components/sanctuary/CreateEntryDialog';
import { Loader2, BookOpen, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface Entry {
  id: string;
  content: string;
  mood: string | null;
  created_at: string;
}

export default function SanctuaryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('sanctuary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Fetch entries error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const totalEntries = entries.length;
  const moodCounts = entries.reduce((acc, entry) => {
    if (entry.mood) {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-semibold flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              Sanctuary
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Your space. Nobody else's.</p>
          </div>
          <CreateEntryDialog onEntryCreated={fetchEntries} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-3xl font-display font-semibold text-foreground">{totalEntries}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Entries</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-3xl font-display font-semibold text-sanctuary">
              {Object.keys(moodCounts).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Moods Tracked</p>
          </div>
          {topMood && (
            <div className="bg-card rounded-xl p-4 border border-border col-span-2">
              <p className="text-lg font-medium text-foreground capitalize">{topMood[0]}</p>
              <p className="text-xs text-muted-foreground mt-1">Your most common mood ({topMood[1]} times)</p>
            </div>
          )}
        </div>

        {/* Entries */}
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Recent Entries</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Nothing here yet.</p>
              <p className="text-sm text-muted-foreground">
                When you're ready, write something. Just for you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <JournalEntry key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
