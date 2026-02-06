import { useCallback, useEffect } from 'react';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

/**
 * Production Analytics Hook - Complete Marketing Campaign Integration
 * 
 * Integrates with multiple analytics platforms for comprehensive tracking:
 * - Google Analytics (GA4) - Web analytics and conversion tracking
 * - Facebook Pixel - Social media advertising and retargeting
 * - LinkedIn Insight Tag - Professional audience tracking
 * - Mixpanel - Advanced user behavior analytics and funnels
 * - Plausible Analytics - Privacy-focused analytics (GDPR compliant)
 * - Sentry - Error tracking and performance monitoring
 * 
 * LIVE DEPLOYMENT SETUP:
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 1. GOOGLE ANALYTICS (GA4):
 *    Step 1: Go to https://analytics.google.com/
 *    Step 2: Create a new GA4 property
 *    Step 3: Copy your Measurement ID (format: G-XXXXXXXXXX)
 *    Step 4: In index.html, replace 'GA_MEASUREMENT_ID' with your ID
 *    Step 5: Uncomment the Google Analytics script block
 *    
 * 2. FACEBOOK PIXEL:
 *    Step 1: Go to https://business.facebook.com/events_manager
 *    Step 2: Create a new Pixel
 *    Step 3: Copy your Pixel ID (numeric)
 *    Step 4: In index.html, replace 'YOUR_PIXEL_ID' with your ID
 *    Step 5: Uncomment the Facebook Pixel script block
 *    
 * 3. LINKEDIN INSIGHT TAG:
 *    Step 1: Go to https://www.linkedin.com/campaignmanager
 *    Step 2: Navigate to Account Assets > Insight Tag
 *    Step 3: Copy your Partner ID
 *    Step 4: In index.html, replace 'YOUR_PARTNER_ID' with your ID
 *    Step 5: Uncomment the LinkedIn Insight Tag script block
 *    
 * 4. MIXPANEL:
 *    Step 1: Sign up at https://mixpanel.com/
 *    Step 2: Create a new project
 *    Step 3: Copy your Project Token from Settings
 *    Step 4: In index.html, replace 'YOUR_PROJECT_TOKEN' with your token
 *    Step 5: Uncomment the Mixpanel script block
 *    
 * 5. PLAUSIBLE ANALYTICS:
 *    Step 1: Sign up at https://plausible.io/
 *    Step 2: Add your domain
 *    Step 3: In index.html, replace 'YOUR_DOMAIN' with your domain
 *    Step 4: Uncomment the Plausible script tag
 *    
 * 6. SENTRY ERROR TRACKING:
 *    Step 1: Create account at https://sentry.io/
 *    Step 2: Create a new project (JavaScript/React)
 *    Step 3: Copy your DSN from project settings
 *    Step 4: In index.html, replace 'YOUR_DSN' with your DSN
 *    Step 5: Update SDK version and integrity hash
 *    Step 6: Uncomment the Sentry script blocks
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * TESTING:
 * - After setup, test each platform's real-time view to confirm tracking
 * - Check browser console for any analytics errors
 * - Verify events appear in each platform's dashboard
 * 
 * PRIVACY COMPLIANCE:
 * - Update your privacy policy to mention all analytics services
 * - Add cookie consent banner if required by your jurisdiction
 * - Configure data retention policies in each platform
 * - Enable IP anonymization where available
 */
export function useAnalytics() {
  // Extract UTM parameters from URL
  const getUTMParams = useCallback((): UTMParams => {
    if (typeof window === 'undefined') return {};
    
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      content: params.get('utm_content') || undefined,
      term: params.get('utm_term') || undefined,
    };
  }, []);

  // Store UTM parameters in session storage for attribution
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const utmParams = getUTMParams();
      if (Object.keys(utmParams).length > 0) {
        sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
        console.log('[Analytics] UTM Parameters captured:', utmParams);
      }
    }
  }, [getUTMParams]);

  // Initialize analytics on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const utmParams = getUTMParams();
      
      // Track initial page load
      console.log('[Analytics] Application initialized - Ready for production tracking');
      
      // Google Analytics - Page view with UTM parameters
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: window.location.pathname,
          ...utmParams,
        });
        console.log('[Analytics] Google Analytics (GA4) - Active');
      }
      
      // Facebook Pixel - Page view
      if (window.fbq) {
        window.fbq('track', 'PageView', {
          source: utmParams.source,
          campaign: utmParams.campaign,
        });
        console.log('[Analytics] Facebook Pixel - Active');
      }

      // LinkedIn Insight Tag - Page view
      if (window.lintrk) {
        window.lintrk('track', { conversion_id: 'pageview' });
        console.log('[Analytics] LinkedIn Insight Tag - Active');
      }
      
      // Mixpanel - Track page view
      if (window.mixpanel) {
        window.mixpanel.track('Page View', {
          page: window.location.pathname,
          title: document.title,
          ...utmParams,
        });
        console.log('[Analytics] Mixpanel - Active');
      }
      
      // Plausible - Automatic page view tracking
      if (window.plausible) {
        window.plausible('pageview', {
          props: utmParams,
        });
        console.log('[Analytics] Plausible Analytics - Active');
      }

      // Log setup status
      const activeServices: string[] = [];
      if (window.gtag) activeServices.push('Google Analytics');
      if (window.fbq) activeServices.push('Facebook Pixel');
      if (window.lintrk) activeServices.push('LinkedIn Insight Tag');
      if (window.mixpanel) activeServices.push('Mixpanel');
      if (window.plausible) activeServices.push('Plausible');
      if (window.Sentry) activeServices.push('Sentry');

      if (activeServices.length > 0) {
        console.log(`[Analytics] Active services: ${activeServices.join(', ')}`);
      } else {
        console.log('[Analytics] No analytics services configured. See index.html for setup instructions.');
      }
    }
  }, [getUTMParams]);

  const trackPageView = useCallback((page: string) => {
    if (typeof window !== 'undefined') {
      const utmParams = getUTMParams();
      console.log('[Analytics] Page View:', page);
      
      // Google Analytics (GA4)
      if (window.gtag) {
        window.gtag('event', 'page_view', { 
          page_path: `/${page}`,
          page_title: `CareerPath AI - ${page}`,
          page_location: window.location.href,
          ...utmParams,
        });
      }
      
      // Facebook Pixel
      if (window.fbq) {
        window.fbq('track', 'PageView', {
          page_name: page,
          source: utmParams.source,
          campaign: utmParams.campaign,
        });
      }

      // LinkedIn Insight Tag
      if (window.lintrk) {
        window.lintrk('track', { conversion_id: 'pageview' });
      }
      
      // Plausible Analytics
      if (window.plausible) {
        window.plausible('pageview', { 
          props: { 
            page,
            section: page,
            ...utmParams,
          } 
        });
      }
      
      // Mixpanel
      if (window.mixpanel) {
        window.mixpanel.track('Page View', { 
          page,
          timestamp: new Date().toISOString(),
          ...utmParams,
        });
      }
      
      // Store in localStorage for basic tracking
      try {
        const views = JSON.parse(localStorage.getItem('analytics_views') || '[]');
        views.push({
          page,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          ...utmParams,
        });
        // Keep only last 100 views
        if (views.length > 100) views.shift();
        localStorage.setItem('analytics_views', JSON.stringify(views));
      } catch (error) {
        console.error('Analytics storage error:', error);
      }
    }
  }, [getUTMParams]);

  const trackEvent = useCallback(({ category, action, label, value }: AnalyticsEvent) => {
    if (typeof window !== 'undefined') {
      const utmParams = getUTMParams();
      console.log('[Analytics] Event:', { category, action, label, value });
      
      // Google Analytics (GA4)
      if (window.gtag) {
        window.gtag('event', action, { 
          event_category: category, 
          event_label: label, 
          value,
          timestamp: new Date().toISOString(),
          ...utmParams,
        });
      }
      
      // Facebook Pixel
      if (window.fbq) {
        window.fbq('trackCustom', action, { 
          category, 
          label, 
          value,
          source: utmParams.source,
          campaign: utmParams.campaign,
        });
      }

      // LinkedIn Insight Tag - Track custom events
      if (window.lintrk) {
        window.lintrk('track', { conversion_id: action });
      }
      
      // Plausible Analytics
      if (window.plausible) {
        window.plausible(action, { 
          props: { 
            category, 
            label, 
            value: value?.toString(),
            ...utmParams,
          } 
        });
      }
      
      // Mixpanel
      if (window.mixpanel) {
        window.mixpanel.track(action, { 
          category, 
          label, 
          value,
          timestamp: new Date().toISOString(),
          ...utmParams,
        });
      }
      
      // Store in localStorage for basic tracking
      try {
        const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        events.push({
          category,
          action,
          label,
          value,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          ...utmParams,
        });
        // Keep only last 100 events
        if (events.length > 100) events.shift();
        localStorage.setItem('analytics_events', JSON.stringify(events));
      } catch (error) {
        console.error('Analytics storage error:', error);
      }
    }
  }, [getUTMParams]);

  const trackConversion = useCallback((conversionType: string, value?: number) => {
    const utmParams = getUTMParams();
    console.log('[Analytics] Conversion:', conversionType, value);
    
    // Google Analytics (GA4) - Conversion event
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL', // Replace with actual conversion ID
        value: value || 0,
        currency: 'USD',
        transaction_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...utmParams,
      });
    }
    
    // Facebook Pixel - Lead event
    if (window.fbq) {
      window.fbq('track', 'Lead', { 
        value: value || 0, 
        currency: 'USD',
        content_name: conversionType,
        source: utmParams.source,
        campaign: utmParams.campaign,
      });
    }

    // LinkedIn Insight Tag - Conversion tracking
    if (window.lintrk) {
      window.lintrk('track', { conversion_id: conversionType });
    }
    
    // Mixpanel - Conversion tracking
    if (window.mixpanel) {
      window.mixpanel.track('Conversion', {
        type: conversionType,
        value,
        timestamp: new Date().toISOString(),
        ...utmParams,
      });
    }
    
    trackEvent({
      category: 'conversion',
      action: conversionType,
      value,
    });
  }, [trackEvent, getUTMParams]);

  const trackCTAClick = useCallback((ctaLocation: string, ctaText: string) => {
    const utmParams = getUTMParams();
    console.log('[Analytics] CTA Click:', ctaLocation, ctaText);

    // Google Analytics - CTA click event
    if (window.gtag) {
      window.gtag('event', 'cta_click', {
        event_category: 'engagement',
        event_label: `${ctaLocation} - ${ctaText}`,
        cta_location: ctaLocation,
        cta_text: ctaText,
        ...utmParams,
      });
    }

    // Facebook Pixel - Custom CTA event
    if (window.fbq) {
      window.fbq('trackCustom', 'CTAClick', {
        location: ctaLocation,
        text: ctaText,
        source: utmParams.source,
        campaign: utmParams.campaign,
      });
    }

    // LinkedIn Insight Tag
    if (window.lintrk) {
      window.lintrk('track', { conversion_id: 'cta_click' });
    }

    trackEvent({
      category: 'cta',
      action: 'click',
      label: `${ctaLocation} - ${ctaText}`,
    });
  }, [trackEvent, getUTMParams]);

  const trackError = useCallback((error: Error, context?: string) => {
    console.error('[Analytics] Error:', error, context);
    
    // Sentry - Error tracking
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { context },
        extra: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      });
    }
    
    // Google Analytics - Exception tracking
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
    
    trackEvent({
      category: 'error',
      action: error.name,
      label: context || error.message,
    });
  }, [trackEvent]);

  const trackTiming = useCallback((category: string, variable: string, time: number) => {
    console.log('[Analytics] Timing:', category, variable, time);
    
    // Google Analytics - Timing event
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: time,
        event_category: category,
      });
    }
    
    // Mixpanel - Performance tracking
    if (window.mixpanel) {
      window.mixpanel.track('Performance Timing', {
        category,
        variable,
        time,
        timestamp: new Date().toISOString(),
      });
    }
    
    trackEvent({
      category: 'performance',
      action: `${category}_${variable}`,
      value: time,
    });
  }, [trackEvent]);

  return {
    trackPageView,
    trackEvent: (category: string, action: string, label?: string, value?: number) =>
      trackEvent({ category, action, label, value }),
    trackConversion,
    trackCTAClick,
    trackError,
    trackTiming,
    getUTMParams,
  };
}

// Type declarations for analytics services
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    lintrk?: (...args: any[]) => void;
    plausible?: (...args: any[]) => void;
    mixpanel?: {
      track: (event: string, properties?: any) => void;
      identify: (userId: string) => void;
      people?: {
        set: (properties: any) => void;
      };
    };
    Sentry?: {
      captureException: (error: Error, context?: any) => void;
      captureMessage: (message: string, level?: string) => void;
    };
  }
}
