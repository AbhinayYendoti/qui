import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { IdentityBadge } from '@/components/shared/IdentityBadge';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 lg:py-10">
        <h1 className="text-2xl font-display font-semibold mb-8">Your Identity</h1>

        {profile && (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-4 mb-6">
                <IdentityBadge 
                  colorIndex={profile.color_index} 
                  shapeIndex={profile.shape_index}
                  size="lg"
                />
                <div>
                  <h2 className="font-mono text-xl text-foreground">{profile.anonymous_id}</h2>
                  <p className="text-sm text-muted-foreground">Your Introji identity</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Identity protected</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {format(new Date(profile.created_at), 'MMM yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-card/50 rounded-xl p-5 border border-border">
              <h3 className="text-sm font-medium text-foreground mb-3">How This Works</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Your shape and color are random. You didn't choose them.</li>
                <li>• No one sees your email. Ever.</li>
                <li>• Your journal is 100% private.</li>
                <li>• Posts are anonymous but tied to your Introji shape.</li>
              </ul>
            </div>

            {/* Sign Out */}
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
