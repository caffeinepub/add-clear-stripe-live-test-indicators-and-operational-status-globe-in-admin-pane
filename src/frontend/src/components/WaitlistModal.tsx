import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { trackConversion, trackCTAClick, getUTMParams } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !name.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const utmParams = getUTMParams();
      
      // Store in localStorage for demonstration
      const waitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
      const submission = {
        name,
        email,
        timestamp: new Date().toISOString(),
        source: utmParams.source || 'direct',
        medium: utmParams.medium || 'organic',
        campaign: utmParams.campaign || 'none',
        content: utmParams.content || 'waitlist_modal',
        term: utmParams.term || '',
      };
      waitlist.push(submission);
      localStorage.setItem('waitlist', JSON.stringify(waitlist));

      // Track conversion for marketing campaigns
      trackConversion('waitlist_signup', 1);
      trackCTAClick('waitlist_modal', 'Get Early Access');

      // Facebook Pixel - Lead event with campaign attribution
      if (window.fbq) {
        window.fbq('track', 'Lead', {
          content_name: 'Waitlist Signup',
          content_category: 'Career Discovery',
          value: 1,
          currency: 'USD',
          source: utmParams.source,
          campaign: utmParams.campaign,
        });
      }

      // Google Analytics - Lead event with UTM parameters
      if (window.gtag) {
        window.gtag('event', 'generate_lead', {
          event_category: 'engagement',
          event_label: 'waitlist_signup',
          value: 1,
          ...utmParams,
        });
      }

      // LinkedIn Insight Tag - Conversion
      if (window.lintrk) {
        window.lintrk('track', { conversion_id: 'waitlist_signup' });
      }

      // Mixpanel - Lead capture with full attribution
      if (window.mixpanel) {
        window.mixpanel.track('Waitlist Signup', {
          name,
          email,
          ...utmParams,
          timestamp: new Date().toISOString(),
        });
      }

      setIsSuccess(true);
      toast.success('Successfully joined the waitlist!');

      // Reset form after delay
      setTimeout(() => {
        setEmail('');
        setName('');
        setIsSuccess(false);
        onOpenChange(false);
      }, 2500);
    } catch (error) {
      console.error('Waitlist signup error:', error);
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader className="space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl text-center">Join Our Waitlist</DialogTitle>
              <DialogDescription className="text-center">
                Be the first to know about new features, career insights, and exclusive opportunities. 
                Get early access to premium tools.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11"
                  autoComplete="email"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-11 gap-2 gradient-primary"
                data-cta="waitlist-submit"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Get Early Access
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                We respect your privacy. Unsubscribe at any time. No spam, ever.
              </p>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">You're on the list!</h3>
              <p className="text-muted-foreground">
                We'll keep you updated with the latest career insights and opportunities. 
                Check your email for confirmation.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
