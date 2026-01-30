import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MOOD_ROOMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const postSchema = z.object({
  content: z.string().min(1, "Share something").max(500, "Keep it under 500 characters"),
  room: z.string().min(1, "Select a room"),
});

type PostFormData = z.infer<typeof postSchema>;

interface CreatePostDialogProps {
  defaultRoom?: string;
  onPostCreated?: () => void;
}

export function CreatePostDialog({ defaultRoom, onPostCreated }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      room: defaultRoom || '',
    },
  });

  const selectedRoom = watch('room');
  const content = watch('content');

  const onSubmit = async (data: PostFormData) => {
    if (!user) {
      toast({ title: "Please sign in to post", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: data.content.trim(),
          room: data.room as 'overthinking' | 'social_anxiety' | 'work_stress' | 'lonely' | 'small_wins' | '2am_thoughts',
        });

      if (error) throw error;

      toast({ title: "Your thought was shared" });
      reset();
      setOpen(false);
      onPostCreated?.();
    } catch (error) {
      console.error('Post error:', error);
      toast({ title: "Failed to share your thought", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Drop a Thought
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>What's on your mind?</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Room Selection */}
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">Pick a room</label>
            <div className="grid grid-cols-2 gap-2">
              {MOOD_ROOMS.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setValue('room', room.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border text-left transition-all",
                    selectedRoom === room.id
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  <span className="text-lg">{room.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{room.label}</p>
                  </div>
                </button>
              ))}
            </div>
            {errors.room && (
              <p className="text-xs text-destructive">{errors.room.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Textarea
              {...register('content')}
              placeholder="You can say it here. No one's judging."
              className="min-h-32 resize-none bg-input border-border"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.content ? (
                <span className="text-destructive">{errors.content.message}</span>
              ) : (
                <span>Posted anonymously</span>
              )}
              <span className={cn(content.length > 450 && "text-destructive")}>
                {content.length}/500
              </span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Anonymously'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
