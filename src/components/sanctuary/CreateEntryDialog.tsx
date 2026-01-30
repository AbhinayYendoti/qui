import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

const moods = [
  { id: 'peaceful', emoji: '🌿', label: 'Peaceful' },
  { id: 'anxious', emoji: '😰', label: 'Anxious' },
  { id: 'hopeful', emoji: '✨', label: 'Hopeful' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful' },
  { id: 'lonely', emoji: '🌙', label: 'Lonely' },
  { id: 'content', emoji: '😌', label: 'Content' },
  { id: 'overwhelmed', emoji: '🌊', label: 'Overwhelmed' },
];

const entrySchema = z.object({
  content: z.string().min(1, "Write something").max(2000, "Keep it under 2000 characters"),
  mood: z.string().optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

interface CreateEntryDialogProps {
  onEntryCreated?: () => void;
}

export function CreateEntryDialog({ onEntryCreated }: CreateEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      content: '',
      mood: '',
    },
  });

  const selectedMood = watch('mood');
  const content = watch('content');

  const onSubmit = async (data: EntryFormData) => {
    if (!user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('sanctuary_entries')
        .insert({
          user_id: user.id,
          content: data.content.trim(),
          mood: data.mood || null,
        });

      if (error) throw error;

      toast({ title: "Entry saved to your sanctuary" });
      reset();
      setOpen(false);
      onEntryCreated?.();
    } catch (error) {
      console.error('Entry error:', error);
      toast({ title: "Failed to save entry", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Write Something
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Just for you</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Mood Selection */}
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">How are you right now?</label>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setValue('mood', selectedMood === mood.id ? '' : mood.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all",
                    selectedMood === mood.id
                      ? "border-sanctuary bg-sanctuary/10 text-sanctuary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  <span>{mood.emoji}</span>
                  <span>{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Textarea
              {...register('content')}
              placeholder="Let it out. No one reads this but you."
              className="min-h-40 resize-none bg-input border-border"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.content ? (
                <span className="text-destructive">{errors.content.message}</span>
              ) : (
                <span>This stays between you and you</span>
              )}
              <span className={cn(content.length > 1800 && "text-destructive")}>
                {content.length}/2000
              </span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save to Sanctuary'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
