import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, TestTube } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useCheckout } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { useState } from 'react';

export default function PricingSection() {
  const { trackCTAClick, trackConversion, getUTMParams } = useAnalytics();
  const { identity } = useInternetIdentity();
  const checkout = useCheckout();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const isAuthenticated = !!identity;

  const handleCheckout = async (planName: string, priceId: string, price: string) => {
    const utmParams = getUTMParams();
    
    // Track CTA click
    trackCTAClick('pricing_section', `${planName} - ${price}`);
    
    if (!isAuthenticated) {
      toast.error('Please log in to continue with payment');
      return;
    }

    setLoadingPlan(planName);

    try {
      const result = await checkout.mutateAsync(priceId);
      
      // Track payment initiation
      trackConversion('payment_initiated', parseFloat(price.replace('$', '')));
      
      // Facebook Pixel - InitiateCheckout event
      if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          content_name: planName,
          content_category: 'Subscription',
          value: parseFloat(price.replace('$', '')),
          currency: 'USD',
          source: utmParams.source,
          campaign: utmParams.campaign,
        });
      }

      // Google Analytics - begin_checkout event
      if (window.gtag) {
        window.gtag('event', 'begin_checkout', {
          event_category: 'ecommerce',
          event_label: planName,
          value: parseFloat(price.replace('$', '')),
          currency: 'USD',
          items: [{
            item_id: priceId,
            item_name: planName,
            price: parseFloat(price.replace('$', '')),
            quantity: 1,
          }],
          ...utmParams,
        });
      }

      // LinkedIn Insight Tag - Checkout event
      if (window.lintrk) {
        window.lintrk('track', { conversion_id: 'checkout_initiated' });
      }

      // Mixpanel - Track checkout initiation
      if (window.mixpanel) {
        window.mixpanel.track('Checkout Initiated', {
          plan: planName,
          price,
          priceId,
          ...utmParams,
          timestamp: new Date().toISOString(),
        });
      }

      // Redirect to Stripe checkout
      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: 'Pay Per Use',
      price: '$9.99',
      priceId: 'basic_subscription',
      period: 'per interview',
      description: 'Perfect for exploring career options without commitment',
      features: [
        'One complete AI interview',
        'Personalized career recommendations',
        'Access to job listings',
        '7-day access to results',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Monthly Subscription',
      price: '$29.99',
      priceId: 'premium_subscription',
      period: 'per month',
      description: 'Best value for ongoing career development',
      features: [
        'Unlimited AI interviews',
        'Continuous career recommendations',
        'Priority job listing access',
        'Career progress tracking',
        'Email support',
      ],
      cta: 'Subscribe Now',
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/30">
      <div className="container max-w-5xl px-4">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
            <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-600 border-blue-500/30">
              <TestTube className="h-3 w-3" />
              Test Mode
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">Choose the plan that works best for you</p>
          <p className="text-sm text-muted-foreground">
            🧪 Test mode active - Use Stripe test cards to verify payment flow
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? 'border-primary shadow-lg' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </div>
                  {plan.popular && <Badge>Popular</Badge>}
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full min-h-[44px] touch-manipulation" 
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleCheckout(plan.name, plan.priceId, plan.price)}
                  disabled={loadingPlan === plan.name}
                  data-cta={`pricing-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
                  data-cta-value={plan.price}
                >
                  {loadingPlan === plan.name ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Secure payment processing powered by Stripe. Cancel anytime.
          </p>
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              <strong>Test Mode:</strong> Use card number <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">4242 4242 4242 4242</code> with any future expiry date and CVC
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
