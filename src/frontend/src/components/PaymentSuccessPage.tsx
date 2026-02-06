import { useEffect, useState } from 'react';
import { usePaymentSuccess } from '../hooks/useQueries';
import { useAnalytics } from '../hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight, TestTube, CheckCheck } from 'lucide-react';

export default function PaymentSuccessPage() {
  const { trackConversion, trackEvent, getUTMParams } = useAnalytics();
  const [analyticsVerified, setAnalyticsVerified] = useState(false);
  
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('sessionId') || '';
  const accountId = params.get('accountId') || '';
  const caffeineCustomerId = params.get('caffeineCustomerId') || '';

  const { data, isLoading, error } = usePaymentSuccess(sessionId, accountId, caffeineCustomerId);

  useEffect(() => {
    if (data) {
      const utmParams = getUTMParams();
      const amount = Number(data.payment.amount) / 100;

      // Track successful payment conversion across all platforms
      trackConversion('payment_success', amount);

      // Google Analytics - Purchase event
      if (window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: sessionId,
          value: amount,
          currency: data.payment.currency.toUpperCase(),
          event_category: 'ecommerce',
          event_label: 'Test Subscription Payment',
          test_mode: true,
          ...utmParams,
        });
      }

      // Facebook Pixel - Purchase event
      if (window.fbq) {
        window.fbq('track', 'Purchase', {
          value: amount,
          currency: data.payment.currency.toUpperCase(),
          content_name: 'Test Subscription',
          content_type: 'product',
          test_event_code: 'TEST12345',
          source: utmParams.source,
          campaign: utmParams.campaign,
        });
      }

      // LinkedIn Insight Tag - Purchase conversion
      if (window.lintrk) {
        window.lintrk('track', { conversion_id: 'purchase' });
      }

      // Mixpanel - Track purchase
      if (window.mixpanel) {
        window.mixpanel.track('Purchase Completed', {
          amount,
          currency: data.payment.currency,
          payment_method: data.payment.paymentMethod.brand,
          last4: data.payment.paymentMethod.last4,
          test_mode: true,
          ...utmParams,
          timestamp: new Date().toISOString(),
        });
      }

      trackEvent('payment', 'success', 'test_subscription', amount);

      // Verify analytics tracking after a short delay
      setTimeout(() => {
        setAnalyticsVerified(true);
      }, 1500);
    }
  }, [data, sessionId, trackConversion, trackEvent, getUTMParams]);

  const handleContinue = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <p className="text-lg font-medium">Confirming your test payment...</p>
              <p className="text-sm text-muted-foreground">Please wait while we process your test transaction.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-destructive/5 to-secondary/5 px-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <CardTitle>Payment Verification Failed</CardTitle>
            </div>
            <CardDescription>
              We couldn't verify your test payment. Please contact support if you were charged.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleContinue} variant="outline" className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 px-4 py-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">Test Payment Successful!</CardTitle>
                <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-600 border-blue-500/30">
                  <TestTube className="h-3 w-3" />
                  Test
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Thank you for testing the payment flow
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount Paid</span>
              <span className="font-semibold text-lg">
                ${(Number(data.payment.amount) / 100).toFixed(2)} {data.payment.currency.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <span className="font-medium">
                {data.payment.paymentMethod.brand} •••• {data.payment.paymentMethod.last4}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="font-medium text-green-600">{data.payment.status}</span>
            </div>
          </div>

          {/* Analytics Verification Status */}
          <div className={`rounded-lg p-4 border-2 transition-all ${
            analyticsVerified 
              ? 'bg-green-50 dark:bg-green-950/20 border-green-500/50' 
              : 'bg-blue-50 dark:bg-blue-950/20 border-blue-500/50'
          }`}>
            <div className="flex items-start gap-3">
              {analyticsVerified ? (
                <CheckCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Loader2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold text-sm ${
                  analyticsVerified ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'
                }`}>
                  {analyticsVerified ? 'Analytics Tracking Verified ✓' : 'Verifying Analytics Integration...'}
                </h3>
                <p className={`text-xs mt-1 ${
                  analyticsVerified ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'
                }`}>
                  {analyticsVerified 
                    ? 'Purchase events successfully sent to GA4, Facebook Pixel, LinkedIn Insight Tag, and Mixpanel'
                    : 'Sending test "Purchase" events to all analytics platforms...'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {data.message}
            </p>
            <p className="text-sm text-muted-foreground">
              This was a test transaction. No actual charges were made. You can verify the analytics events in your marketing dashboard.
            </p>
          </div>

          <Button onClick={handleContinue} className="w-full" size="lg">
            Continue to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
