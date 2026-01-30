import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Shield, MessageCircle, BookOpen, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/feed');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 py-20 lg:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            No profiles. No followers. No algorithms.
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-foreground leading-tight mb-6">
            You're not broken.<br />You're an introvert.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
            See what other Introji's actually think at 2am. Skip the small talk. 
            Talk when you're ready—or just listen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="h-12 px-8 text-base"
            >
              Enter Without a Profile
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="h-12 px-8 text-base"
            >
              I have a reconnect code
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-display font-medium text-foreground mb-2">No Profile. Ever.</h3>
            <p className="text-sm text-muted-foreground">
              You get a random shape. That's it. No bio to craft. No photo to choose. No followers to count.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-display font-medium text-foreground mb-2">No Awkward "Hi"</h3>
            <p className="text-sm text-muted-foreground">
              We give you both the same prompts. You answer. Then you talk. The hard part is already done.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-display font-medium text-foreground mb-2">A Place to Think</h3>
            <p className="text-sm text-muted-foreground">
              Your private journal. No one reads it. Just you and your thoughts, with patterns that emerge over time.
            </p>
          </div>
        </div>
      </div>

      {/* Mood Rooms Preview */}
      <div className="max-w-5xl mx-auto px-4 py-20 border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-4">
            Rooms for How You Actually Feel
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            No one's pretending to be happy here. Pick a room. Read what other Introji's are going through. Or just sit quietly.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { emoji: '🌀', label: 'Overthinking', color: 'bg-card border-border' },
            { emoji: '🫣', label: 'Social Anxiety', color: 'bg-card border-border' },
            { emoji: '💼', label: 'Work Stress', color: 'bg-card border-border' },
            { emoji: '🌙', label: 'Lonely', color: 'bg-card border-border' },
            { emoji: '✨', label: 'Small Wins', color: 'bg-card border-border' },
            { emoji: '🌌', label: '2AM Thoughts', color: 'bg-card border-border' },
          ].map((room) => (
            <div 
              key={room.label}
              className={`rounded-xl p-5 border ${room.color} text-center`}
            >
              <span className="text-3xl mb-2 block">{room.emoji}</span>
              <span className="text-sm font-medium text-foreground">{room.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-4">
          You don't have to be "on" here.
        </h2>
        <p className="text-muted-foreground mb-8">
          Cancel plans and feel relieved? Prefer texting over calling? You'll fit right in.
        </p>
        <Button 
          size="lg"
          onClick={() => navigate('/auth')}
          className="h-12 px-8 text-base"
        >
          Enter Anonymously
        </Button>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            IntrovertChatter · For Introji's who'd rather listen.
          </p>
        </div>
      </footer>
    </div>
  );
}
