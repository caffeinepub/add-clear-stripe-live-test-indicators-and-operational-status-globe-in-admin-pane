import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type FeedbackType = {
    __kind__: "compliment";
    compliment: string;
} | {
    __kind__: "complaint";
    complaint: string;
};
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SkillGapAnalysis {
    recommendedSteps: Array<string>;
    jobTitle: string;
    missingSkills: Array<string>;
}
export interface PaymentRecord {
    status: PaymentStatus;
    method: PaymentMethod;
    timestamp: bigint;
    amount: bigint;
}
export interface SubscriptionRecord {
    status: SubscriptionStatus;
    paymentMethod: PaymentMethod;
    endDate: bigint;
    priceId: string;
    payment: PaymentRecord;
    startDate: bigint;
}
export interface CampaignMetrics {
    signups: bigint;
    jobListingClicks: bigint;
    conversionRate: number;
    recommendationsViewed: bigint;
    interviewStarts: bigint;
}
export interface PaymentSuccessResponse {
    message: string;
    payment: {
        status: string;
        paymentMethod: {
            last4: string;
            brand: string;
        };
        currency: string;
        amount: bigint;
    };
}
export interface CampaignContent {
    headline: string;
    targetAudience: string;
    imageUrl: string;
    ctaText: string;
    bodyText: string;
}
export interface CampaignTemplate {
    id: string;
    headline: string;
    name: string;
    targetAudience: string;
    keywords: Array<string>;
    ctaText: string;
    bodyText: string;
    toneGuidelines: string;
    industry: IndustryCategory;
}
export interface TwilioVerificationStatus {
    errorMessage?: string;
    lastVerified: bigint;
    isValid: boolean;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface StripeVerificationStatus {
    mode?: StripeKeyMode;
    errorMessage?: string;
    lastVerified: bigint;
    isValid: boolean;
}
export interface PaymentCancelResponse {
    message: string;
    sessionId: string;
}
export interface Campaign {
    id: string;
    status: CampaignStatus;
    content: CampaignContent;
    scheduledStart?: bigint;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
    updatedAt: bigint;
    performance?: CampaignPerformanceMetrics;
    scheduledEnd?: bigint;
    budget: bigint;
    utmParameters: {
        source: string;
        campaign: string;
        medium: string;
    };
    industry: IndustryCategory;
}
export interface JobPreference {
    preferredSalary: bigint;
    jobType: string;
    location: string;
}
export interface InterviewResponse {
    question: string;
    answer: string;
}
export interface RecommendationStats {
    timesRecommended: bigint;
    successStories: bigint;
}
export type AnalyticsStatus = {
    __kind__: "error";
    error: string;
} | {
    __kind__: "disconnected";
    disconnected: null;
} | {
    __kind__: "connected";
    connected: null;
};
export interface JobListing {
    title: string;
    description: string;
    company: string;
    skillGap?: SkillGapAnalysis;
    careerContext?: CareerRecommendation;
    requiredSkills: Array<string>;
    location: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MarketingPlatformConfig {
    status: AnalyticsStatus;
    trackingId: string;
}
export interface CampaignPerformanceMetrics {
    ctr: number;
    roi: number;
    clicks: bigint;
    impressions: bigint;
    spend: bigint;
    conversions: bigint;
}
export interface TwilioConfig {
    accountSid: Uint8Array;
    adminPhoneNumber: string;
    authToken: Uint8Array;
    createdAt: bigint;
    lastVerified?: bigint;
    updatedAt: bigint;
    verificationStatus?: TwilioVerificationStatus;
}
export type PaymentStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "confirmed";
    confirmed: null;
} | {
    __kind__: "failed";
    failed: string;
};
export interface CareerRecommendation {
    title: string;
    skillsGaps: Array<string>;
    description: string;
    image: string;
    guidance: string;
}
export interface UserFeedback {
    feedbackType: FeedbackType;
    message: string;
}
export interface UserProfile {
    education: string;
    workHistory: string;
    careerGoals: string;
    skills: Array<string>;
    hobbies: Array<string>;
}
export interface PurchaseNotification {
    paymentMethod: PaymentMethod;
    userId: Principal;
    subscriptionType: string;
    timestamp: bigint;
    amount: bigint;
}
export enum CampaignStatus {
    active = "active",
    completed = "completed",
    draft = "draft",
    paused = "paused"
}
export enum IndustryCategory {
    skilledTrades = "skilledTrades",
    healthcare = "healthcare",
    environmentalAgriculture = "environmentalAgriculture",
    creative = "creative",
    technology = "technology",
    marineOutdoor = "marineOutdoor",
    businessFinance = "businessFinance"
}
export enum PaymentMethod {
    stripeCheckout = "stripeCheckout"
}
export enum StripeKeyMode {
    live = "live",
    test = "test"
}
export enum SubscriptionStatus {
    active = "active",
    cancelled = "cancelled",
    expired = "expired"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adaptJobListingsToCareerContext(listings: Array<JobListing>, careerContext: CareerRecommendation): Promise<Array<JobListing>>;
    analyzeCampaignPerformance(metrics: CampaignMetrics): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelSubscription(): Promise<void>;
    createCampaign(name: string, industry: IndustryCategory, content: CampaignContent, budget: bigint, utmSource: string, utmMedium: string, utmCampaign: string): Promise<string>;
    createCampaignFromTemplate(templateId: string, campaignName: string, budget: bigint, utmSource: string, utmMedium: string, utmCampaign: string): Promise<string>;
    createCampaignTemplate(template: CampaignTemplate): Promise<void>;
    deleteCampaign(campaignId: string): Promise<void>;
    duplicateCampaign(campaignId: string, newName: string): Promise<string>;
    fetchBlob(_content: string): Promise<Uint8Array>;
    fetchExternalBlob(_externalBlob: ExternalBlob): Promise<ExternalBlob>;
    fetchExternalJobListings(apiUrl: string): Promise<string>;
    generateCampaignPreview(campaignId: string): Promise<{
        headline: string;
        imageUrl: string;
        ctaText: string;
        bodyText: string;
        utmUrl: string;
    } | null>;
    generateCareerRecommendations(userProfile: UserProfile): Promise<Array<CareerRecommendation>>;
    getAllCampaignTemplates(): Promise<Array<CampaignTemplate>>;
    getAllCampaigns(): Promise<Array<Campaign>>;
    getAllConversionEvents(): Promise<Array<[Principal, Array<string>]>>;
    getAllFeedbacks(): Promise<Array<UserFeedback>>;
    getAllUsers(): Promise<Array<Principal>>;
    getCaller(): Promise<Principal>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCampaign(campaignId: string): Promise<Campaign | null>;
    getCampaignMetrics(): Promise<CampaignMetrics | null>;
    getCampaignPerformance(campaignId: string): Promise<CampaignPerformanceMetrics | null>;
    getCampaignTemplate(templateId: string): Promise<CampaignTemplate | null>;
    getCampaignTemplatesByIndustry(industry: IndustryCategory): Promise<Array<CampaignTemplate>>;
    getCampaignsByIndustry(industry: IndustryCategory): Promise<Array<Campaign>>;
    getCampaignsByStatus(status: CampaignStatus): Promise<Array<Campaign>>;
    getCareerRecommendations(): Promise<Array<CareerRecommendation>>;
    getConversionEventHistory(): Promise<Array<string>>;
    getFeedbackByUser(user: Principal): Promise<Array<UserFeedback>>;
    getInterviewResponses(): Promise<Array<InterviewResponse>>;
    getJobListings(): Promise<Array<JobListing>>;
    getJobListingsByCareerContext(careerTitle: string): Promise<Array<JobListing>>;
    getJobPreferences(): Promise<JobPreference | null>;
    getMarketingPlatformConfigs(): Promise<Array<[string, MarketingPlatformConfig]> | null>;
    getPaymentStatus(): Promise<PaymentStatus>;
    getPaymentStatusForUser(user: Principal): Promise<PaymentStatus>;
    getPurchaseNotificationHistory(): Promise<Array<PurchaseNotification>>;
    getPurchaseNotificationsEnabled(): Promise<boolean>;
    getRecommendationStats(title: string): Promise<RecommendationStats | null>;
    getSkillGapAnalysis(): Promise<Array<SkillGapAnalysis>>;
    getSortedCareerRecommendations(user: Principal): Promise<Array<CareerRecommendation>>;
    getStripeVerificationHistory(): Promise<Array<StripeVerificationStatus>>;
    getStripeVerificationStatus(): Promise<StripeVerificationStatus | null>;
    getSubscription(): Promise<SubscriptionRecord | null>;
    getSubscriptionForUser(user: Principal): Promise<SubscriptionRecord | null>;
    getTwilioConfig(): Promise<TwilioConfig | null>;
    getTwilioVerificationStatus(): Promise<TwilioVerificationStatus | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasJobListingsWithCareerContext(userId: Principal, careerTitle: string): Promise<boolean>;
    initializeStripePrices(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    manualVerifyStripeKeys(): Promise<StripeVerificationStatus>;
    manualVerifyTwilioConfig(): Promise<TwilioVerificationStatus>;
    paymentCancel(sessionId: string): Promise<PaymentCancelResponse>;
    paymentSuccess(sessionId: string, accountId: string, caffeineCustomerId: string): Promise<PaymentSuccessResponse>;
    retrieveBlob(): Promise<Uint8Array>;
    retryPayment(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveCampaignMetrics(metrics: CampaignMetrics): Promise<void>;
    saveCareerRecommendations(recommendations: Array<CareerRecommendation>): Promise<void>;
    saveInterviewResponses(responses: Array<InterviewResponse>): Promise<void>;
    saveJobListings(listings: Array<JobListing>): Promise<void>;
    saveJobPreferences(jobPreference: JobPreference): Promise<void>;
    saveMarketingPlatformConfig(platform: string, trackingId: string, status: AnalyticsStatus): Promise<void>;
    saveRecommendationStats(title: string, stats: RecommendationStats): Promise<void>;
    saveSkillGapAnalysis(analysis: Array<SkillGapAnalysis>): Promise<void>;
    saveTwilioConfig(accountSid: Uint8Array, authToken: Uint8Array, adminPhoneNumber: string): Promise<void>;
    saveUserFeedback(feedback: UserFeedback): Promise<void>;
    scheduleCampaign(campaignId: string, startTime: bigint, endTime: bigint): Promise<void>;
    sendTestSms(message: string): Promise<TwilioVerificationStatus>;
    setPurchaseNotificationsEnabled(enabled: boolean): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCampaign(campaignId: string, name: string, content: CampaignContent, budget: bigint): Promise<void>;
    updateCampaignMetrics(newMetrics: CampaignMetrics): Promise<void>;
    updateCampaignPerformance(campaignId: string, performance: CampaignPerformanceMetrics): Promise<void>;
    updateCampaignStatus(campaignId: string, status: CampaignStatus): Promise<void>;
    uploadExternalBlob(_externalBlob: ExternalBlob): Promise<void>;
    validatePlatformInstallation(_platform: string, _trackingId: string): Promise<AnalyticsStatus>;
    verifyStripeKeys(): Promise<StripeVerificationStatus>;
    verifyTwilioConfig(): Promise<TwilioVerificationStatus>;
}
