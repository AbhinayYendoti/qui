import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { INTERESTS, GUIDED_PROMPTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Loader2, X, MessageCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type MatchingStep = 'select' | 'searching' | 'matched' | 'prompting' | 'chatting';

interface MatchedUser {
  anonymous_id: string;
  color_index: number;
  shape_index: number;
}

export default function ConnectPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<MatchingStep>('select');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);
  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  const moods = [
    { id: 'reflective', label: 'Reflective', emoji: '🌙' },
    { id: 'overwhelmed', label: 'Overwhelmed', emoji: '🌊' },
    { id: 'hopeful', label: 'Hopeful', emoji: '✨' },
    { id: 'curious', label: 'Curious', emoji: '🔮' },
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const startMatching = async () => {
    if (!user || !selectedMood || selectedInterests.length === 0) return;

    setStep('searching');
    
    try {
      // Add to matching queue
      const { error } = await supabase
        .from('matching_queue')
        .upsert({
          user_id: user.id,
          mood: selectedMood,
          interests: selectedInterests,
        });

      if (error) throw error;

      // Simulate search with progress
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setSearchProgress(i);
      }

      // For demo, just show the UI flow
      // In production, this would poll for matches or use realtime
      setTimeout(() => {
        toast({
          title: "Matching in progress",
          description: "We'll notify you when another Introji is found.",
        });
        setStep('select');
        setSearchProgress(0);
      }, 2000);

    } catch (error) {
      console.error('Matching error:', error);
      toast({ title: "Failed to start matching", variant: "destructive" });
      setStep('select');
    }
  };

  const cancelMatching = async () => {
    if (!user) return;

    try {
      await supabase
        .from('matching_queue')
        .delete()
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Cancel error:', error);
    }

    setStep('select');
    setSearchProgress(0);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 lg:py-10">
        {step === 'select' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-semibold">Talk to Another Introji</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                We skip the awkward "hi." You both answer the same prompts first. Then you talk.
              </p>
            </div>

            {/* Mood Selection */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">How are you feeling right now?</label>
              <div className="grid grid-cols-2 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                      selectedMood === mood.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Selection */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">
                Pick up to 5 interests (helps us find someone compatible)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-all capitalize",
                      selectedInterests.includes(interest)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedInterests.length}/5 selected
              </p>
            </div>

            {/* Start Button */}
            <Button
              onClick={startMatching}
              disabled={!selectedMood || selectedInterests.length === 0}
              className="w-full h-12"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Find an Introji Like Me
            </Button>

            {/* How it works */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-4">How this works</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 text-xs font-mono">1</span>
                  <span>We find another Introji in a similar mood who shares your interests</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 text-xs font-mono">2</span>
                  <span>You both answer 5 prompts—no awkward opener needed</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 text-xs font-mono">3</span>
                  <span>A 20-minute chat opens. Take your time.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 text-xs font-mono">4</span>
                  <span>Want to talk again? Exchange a reconnect code.</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {step === 'searching' && (
          <div className="text-center py-20 animate-fade-in">
            <div className="match-scanner w-32 h-32 mx-auto mb-8 rounded-2xl bg-card border border-border flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
            
            <h2 className="text-xl font-display font-semibold mb-2">Looking for another Introji...</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Finding an Introji who gets it.
            </p>

            <div className="max-w-xs mx-auto space-y-4">
              <div className="bg-card rounded-xl p-4 border border-border text-left">
                <p className="text-xs font-mono text-muted-foreground mb-2">WHAT'S HAPPENING</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className={searchProgress > 10 ? 'text-foreground' : ''}>
                    Checking who's around...
                  </li>
                  <li className={searchProgress > 30 ? 'text-foreground' : ''}>
                    Looking for: [{selectedInterests.slice(0, 2).join(', ')}]
                  </li>
                  <li className={searchProgress > 50 ? 'text-foreground' : ''}>
                    Making sure they're real
                  </li>
                  <li className={searchProgress > 70 ? 'text-foreground' : ''}>
                    Finding the right vibe
                  </li>
                  <li className={searchProgress > 90 ? 'text-foreground' : ''}>
                    Almost there...
                  </li>
                </ul>
              </div>

              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${searchProgress}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Good matches take a moment
              </p>

              <Button
                variant="outline"
                onClick={cancelMatching}
                className="mt-4"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Matching
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
