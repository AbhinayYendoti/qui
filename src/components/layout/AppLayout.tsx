import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, BookOpen, BarChart2, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { IdentityBadge } from '@/components/shared/IdentityBadge';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/feed', label: 'Feed', icon: Home },
  { path: '/connect', label: 'Connect', icon: MessageCircle },
  { path: '/sanctuary', label: 'Sanctuary', icon: BookOpen },
  { path: '/patterns', label: 'Patterns', icon: BarChart2 },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 border-r border-border bg-sidebar p-6 fixed h-full">
        <div className="mb-10">
          <h1 className="text-xl font-display font-semibold text-foreground">IntrovertChatter</h1>
          <p className="text-xs text-muted-foreground mt-1">A sanctuary for the quiet ones</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/feed' && location.pathname.startsWith('/room'));
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-border mt-6">
          {profile && (
            <div className="flex items-center gap-3 mb-4">
              <IdentityBadge 
                colorIndex={profile.color_index} 
                shapeIndex={profile.shape_index} 
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-foreground truncate">
                  {profile.anonymous_id}
                </p>
                <p className="text-xs text-muted-foreground">Anonymous</p>
              </div>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 xl:ml-72">
        <div className="min-h-screen pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/feed' && location.pathname.startsWith('/room'));
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
              location.pathname === '/profile' 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">You</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
