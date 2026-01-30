import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { BarChart2, Clock, MessageCircle, BookOpen, Sparkles } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface PatternData {
  totalPosts: number;
  totalEntries: number;
  totalSessions: number;
  topRooms: Array<{ room: string; count: number }>;
  recentMoods: string[];
  activeHours: number[];
}

export default function PatternsPage() {
  const { user, profile } = useAuth();
  const [patterns, setPatterns] = useState<PatternData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchPatterns = async () => {
      try {
        // Fetch posts
        const { data: posts } = await supabase
          .from('posts')
          .select('room, created_at')
          .eq('user_id', user.id);

        // Fetch entries
        const { data: entries } = await supabase
          .from('sanctuary_entries')
          .select('mood, created_at')
          .eq('user_id', user.id);

        // Fetch chat sessions
        const { data: sessions } = await supabase
          .from('chat_sessions')
          .select('id')
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

        // Calculate patterns
        const roomCounts: Record<string, number> = {};
        const hourCounts: number[] = new Array(24).fill(0);

        (posts || []).forEach(post => {
          roomCounts[post.room] = (roomCounts[post.room] || 0) + 1;
          const hour = new Date(post.created_at).getHours();
          hourCounts[hour]++;
        });

        (entries || []).forEach(entry => {
          const hour = new Date(entry.created_at).getHours();
          hourCounts[hour]++;
        });

        const topRooms = Object.entries(roomCounts)
          .map(([room, count]) => ({ room, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        const recentMoods = (entries || [])
          .filter(e => e.mood)
          .slice(0, 5)
          .map(e => e.mood as string);

        setPatterns({
          totalPosts: posts?.length || 0,
          totalEntries: entries?.length || 0,
          totalSessions: sessions?.length || 0,
          topRooms,
          recentMoods,
          activeHours: hourCounts,
        });
      } catch (error) {
        console.error('Fetch patterns error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
  }, [user]);

  const getMostActiveTime = () => {
    if (!patterns) return null;
    const maxHour = patterns.activeHours.indexOf(Math.max(...patterns.activeHours));
    if (maxHour >= 22 || maxHour <= 4) return "late nights";
    if (maxHour >= 5 && maxHour <= 11) return "mornings";
    if (maxHour >= 12 && maxHour <= 17) return "afternoons";
    return "evenings";
  };

  const roomLabels: Record<string, string> = {
    'overthinking': 'Overthinking',
    'social_anxiety': 'Social Anxiety',
    'work_stress': 'Work Stress',
    'lonely': 'Lonely',
    'small_wins': 'Small Wins',
    '2am_thoughts': '2AM Thoughts',
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-display font-semibold flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-primary" />
            Your Quiet Patterns
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Private insights about your journey</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : patterns ? (
          <div className="space-y-6">
            {/* Insights */}
            <div className="space-y-4">
              {getMostActiveTime() && (
                <div className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Insight</p>
                      <p className="text-foreground">
                        You are most active during <span className="text-primary font-medium">{getMostActiveTime()}</span>. 
                        {getMostActiveTime() === "late nights" && " The quiet hours seem to be your most expressive time."}
                        {getMostActiveTime() === "mornings" && " You find peace in the early hours."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {patterns.topRooms.length > 0 && (
                <div className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Insight</p>
                      <p className="text-foreground">
                        You engage mostly with{' '}
                        {patterns.topRooms.map((r, i) => (
                          <span key={r.room}>
                            <span className="text-primary font-medium">{roomLabels[r.room]}</span>
                            {i < patterns.topRooms.length - 1 && (i === patterns.topRooms.length - 2 ? ' and ' : ', ')}
                          </span>
                        ))}
                        {' '}rooms. These spaces align with your current reflective state.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {patterns.totalEntries > 3 && (
                <div className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-sanctuary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-sanctuary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Insight</p>
                      <p className="text-foreground">
                        You've written <span className="text-sanctuary font-medium">{patterns.totalEntries} journal entries</span>. 
                        Regular reflection is a sign of emotional intelligence.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="mt-8">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">This month, you...</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-5 border border-border text-center">
                  <p className="text-3xl font-display font-semibold text-foreground">{patterns.totalSessions}</p>
                  <p className="text-xs text-muted-foreground mt-1">Conversations</p>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border text-center">
                  <p className="text-3xl font-display font-semibold text-foreground">{patterns.totalEntries}</p>
                  <p className="text-xs text-muted-foreground mt-1">Journal entries</p>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border text-center">
                  <p className="text-3xl font-display font-semibold text-foreground">{patterns.totalPosts}</p>
                  <p className="text-xs text-muted-foreground mt-1">Shared posts</p>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border text-center">
                  <p className="text-3xl font-display font-semibold text-foreground">{patterns.topRooms.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Rooms visited</p>
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <p className="text-xs text-center text-muted-foreground mt-8 py-4 border-t border-border">
              Data is private to you. No charts. Just human insights.
            </p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Start using the app to see your patterns emerge.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
