import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight, Zap, Target, TrendingUp, Heart } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import WaitlistModal from './WaitlistModal';

export default function Hero() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { trackCTAClick, trackConversion, getUTMParams } = useAnalytics();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const isAuthenticated = !!identity;

  const handleGetStarted = () => {
    const utmParams = getUTMParams();
    trackCTAClick('hero_primary', 'Discover Your True Purpose');
    trackConversion('cta_click_hero_primary', 1);
    
    if (utmParams.source) {
      trackConversion(`cta_click_${utmParams.source}`, 1);
    }
    
    login();
  };

  const handleLearnMore = () => {
    trackCTAClick('hero_secondary', 'Learn More');
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWaitlistOpen = () => {
    trackCTAClick('hero_waitlist', 'Get Early Access');
    setWaitlistOpen(true);
  };

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 gradient-primary opacity-10 dark:opacity-20 animate-gradient" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(var(--primary)/0.15),transparent_50%)] animate-pulse-slow" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,oklch(var(--secondary)/0.15),transparent_50%)] animate-pulse-slow" style={{ animationDelay: '1s' }} />
          
          <div className="container relative py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 px-4">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-center">
              <div className="space-y-6 sm:space-y-7 md:space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold border border-primary/20 hover:bg-primary/15 transition-colors duration-300">
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
                  Find Your Calling Across All Career Paths
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                  Discover Your{' '}
                  <span className="gradient-text animate-gradient-text">True Purpose</span>
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                  Whether you're a chef, welder, artist, programmer, or anything in between—your unique combination of skills holds the key to an extraordinary career. 
                  Let AI reveal where your passions and talents can take you across all industries.
                </p>
                
                {!isAuthenticated && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                    <Button 
                      size="lg" 
                      onClick={handleGetStarted} 
                      disabled={loginStatus === 'logging-in'}
                      className="text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 gradient-primary hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto shadow-lg hover:shadow-xl min-h-[44px] touch-manipulation group"
                      data-cta="hero-primary"
                      data-cta-variant="a"
                    >
                      {loginStatus === 'logging-in' ? 'Logging in...' : 'Discover Your True Purpose'}
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={handleLearnMore}
                      className="text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 w-full sm:w-auto hover:bg-primary/5 transition-all duration-300 min-h-[44px] touch-manipulation"
                      data-cta="hero-secondary"
                    >
                      Learn More
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 sm:gap-6 pt-2 sm:pt-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm hover:scale-105 transition-transform duration-300">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                      <Zap className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-primary" />
                    </div>
                    <span className="font-medium">Every Background Valued</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                      <Target className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-secondary" />
                    </div>
                    <span className="font-medium">Unlimited Possibilities</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.4s' }}>
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                      <TrendingUp className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-accent" />
                    </div>
                    <span className="font-medium">Your Path Awaits</span>
                  </div>
                </div>
              </div>
              
              <div className="relative order-first lg:order-last animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full animate-pulse-slow" />
                <picture>
                  <source
                    media="(min-width: 1024px)"
                    srcSet="/assets/generated/diverse-careers-collage.dim_1200x600.png"
                    type="image/png"
                  />
                  <source
                    media="(min-width: 640px)"
                    srcSet="/assets/generated/diverse-careers-collage.dim_1200x600.png"
                    type="image/png"
                  />
                  <img
                    src="/assets/generated/diverse-careers-collage.dim_1200x600.png"
                    alt="Diverse professionals discovering their true purpose: chefs creating culinary innovations, engineers building the future, artists expressing creativity, farmers nurturing sustainable growth, and technologists solving global challenges"
                    className="relative rounded-xl sm:rounded-2xl shadow-2xl animate-float w-full h-auto hover:scale-105 transition-transform duration-700"
                    loading="eager"
                    fetchPriority="high"
                    width="1200"
                    height="600"
                  />
                </picture>
              </div>
            </div>
          </div>
        </div>

        <div id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 bg-muted/30">
          <div className="container px-4">
            <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4 animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold px-4">
                Your Journey to{' '}
                <span className="gradient-text">Purpose Discovery</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                Three simple steps to uncover career paths that align with your unique talents and passions—no matter where you're starting from
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7 md:gap-8 max-w-6xl mx-auto px-4">
              {[
                {
                  icon: '/assets/generated/exploration-icon.dim_64x64.png',
                  number: 1,
                  title: 'Share Your Unique Story',
                  description: 'Tell us about your passions, skills, and experiences. From welding to web design, cooking to coding, farming to finance—every skill matters. Your diverse background is your strength.',
                  delay: '0s',
                },
                {
                  icon: '/assets/generated/skill-connection-icon.dim_64x64.png',
                  number: 2,
                  title: 'Discover Hidden Connections',
                  description: 'Our AI reveals how your unique skill combinations open doors across all industries. See how culinary arts meets technology, agriculture connects with data science, or trades blend with innovation.',
                  delay: '0.1s',
                },
                {
                  icon: '/assets/generated/job-search-icon.dim_64x64.png',
                  number: 3,
                  title: 'Find Your Calling',
                  description: 'Explore real opportunities that match your newly discovered paths. Get actionable steps to bridge any gaps and start your journey toward a career that truly fulfills you.',
                  delay: '0.2s',
                },
              ].map((step, index) => (
                <Card 
                  key={index}
                  className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 border-2 hover:border-primary/30 hover:-translate-y-2 animate-fade-in-up"
                  style={{ animationDelay: step.delay }}
                >
                  <div className="absolute top-0 left-0 w-full h-1 gradient-primary" />
                  <CardContent className="pt-6 sm:pt-8 space-y-4 sm:space-y-6 p-5 sm:p-6">
                    <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mx-auto group-hover:scale-110 transition-transform duration-500">
                      <img 
                        src={step.icon} 
                        alt={`${step.title} icon`}
                        className="h-10 w-10 sm:h-12 sm:w-12"
                        loading="lazy"
                        width="64"
                        height="64"
                      />
                    </div>
                    <div className="text-center space-y-2 sm:space-y-3">
                      <div className="inline-flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 text-primary font-bold text-sm sm:text-base mb-2">
                        {step.number}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold">{step.title}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12 sm:mt-14 md:mt-16 animate-fade-in-up px-4" style={{ animationDelay: '0.4s' }}>
              <Card className="max-w-2xl mx-auto border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="pt-8 pb-8 space-y-4 p-5 sm:p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold">Ready to Find Your True Calling?</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Join thousands who've discovered their purpose through our AI-powered career discovery platform. 
                    Get exclusive insights, early access to new features, and personalized guidance on your journey.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={handleWaitlistOpen}
                    className="gap-2 gradient-primary hover:opacity-90 transition-all duration-300 hover:scale-105 min-h-[44px] px-6 py-6 text-base touch-manipulation"
                    data-cta="hero-waitlist"
                  >
                    <Sparkles className="h-4 w-4" />
                    Start Your Journey Today
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </>
  );
}
