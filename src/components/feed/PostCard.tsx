import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { IdentityBadge } from '@/components/shared/IdentityBadge';
import { RoomBadge } from '@/components/shared/RoomBadge';
import { REACTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PostCardProps {
  post: {
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
  };
  onReactionChange?: () => void;
}

export function PostCard({ post, onReactionChange }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isReacting, setIsReacting] = useState(false);

  const reactionCounts = REACTIONS.map(r => ({
    ...r,
    count: post.reactions.filter(pr => pr.type === r.type).length,
    hasReacted: post.reactions.some(pr => pr.type === r.type && pr.user_id === user?.id),
  }));

  const handleReaction = async (type: string) => {
    if (!user) {
      toast({ title: "Please sign in to react", variant: "destructive" });
      return;
    }

    setIsReacting(true);

    try {
      const existingReaction = post.reactions.find(
        r => r.user_id === user.id
      );

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      } else {
        // Add reaction
        await supabase
          .from('reactions')
          .insert({
            post_id: post.id,
            user_id: user.id,
            type: type as 'i_relate' | 'heard_you' | 'sending_strength',
          });
      }

      onReactionChange?.();
    } catch (error) {
      console.error('Reaction error:', error);
      toast({ title: "Failed to react", variant: "destructive" });
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <article className="post-card animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <IdentityBadge 
            colorIndex={post.profiles.color_index} 
            shapeIndex={post.profiles.shape_index}
            size="sm"
          />
          <div>
            <p className="font-mono text-sm text-foreground">
              {post.profiles.anonymous_id}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <RoomBadge room={post.room} />
      </div>

      {/* Content */}
      <p className="text-foreground leading-relaxed mb-5">
        {post.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {reactionCounts.map((reaction) => (
          <Button
            key={reaction.type}
            variant="ghost"
            size="sm"
            disabled={isReacting}
            onClick={() => handleReaction(reaction.type)}
            className={cn(
              "gap-1.5 text-xs h-8 px-3 rounded-full border",
              reaction.hasReacted
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground border-border hover:text-foreground hover:border-border"
            )}
          >
            <span>{reaction.icon}</span>
            <span>{reaction.label}</span>
            {reaction.count > 0 && (
              <span className="ml-1 font-mono">{reaction.count}</span>
            )}
          </Button>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8 px-3 rounded-full border border-border text-muted-foreground hover:text-foreground ml-auto"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Talk</span>
        </Button>
      </div>
    </article>
  );
}
