import React, { useState, useEffect, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsAdmin } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ProfileSetupModal from './components/ProfileSetupModal';
import { useAnalytics } from './hooks/useAnalytics';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CareerRecommendation } from './backend';

// Lazy load heavy components for optimal performance
const SkillFusionSection = lazy(() => import('./components/SkillFusionSection'));
const InterviewSection = lazy(() => import('./components/InterviewSection'));
const RecommendationsSection = lazy(() => import('./components/RecommendationsSection'));
const JobListingsSection = lazy(() => import('./components/JobListingsSection'));
const MarketingDashboard = lazy(() => import('./components/MarketingDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const PaymentSuccessPage = lazy(() => import('./components/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('./components/PaymentCancelPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Production-ready loading fallback with skeleton UI
function LoadingFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="relative mx-auto">
          <div className="h-12 w-12 sm:h-16 sm:w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary mx-auto" />
          <div className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 animate-pulse rounded-full bg-primary/10 mx-auto" />
        </div>
        <p className="text-sm sm:text-base text-muted-foreground font-medium animate-pulse">
          Loading your career journey...
        </p>
      </div>
    </div>
  );
}

// Error boundary fallback component
function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  // Use Vite environment check instead of process.env
  const isDevelopment = import.meta.env.DEV;
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Something went wrong</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          {isDevelopment && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 text-xs bg-muted p-4 rounded-lg overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={resetError} size="lg" className="gradient-primary">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline" size="lg">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

// Error boundary wrapper
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    // Production error tracking (safe check for Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } },
      });
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsAdmin();
  const [currentStep, setCurrentStep] = useState<'hero' | 'interview' | 'recommendations' | 'jobs' | 'dashboard' | 'admin' | 'payment-success' | 'payment-cancel'>('hero');
  const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null);
  const { trackPageView, trackEvent } = useAnalytics();

  const isAuthenticated = !!identity;

  // Check URL for payment result pages
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path === '/payment-success' || params.has('sessionId')) {
      setCurrentStep('payment-success');
    } else if (path === '/payment-cancel') {
      setCurrentStep('payment-cancel');
    } else if (isAuthenticated && userProfile) {
      setCurrentStep('interview');
    } else if (!isAuthenticated) {
      setCurrentStep('hero');
    }
  }, [isAuthenticated, userProfile]);

  // Track page views when step changes
  useEffect(() => {
    trackPageView(currentStep);
  }, [currentStep, trackPageView]);

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null && currentStep !== 'payment-success' && currentStep !== 'payment-cancel';

  const handleStepChange = (step: 'hero' | 'interview' | 'recommendations' | 'jobs' | 'dashboard' | 'admin' | 'payment-success' | 'payment-cancel') => {
    trackEvent('navigation', 'step_change', step);
    setCurrentStep(step);
    // Smooth scroll to top on step change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreJobs = (career?: CareerRecommendation) => {
    if (career) {
      setSelectedCareer(career);
      trackEvent('career_selection', 'explore_jobs', career.title);
    }
    handleStepChange('jobs');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="text-center space-y-4 sm:space-y-6 px-4">
          <div className="relative mx-auto">
            <div className="h-16 w-16 sm:h-20 sm:w-20 animate-spin rounded-full border-4 border-primary/20 border-t-primary mx-auto" />
            <div className="absolute inset-0 h-16 w-16 sm:h-20 sm:w-20 animate-pulse rounded-full bg-primary/10 mx-auto" />
          </div>
          <p className="text-base sm:text-lg text-muted-foreground font-medium animate-pulse">
            Initializing your career journey...
          </p>
        </div>
      </div>
    );
  }

  // Payment result pages don't need header/footer
  if (currentStep === 'payment-success') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <PaymentSuccessPage />
      </Suspense>
    );
  }

  if (currentStep === 'payment-cancel') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <PaymentCancelPage />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentStep={currentStep} onStepChange={handleStepChange} isAdmin={isAdmin || false} />
      <main id="main-content" className="flex-1">
        {currentStep === 'hero' && (
          <>
            <Hero />
            <Suspense fallback={<LoadingFallback />}>
              <SkillFusionSection />
            </Suspense>
          </>
        )}
        {currentStep === 'interview' && isAuthenticated && (
          <Suspense fallback={<LoadingFallback />}>
            <InterviewSection onComplete={() => handleStepChange('recommendations')} />
          </Suspense>
        )}
        {currentStep === 'recommendations' && isAuthenticated && (
          <Suspense fallback={<LoadingFallback />}>
            <RecommendationsSection onExploreJobs={handleExploreJobs} />
          </Suspense>
        )}
        {currentStep === 'jobs' && isAuthenticated && (
          <Suspense fallback={<LoadingFallback />}>
            <JobListingsSection selectedCareer={selectedCareer} onClearCareer={() => setSelectedCareer(null)} />
          </Suspense>
        )}
        {currentStep === 'dashboard' && isAuthenticated && (
          <Suspense fallback={<LoadingFallback />}>
            <MarketingDashboard />
          </Suspense>
        )}
        {currentStep === 'admin' && isAuthenticated && (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        )}
      </main>
      <Footer />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster richColors closeButton position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
