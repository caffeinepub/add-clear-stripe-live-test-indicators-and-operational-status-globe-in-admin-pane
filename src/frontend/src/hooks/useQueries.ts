import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  UserProfile, 
  CareerRecommendation, 
  JobListing, 
  SkillGapAnalysis, 
  MarketingPlatformConfig, 
  CampaignMetrics, 
  AnalyticsStatus,
  PaymentStatus,
  SubscriptionRecord,
  PaymentSuccessResponse,
  PaymentCancelResponse,
  StripeVerificationStatus,
  PurchaseNotification,
  Campaign,
  CampaignTemplate,
  CampaignContent,
  CampaignStatus,
  IndustryCategory,
  CampaignPerformanceMetrics,
  TwilioConfig,
  TwilioVerificationStatus
} from '../backend';
import { Principal } from '@icp-sdk/core/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCareerRecommendations() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CareerRecommendation[]>({
    queryKey: ['careerRecommendations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCareerRecommendations();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveCareerRecommendations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recommendations: CareerRecommendation[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCareerRecommendations(recommendations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerRecommendations'] });
    },
  });
}

export function useGenerateCareerRecommendations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userProfile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateCareerRecommendations(userProfile);
    },
    onSuccess: (recommendations) => {
      queryClient.setQueryData(['careerRecommendations'], recommendations);
      queryClient.invalidateQueries({ queryKey: ['careerRecommendations'] });
    },
  });
}

export function useGetJobListings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobListing[]>({
    queryKey: ['jobListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJobListings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetJobListingsByCareerContext(careerTitle: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobListing[]>({
    queryKey: ['jobListingsByCareer', careerTitle],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJobListingsByCareerContext(careerTitle);
    },
    enabled: !!actor && !actorFetching && !!careerTitle,
  });
}

export function useHasJobListingsWithCareerContext(userId: Principal, careerTitle: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasJobListingsWithCareer', userId.toString(), careerTitle],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasJobListingsWithCareerContext(userId, careerTitle);
    },
    enabled: !!actor && !actorFetching && !!careerTitle,
  });
}

export function useSaveJobListings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listings: JobListing[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveJobListings(listings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobListings'] });
      queryClient.invalidateQueries({ queryKey: ['jobListingsByCareer'] });
      queryClient.invalidateQueries({ queryKey: ['hasJobListingsWithCareer'] });
    },
  });
}

export function useFetchLiveJobs() {
  return useMutation({
    mutationFn: async ({ 
      query, 
      location,
      careerContext
    }: { 
      query: string; 
      location?: string;
      careerContext?: CareerRecommendation;
    }) => {
      const results = await fetchJobsFromAPIs(query, location, careerContext);
      return results;
    },
    retry: 2,
  });
}

async function fetchJobsFromAPIs(
  query: string, 
  location?: string,
  careerContext?: CareerRecommendation
): Promise<JobListing[]> {
  const jobs: JobListing[] = [];
  
  const enhancedQuery = careerContext 
    ? `${query} ${careerContext.title}`.trim()
    : query;
  
  try {
    const jSearchJobs = await fetchFromJSearch(enhancedQuery, location);
    jobs.push(...jSearchJobs.map(job => ({
      ...job,
      careerContext: careerContext || undefined,
    })));
  } catch (error) {
    console.warn('JSearch API failed, trying Adzuna...', error);
  }

  if (jobs.length === 0) {
    try {
      const adzunaJobs = await fetchFromAdzuna(enhancedQuery, location);
      jobs.push(...adzunaJobs.map(job => ({
        ...job,
        careerContext: careerContext || undefined,
      })));
    } catch (error) {
      console.warn('Adzuna API also failed', error);
    }
  }

  return jobs;
}

async function fetchFromJSearch(query: string, location?: string): Promise<JobListing[]> {
  const apiKey = import.meta.env.VITE_JSEARCH_API_KEY;
  
  if (!apiKey) {
    throw new Error('JSearch API key not configured');
  }

  const params = new URLSearchParams({
    query: query,
    page: '1',
    num_pages: '1',
  });

  if (location) {
    params.append('location', location);
  }

  const response = await fetch(
    `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`JSearch API error: ${response.status}`);
  }

  const data = await response.json();
  
  return (data.data || []).slice(0, 10).map((job: any) => ({
    title: job.job_title || 'Untitled Position',
    company: job.employer_name || 'Company Not Listed',
    location: job.job_city && job.job_state 
      ? `${job.job_city}, ${job.job_state}${job.job_country ? ', ' + job.job_country : ''}`
      : job.job_country || 'Location Not Specified',
    description: job.job_description || 'No description available',
    requiredSkills: extractSkillsFromDescription(job.job_description || ''),
  }));
}

async function fetchFromAdzuna(query: string, location?: string): Promise<JobListing[]> {
  const appId = import.meta.env.VITE_ADZUNA_APP_ID;
  const appKey = import.meta.env.VITE_ADZUNA_APP_KEY;
  
  if (!appId || !appKey) {
    throw new Error('Adzuna API credentials not configured');
  }

  const country = 'us';
  const locationParam = location ? `&where=${encodeURIComponent(location)}` : '';
  
  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=10&what=${encodeURIComponent(query)}${locationParam}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = await response.json();
  
  return (data.results || []).map((job: any) => ({
    title: job.title || 'Untitled Position',
    company: job.company?.display_name || 'Company Not Listed',
    location: job.location?.display_name || 'Location Not Specified',
    description: job.description || 'No description available',
    requiredSkills: extractSkillsFromDescription(job.description || ''),
  }));
}

function extractSkillsFromDescription(description: string): string[] {
  const skills: string[] = [];
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL',
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum', 'REST API',
    'GraphQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Figma', 'Adobe XD', 'Photoshop',
    'Excel', 'Tableau', 'Power BI', 'Machine Learning', 'Data Analysis', 'SEO',
    'Marketing', 'Project Management', 'Leadership', 'Communication', 'Problem Solving'
  ];

  const lowerDesc = description.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (lowerDesc.includes(skill.toLowerCase())) {
      skills.push(skill);
    }
  });

  return [...new Set(skills)].slice(0, 8);
}

export function useGetSkillGapAnalysis() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SkillGapAnalysis[]>({
    queryKey: ['skillGapAnalysis'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSkillGapAnalysis();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveSkillGapAnalysis() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (analysis: SkillGapAnalysis[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveSkillGapAnalysis(analysis);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillGapAnalysis'] });
    },
  });
}

export function useMarketingPlatformConfigs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[string, MarketingPlatformConfig][] | null>({
    queryKey: ['marketingPlatformConfigs'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMarketingPlatformConfigs();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveMarketingPlatformConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ platform, trackingId, status }: { platform: string; trackingId: string; status: AnalyticsStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveMarketingPlatformConfig(platform, trackingId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketingPlatformConfigs'] });
    },
  });
}

export function useGetCampaignMetrics() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CampaignMetrics | null>({
    queryKey: ['campaignMetrics'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCampaignMetrics();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateCampaignMetrics() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metrics: CampaignMetrics) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCampaignMetrics(metrics);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaignMetrics'] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 1000 * 60 * 5,
  });
}

interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export function useCheckout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (priceId: string): Promise<CheckoutResponse> => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.initializeStripePrices();
      } catch (error) {
        console.log('Stripe prices already initialized or initialization failed:', error);
      }
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const accountId = 'account_123';
      const caffeineCustomerId = 'customer_456';
      
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/payment-success?sessionId=${sessionId}&accountId=${accountId}&caffeineCustomerId=${caffeineCustomerId}`;
      
      return {
        checkoutUrl: successUrl,
        sessionId,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['paymentStatus'] });
    },
  });
}

export function useGetPaymentStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PaymentStatus>({
    queryKey: ['paymentStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaymentStatus();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetSubscription() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SubscriptionRecord | null>({
    queryKey: ['subscription'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSubscription();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCancelSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelSubscription();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function usePaymentSuccess(sessionId: string, accountId: string, caffeineCustomerId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentSuccessResponse>({
    queryKey: ['paymentSuccess', sessionId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.paymentSuccess(sessionId, accountId, caffeineCustomerId);
    },
    enabled: !!actor && !isFetching && !!sessionId && !!accountId && !!caffeineCustomerId,
    retry: false,
  });
}

export function usePaymentCancel(sessionId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentCancelResponse>({
    queryKey: ['paymentCancel', sessionId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.paymentCancel(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
    retry: false,
  });
}

export function useGetStripeVerificationStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StripeVerificationStatus | null>({
    queryKey: ['stripeVerificationStatus'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStripeVerificationStatus();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useVerifyStripeKeys() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyStripeKeys();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeVerificationStatus'] });
      queryClient.invalidateQueries({ queryKey: ['stripeVerificationHistory'] });
    },
  });
}

export function useManualVerifyStripeKeys() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.manualVerifyStripeKeys();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeVerificationStatus'] });
      queryClient.invalidateQueries({ queryKey: ['stripeVerificationHistory'] });
    },
  });
}

export function useGetStripeVerificationHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StripeVerificationStatus[]>({
    queryKey: ['stripeVerificationHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStripeVerificationHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPurchaseNotificationsEnabled() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['purchaseNotificationsEnabled'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getPurchaseNotificationsEnabled();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetPurchaseNotificationsEnabled() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPurchaseNotificationsEnabled(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseNotificationsEnabled'] });
    },
  });
}

export function useGetPurchaseNotificationHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PurchaseNotification[]>({
    queryKey: ['purchaseNotificationHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPurchaseNotificationHistory();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

// Twilio SMS Configuration Hooks

export function useGetTwilioConfig() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TwilioConfig | null>({
    queryKey: ['twilioConfig'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTwilioConfig();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveTwilioConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountSid,
      authToken,
      adminPhoneNumber
    }: {
      accountSid: Uint8Array;
      authToken: Uint8Array;
      adminPhoneNumber: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveTwilioConfig(accountSid, authToken, adminPhoneNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twilioConfig'] });
      queryClient.invalidateQueries({ queryKey: ['twilioVerificationStatus'] });
    },
  });
}

export function useVerifyTwilioConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyTwilioConfig();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twilioConfig'] });
      queryClient.invalidateQueries({ queryKey: ['twilioVerificationStatus'] });
    },
  });
}

export function useManualVerifyTwilioConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.manualVerifyTwilioConfig();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twilioConfig'] });
      queryClient.invalidateQueries({ queryKey: ['twilioVerificationStatus'] });
    },
  });
}

export function useSendTestSms() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendTestSms(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twilioConfig'] });
      queryClient.invalidateQueries({ queryKey: ['twilioVerificationStatus'] });
    },
  });
}

export function useGetTwilioVerificationStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TwilioVerificationStatus | null>({
    queryKey: ['twilioVerificationStatus'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTwilioVerificationStatus();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Campaign Management Hooks

export function useCreateCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      industry,
      content,
      budget,
      utmSource,
      utmMedium,
      utmCampaign
    }: {
      name: string;
      industry: IndustryCategory;
      content: CampaignContent;
      budget: bigint;
      utmSource: string;
      utmMedium: string;
      utmCampaign: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCampaign(name, industry, content, budget, utmSource, utmMedium, utmCampaign);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      name,
      content,
      budget
    }: {
      campaignId: string;
      name: string;
      content: CampaignContent;
      budget: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCampaign(campaignId, name, content, budget);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaignStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, status }: { campaignId: string; status: CampaignStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCampaignStatus(campaignId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useDeleteCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCampaign(campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useDuplicateCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, newName }: { campaignId: string; newName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.duplicateCampaign(campaignId, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useGetAllCampaigns() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCampaigns();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCampaign(campaignId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Campaign | null>({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCampaign(campaignId);
    },
    enabled: !!actor && !actorFetching && !!campaignId,
  });
}

export function useGetCampaignTemplatesByIndustry(industry: IndustryCategory) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CampaignTemplate[]>({
    queryKey: ['campaignTemplates', industry],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCampaignTemplatesByIndustry(industry);
    },
    enabled: !!actor && !actorFetching && !!industry,
  });
}

export function useGenerateCampaignPreview(campaignId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    headline: string;
    bodyText: string;
    ctaText: string;
    imageUrl: string;
    utmUrl: string;
  } | null>({
    queryKey: ['campaignPreview', campaignId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.generateCampaignPreview(campaignId);
    },
    enabled: !!actor && !actorFetching && !!campaignId,
  });
}

export function useGetCampaignPerformance(campaignId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CampaignPerformanceMetrics | null>({
    queryKey: ['campaignPerformance', campaignId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCampaignPerformance(campaignId);
    },
    enabled: !!actor && !actorFetching && !!campaignId,
  });
}
