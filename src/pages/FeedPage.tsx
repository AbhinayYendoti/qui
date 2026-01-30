import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PostCard } from '@/components/feed/PostCard';
import { CreatePostDialog } from '@/components/feed/CreatePostDialog';
import { RoomSidebar } from '@/components/feed/RoomSidebar';
import { RoomBadge } from '@/components/shared/RoomBadge';
import { MOOD_ROOMS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  room: string;
  created_at: string;
  profiles: {
    anonymous_id: string;
    color_index: number;
    shape_index: number;
  };
  reactions: Array<{
    type: string;
    user_id: string;
  }>;
}

export default function FeedPage() {
  const { room } = useParams<{ room?: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          room,
          created_at,
          user_id,
          reactions (
            type,
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (room && ['overthinking', 'social_anxiety', 'work_stress', 'lonely', 'small_wins', '2am_thoughts'].includes(room)) {
        query = query.eq('room', room as 'overthinking' | 'social_anxiety' | 'work_stress' | 'lonely' | 'small_wins' | '2am_thoughts');
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch profiles for each post
      const userIds = [...new Set((data || []).map(p => p.user_id))];
      
      let profilesMap: Record<string, { anonymous_id: string; color_index: number; shape_index: number }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, anonymous_id, color_index, shape_index')
          .in('user_id', userIds);
          
        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.user_id] = {
            anonymous_id: p.anonymous_id,
            color_index: p.color_index,
            shape_index: p.shape_index,
          };
          return acc;
        }, {} as Record<string, { anonymous_id: string; color_index: number; shape_index: number }>);
      }
      
      // Transform data to match expected shape
      const transformedPosts = (data || []).map(post => ({
        id: post.id,
        content: post.content,
        room: post.room,
        created_at: post.created_at,
        profiles: profilesMap[post.user_id] || { anonymous_id: 'Unknown', color_index: 1, shape_index: 1 },
        reactions: post.reactions || [],
      })) as Post[];
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Fetch posts error:', error);
    } finally {
      setLoading(false);
    }
  }, [room]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const currentRoom = room ? MOOD_ROOMS.find(r => r.id === room) : null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-10 overflow-hidden">
        <div className="flex gap-8">
          {/* Main Feed */}
          <div className="flex-1 min-w-0 max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="min-w-0 flex-1">
                {currentRoom ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">{currentRoom.icon}</span>
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl font-display font-semibold truncate">{currentRoom.label}</h1>
                      <p className="text-sm text-muted-foreground truncate">{currentRoom.description}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-xl sm:text-2xl font-display font-semibold">Everyone</h1>
                    <p className="text-sm text-muted-foreground">See what other Introji's are thinking</p>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <CreatePostDialog defaultRoom={room} onPostCreated={fetchPosts} />
              </div>
            </div>

            {/* Room Pills (Mobile) - contained scroll */}
            <div className="xl:hidden mb-4 -mx-4">
              <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
                <RoomBadge room="" showLabel />
                {MOOD_ROOMS.map((r) => (
                  <RoomBadge key={r.id} room={r.id} />
                ))}
              </div>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">
                  {currentRoom 
                    ? `Nobody's posted in ${currentRoom.label} yet.`
                    : 'Nobody\'s shared anything yet.'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Be the first. It's anonymous.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onReactionChange={fetchPosts}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <RoomSidebar />
        </div>
      </div>
    </AppLayout>
  );
}
