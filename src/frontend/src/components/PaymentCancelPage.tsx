import { useEffect } from 'react';
import { usePaymentCancel } from '../hooks/useQueries';
import { useAnalytics } from '../hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { XCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
  const { trackEvent, getUTMParams } = useAnalytics();
  
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('sessionId') || '';

  const { data, isLoading } = usePaymentCancel(sessionId);

  useEffect(() => {
    if (data) {
      const utmParams = getUTMParams();

      // Track payment cancellation
      trackEvent('payment', 'cancelled', 'subscription');

      // Google Analytics - Checkout cancellation
      if (window.gtag) {
        window.gtag('event', 'checkout_cancelled', {
          event_category: 'ecommerce',
          event_label: 'User cancelled payment',
          ...utmParams,
        });
      }

      // Facebook Pixel - Custom event
      if (window.fbq) {
        window.fbq('trackCustom', 'CheckoutCancelled', {
          source: utmParams.source,
          campaign: utmParams.campaign,
        });
      }

      // Mixpanel - Track cancellation
      if (window.mixpanel) {
        window.mixpanel.track('Checkout Cancelled', {
          session_id: sessionId,
          ...utmParams,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }, [data, sessionId, trackEvent, getUTMParams]);

  const handleRetry = () => {
    window.location.href = '/#pricing';
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <p className="text-lg font-medium">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-secondary/5 px-4 py-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <XCircle className="h-10 w-10 text-orange-600" />
            <div>
              <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
              <CardDescription className="mt-1">
                Your payment was not processed
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {data?.message || 'You cancelled the payment process. No charges were made to your account.'}
            </p>
            <p className="text-sm text-muted-foreground">
              If you experienced any issues during checkout, please try again or contact our support team.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Need help? Contact us at support@careerpath.ai
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
