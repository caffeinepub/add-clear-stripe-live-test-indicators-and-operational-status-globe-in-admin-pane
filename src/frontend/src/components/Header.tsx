import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, X, BarChart3, Shield } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentStep: 'hero' | 'interview' | 'recommendations' | 'jobs' | 'dashboard' | 'admin';
  onStepChange: (step: 'hero' | 'interview' | 'recommendations' | 'jobs' | 'dashboard' | 'admin') => void;
  isAdmin?: boolean;
}

export default function Header({ currentStep, onStepChange, isAdmin = false }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      onStepChange('hero');
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const steps = [
    { id: 'interview' as const, label: 'AI Interview', number: 1 },
    { id: 'recommendations' as const, label: 'Career Paths', number: 2 },
    { id: 'jobs' as const, label: 'Job Listings', number: 3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        <button
          onClick={() => onStepChange('hero')}
          className="flex items-center gap-1.5 sm:gap-2 font-semibold text-base sm:text-lg hover:opacity-80 transition-opacity"
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
          <span className="hidden xs:inline">CareerPath AI</span>
          <span className="xs:hidden">Career AI</span>
        </button>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {steps.map((step) => (
              <Button
                key={step.id}
                variant={currentStep === step.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onStepChange(step.id)}
                className="gap-2 text-xs lg:text-sm"
              >
                <span className="flex h-4 w-4 lg:h-5 lg:w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium flex-shrink-0">
                  {step.number}
                </span>
                <span className="hidden lg:inline">{step.label}</span>
                <span className="lg:hidden">{step.label.split(' ')[0]}</span>
              </Button>
            ))}
            <Button
              variant={currentStep === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onStepChange('dashboard')}
              className="gap-2 text-xs lg:text-sm"
            >
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden lg:inline">Dashboard</span>
            </Button>
            {isAdmin && (
              <Button
                variant={currentStep === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onStepChange('admin')}
                className="gap-2 text-xs lg:text-sm"
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="hidden lg:inline">Admin</span>
              </Button>
            )}
          </nav>
        )}

        {/* Desktop Auth Button */}
        <div className="hidden md:block">
          <Button 
            onClick={handleAuth} 
            disabled={disabled} 
            variant={isAuthenticated ? 'outline' : 'default'}
            size="sm"
            className="text-xs lg:text-sm"
          >
            {buttonText}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 -mr-2 touch-manipulation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-3 sm:py-4 space-y-2 sm:space-y-3 px-4">
            {isAuthenticated && (
              <nav className="space-y-1.5 sm:space-y-2">
                {steps.map((step) => (
                  <Button
                    key={step.id}
                    variant={currentStep === step.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      onStepChange(step.id);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-2 h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
                  >
                    <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary/10 text-xs sm:text-sm font-medium flex-shrink-0">
                      {step.number}
                    </span>
                    {step.label}
                  </Button>
                ))}
                <Button
                  variant={currentStep === 'dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    onStepChange('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2 h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
                >
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  Marketing Dashboard
                </Button>
                {isAdmin && (
                  <Button
                    variant={currentStep === 'admin' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      onStepChange('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-2 h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
                  >
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                    Admin Dashboard
                  </Button>
                )}
              </nav>
            )}
            <Button
              onClick={() => {
                handleAuth();
                setMobileMenuOpen(false);
              }}
              disabled={disabled}
              variant={isAuthenticated ? 'outline' : 'default'}
              className="w-full h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
