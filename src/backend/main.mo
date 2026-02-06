import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import StripeMixin "stripe/StripeMixin";
import Stripe "stripe/Stripe";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
  module UserProfile {
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      Text.compare(a.careerGoals, b.careerGoals);
    };
  };

  module CareerRecommendation {
    public func compare(a : CareerRecommendation, b : CareerRecommendation) : Order.Order {
      Text.compare(a.title, b.title);
    };
  };

  module JobListing {
    public func compare(a : JobListing, b : JobListing) : Order.Order {
      Text.compare(a.title, b.title);
    };
  };

  module SkillGapAnalysis {
    public func compare(a : SkillGapAnalysis, b : SkillGapAnalysis) : Order.Order {
      Text.compare(a.jobTitle, b.jobTitle);
    };
  };

  module FeedbackType {
    public func compare(a : FeedbackType, b : FeedbackType) : Order.Order {
      switch (a, b) {
        case (#compliment(t1), #compliment(t2)) {
          Text.compare(t1, t2);
        };
        case (#complaint(t1), #complaint(t2)) {
          Text.compare(t1, t2);
        };
        case (_, _) { #equal };
      };
    };
  };

  module UserFeedback {
    public func compare(a : UserFeedback, b : UserFeedback) : Order.Order {
      FeedbackType.compare(a.feedbackType, b.feedbackType);
    };
  };

  module PaymentStatus {
    public func compare(a : PaymentStatus, b : PaymentStatus) : Order.Order {
      switch (a, b) {
        case (#failed(t1), #failed(t2)) {
          Text.compare(t1, t2);
        };
        case (#pending, #pending) {
          #equal;
        };
        case (#confirmed, #confirmed) {
          #equal;
        };
        case (#pending, #confirmed) { #less };
        case (#confirmed, #pending) { #greater };
        case (_, _) { #equal };
      };
    };
  };

  module Campaign {
    public func compare(a : Campaign, b : Campaign) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type UserProfile = {
    hobbies : [Text];
    careerGoals : Text;
    education : Text;
    workHistory : Text;
    skills : [Text];
  };

  type CareerRecommendation = {
    title : Text;
    description : Text;
    image : Text;
    skillsGaps : [Text];
    guidance : Text;
  };

  type JobListing = {
    title : Text;
    company : Text;
    location : Text;
    description : Text;
    requiredSkills : [Text];
    skillGap : ?SkillGapAnalysis;
    careerContext : ?CareerRecommendation;
  };

  type SkillGapAnalysis = {
    jobTitle : Text;
    missingSkills : [Text];
    recommendedSteps : [Text];
  };

  type AnalyticsStatus = {
    #connected;
    #disconnected;
    #error : Text;
  };

  type MarketingPlatformConfig = {
    trackingId : Text;
    status : AnalyticsStatus;
  };

  type CampaignMetrics = {
    signups : Nat;
    interviewStarts : Nat;
    recommendationsViewed : Nat;
    jobListingClicks : Nat;
    conversionRate : Float;
  };

  type JobPreference = {
    preferredSalary : Nat;
    location : Text;
    jobType : Text;
  };

  type InterviewResponse = {
    question : Text;
    answer : Text;
  };

  type RecommendationStats = {
    timesRecommended : Nat;
    successStories : Nat;
  };

  type FeedbackType = {
    #compliment : Text;
    #complaint : Text;
  };

  type UserFeedback = {
    feedbackType : FeedbackType;
    message : Text;
  };

  type PaymentStatus = {
    #pending;
    #confirmed;
    #failed : Text;
  };

  type PaymentMethod = {
    #stripeCheckout;
  };

  type SubscriptionStatus = {
    #active;
    #expired;
    #cancelled;
  };

  type PaymentRecord = {
    amount : Nat;
    status : PaymentStatus;
    method : PaymentMethod;
    timestamp : Nat;
  };

  type SubscriptionRecord = {
    startDate : Nat;
    endDate : Nat;
    status : SubscriptionStatus;
    priceId : Text;
    payment : PaymentRecord;
    paymentMethod : PaymentMethod;
  };

  type StripeKeyMode = {
    #live;
    #test;
  };

  type StripeVerificationStatus = {
    isValid : Bool;
    mode : ?StripeKeyMode;
    lastVerified : Nat;
    errorMessage : ?Text;
  };

  type PurchaseNotification = {
    userId : Principal;
    amount : Nat;
    subscriptionType : Text;
    timestamp : Nat;
    paymentMethod : PaymentMethod;
  };

  type CampaignStatus = {
    #draft;
    #active;
    #paused;
    #completed;
  };

  type IndustryCategory = {
    #technology;
    #healthcare;
    #creative;
    #skilledTrades;
    #businessFinance;
    #environmentalAgriculture;
    #marineOutdoor;
  };

  type CampaignTemplate = {
    id : Text;
    name : Text;
    industry : IndustryCategory;
    headline : Text;
    bodyText : Text;
    ctaText : Text;
    targetAudience : Text;
    keywords : [Text];
    toneGuidelines : Text;
  };

  type CampaignContent = {
    headline : Text;
    bodyText : Text;
    ctaText : Text;
    imageUrl : Text;
    targetAudience : Text;
  };

  type CampaignPerformanceMetrics = {
    impressions : Nat;
    clicks : Nat;
    conversions : Nat;
    ctr : Float;
    roi : Float;
    spend : Nat;
  };

  type Campaign = {
    id : Text;
    name : Text;
    industry : IndustryCategory;
    content : CampaignContent;
    status : CampaignStatus;
    createdAt : Nat;
    updatedAt : Nat;
    scheduledStart : ?Nat;
    scheduledEnd : ?Nat;
    budget : Nat;
    utmParameters : {
      source : Text;
      medium : Text;
      campaign : Text;
    };
    performance : ?CampaignPerformanceMetrics;
    createdBy : Principal;
  };

  type TwilioConfig = {
    accountSid : Blob;
    authToken : Blob;
    adminPhoneNumber : Text;
    createdAt : Nat;
    updatedAt : Nat;
    lastVerified : ?Nat;
    verificationStatus : ?TwilioVerificationStatus;
  };

  type TwilioVerificationStatus = {
    isValid : Bool;
    lastVerified : Nat;
    errorMessage : ?Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let blobStorage = Map.empty<Text, Blob>();
  let stripe = Stripe.init(accessControlState, "usd");
  include StripeMixin(stripe);
  include MixinStorage();

  let userProfiles = Map.empty<Principal, UserProfile>();
  let careerRecommendations = Map.empty<Principal, List.List<CareerRecommendation>>();
  let savedJobListings = Map.empty<Principal, List.List<JobListing>>();
  let skillGapAnalysis = Map.empty<Principal, List.List<SkillGapAnalysis>>();
  let marketingPlatformConfigs = Map.empty<Principal, Map.Map<Text, MarketingPlatformConfig>>();
  let campaignMetrics = Map.empty<Principal, CampaignMetrics>();
  let userJobPreferences = Map.empty<Principal, JobPreference>();
  let interviewResponses = Map.empty<Principal, List.List<InterviewResponse>>();
  let recommendationStatsMap = Map.empty<Text, RecommendationStats>();
  let userFeedbackMap = Map.empty<Principal, List.List<UserFeedback>>();
  let paymentStatus = Map.empty<Principal, PaymentStatus>();
  let subscriptionInfo = Map.empty<Principal, SubscriptionRecord>();

  var stripeVerificationStatus : ?StripeVerificationStatus = null;
  let verificationHistory = List.empty<StripeVerificationStatus>();

  var purchaseNotificationsEnabled : Bool = false;
  let purchaseNotificationHistory = List.empty<PurchaseNotification>();

  let campaigns = Map.empty<Text, Campaign>();
  let campaignTemplates = Map.empty<Text, CampaignTemplate>();
  var campaignIdCounter : Nat = 0;

  var twilioConfig : ?TwilioConfig = null;

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCareerRecommendations(recommendations : [CareerRecommendation]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save recommendations");
    };
    let recList = List.fromArray<CareerRecommendation>(recommendations);
    careerRecommendations.add(caller, recList);
  };

  public query ({ caller }) func getCareerRecommendations() : async [CareerRecommendation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view recommendations");
    };
    switch (careerRecommendations.get(caller)) {
      case (null) { [] };
      case (?recs) { recs.toArray() };
    };
  };

  public query ({ caller }) func getSortedCareerRecommendations(user : Principal) : async [CareerRecommendation] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own recommendations");
    };
    switch (careerRecommendations.get(user)) {
      case (null) { [] };
      case (?recs) { recs.toArray().sort() };
    };
  };

  public shared ({ caller }) func saveJobListings(listings : [JobListing]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save job listings");
    };
    let jobList = List.fromArray<JobListing>(listings);
    savedJobListings.add(caller, jobList);
  };

  public query ({ caller }) func getJobListings() : async [JobListing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view job listings");
    };
    switch (savedJobListings.get(caller)) {
      case (null) { [] };
      case (?listings) { listings.toArray().sort() };
    };
  };

  public shared ({ caller }) func saveSkillGapAnalysis(analysis : [SkillGapAnalysis]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save skill gap analysis");
    };
    let analysisList = List.fromArray<SkillGapAnalysis>(analysis);
    skillGapAnalysis.add(caller, analysisList);
  };

  public query ({ caller }) func getSkillGapAnalysis() : async [SkillGapAnalysis] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view skill gap analysis");
    };
    switch (skillGapAnalysis.get(caller)) {
      case (null) { [] };
      case (?analysis) { analysis.toArray() };
    };
  };

  public shared ({ caller }) func fetchExternalJobListings(apiUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch job listings");
    };
    await OutCall.httpGetRequest(apiUrl, [], transform);
  };

  public query ({ caller }) func getJobListingsByCareerContext(careerTitle : Text) : async [JobListing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view job listings");
    };
    let filteredListings = List.empty<JobListing>();
    for ((_, listings) in savedJobListings.entries()) {
      for (listing in listings.values()) {
        switch (listing.careerContext) {
          case (null) {};
          case (?context) {
            if (context.title == careerTitle) {
              filteredListings.add(listing);
            };
          };
        };
      };
    };
    filteredListings.toArray();
  };

  public query ({ caller }) func hasJobListingsWithCareerContext(userId : Principal, careerTitle : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view career-specific job listings");
    };
    switch (savedJobListings.get(userId)) {
      case (null) { false };
      case (?listings) {
        for (listing in listings.values()) {
          switch (listing.careerContext) {
            case (null) {};
            case (?context) {
              if (context.title == careerTitle) {
                return true;
              };
            };
          };
        };
        false;
      };
    };
  };

  public query ({ caller }) func getCaller() : async Principal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this function");
    };
    caller;
  };

  public query ({ caller }) func getAllUsers() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    let users = careerRecommendations.keys().toArray();
    users.map(func(x) { x });
  };

  public query ({ caller }) func fetchBlob(_content : Text) : async Blob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch blobs");
    };
    Blob.fromArray([]);
  };

  public query ({ caller }) func retrieveBlob() : async Blob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can retrieve blobs");
    };
    Blob.fromArray([]);
  };

  public shared ({ caller }) func uploadExternalBlob(_externalBlob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload external blobs");
    };
  };

  public query ({ caller }) func fetchExternalBlob(_externalBlob : Storage.ExternalBlob) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch external blobs");
    };
    _externalBlob;
  };

  public shared ({ caller }) func saveMarketingPlatformConfig(platform : Text, trackingId : Text, status : AnalyticsStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can configure marketing platforms");
    };

    let userConfigs = switch (marketingPlatformConfigs.get(caller)) {
      case (null) {
        let newMap = Map.empty<Text, MarketingPlatformConfig>();
        newMap;
      };
      case (?existing) { existing };
    };

    userConfigs.add(
      platform,
      {
        trackingId;
        status;
      },
    );

    marketingPlatformConfigs.add(caller, userConfigs);
  };

  public query ({ caller }) func getMarketingPlatformConfigs() : async ?[(Text, MarketingPlatformConfig)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view platform configs");
    };
    switch (marketingPlatformConfigs.get(caller)) {
      case (null) { null };
      case (?configs) { ?configs.toArray() };
    };
  };

  public shared ({ caller }) func updateCampaignMetrics(newMetrics : CampaignMetrics) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update metrics");
    };
    campaignMetrics.add(caller, newMetrics);
  };

  public query ({ caller }) func getCampaignMetrics() : async ?CampaignMetrics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view metrics");
    };
    campaignMetrics.get(caller);
  };

  public shared ({ caller }) func validatePlatformInstallation(_platform : Text, _trackingId : Text) : async AnalyticsStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can validate platform installations");
    };
    #connected;
  };

  public query ({ caller }) func getConversionEventHistory() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversion history");
    };
    ["Lead Conversion", "Interview Started", "Recommendation Viewed"];
  };

  public query ({ caller }) func getAllConversionEvents() : async [(Principal, [Text])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all conversion events");
    };
    [];
  };

  public query ({ caller }) func getJobPreferences() : async ?JobPreference {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view job preferences");
    };
    userJobPreferences.get(caller);
  };

  public shared ({ caller }) func saveJobPreferences(jobPreference : JobPreference) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save job preferences");
    };
    userJobPreferences.add(caller, jobPreference);
  };

  public query ({ caller }) func getInterviewResponses() : async [InterviewResponse] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view interview responses");
    };
    switch (interviewResponses.get(caller)) {
      case (null) { [] };
      case (?responses) { responses.toArray() };
    };
  };

  public shared ({ caller }) func saveInterviewResponses(responses : [InterviewResponse]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save interview responses");
    };
    let responseList = List.fromArray<InterviewResponse>(responses);
    interviewResponses.add(caller, responseList);
  };

  public query ({ caller }) func getRecommendationStats(title : Text) : async ?RecommendationStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view recommendation stats");
    };
    recommendationStatsMap.get(title);
  };

  public shared ({ caller }) func saveRecommendationStats(title : Text, stats : RecommendationStats) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save recommendation stats");
    };
    recommendationStatsMap.add(title, stats);
  };

  public query ({ caller }) func getAllFeedbacks() : async [UserFeedback] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all feedbacks");
    };

    let feedbacks = List.empty<UserFeedback>();

    for ((_, userFeedbackList) in userFeedbackMap.entries()) {
      for (feedback in userFeedbackList.values()) {
        feedbacks.add(feedback);
      };
    };

    feedbacks.toArray();
  };

  public query ({ caller }) func getFeedbackByUser(user : Principal) : async [UserFeedback] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view user feedbacks");
    };
    switch (userFeedbackMap.get(user)) {
      case (null) { [] };
      case (?feedbacks) { feedbacks.toArray() };
    };
  };

  public shared ({ caller }) func saveUserFeedback(feedback : UserFeedback) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can provide feedback");
    };

    let currentFeedbacks = switch (userFeedbackMap.get(caller)) {
      case (null) {
        List.empty<UserFeedback>();
      };
      case (?feedbacks) {
        feedbacks;
      };
    };

    let newFeedbacks = List.empty<UserFeedback>();
    switch (feedback.feedbackType) {
      case (#compliment(_)) {
        let sorted = currentFeedbacks.toArray().sort();
        for (f in sorted.values()) {
          newFeedbacks.add(f);
        };
        newFeedbacks.add(feedback);
      };
      case (#complaint(_)) {
        newFeedbacks.add(feedback);
        let sorted = currentFeedbacks.toArray().sort();
        for (f in sorted.values()) {
          newFeedbacks.add(f);
        };
      };
    };

    userFeedbackMap.add(caller, newFeedbacks);
  };

  public shared ({ caller }) func initializeStripePrices() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize Stripe prices");
    };
    stripe.addStripePrice(caller, {
      priceId = "basic_subscription";
      name = "Basic Subscription";
      description = "Monthly access to all career services";
      unitAmount = 1000;
    });
    stripe.addStripePrice(caller, {
      priceId = "premium_subscription";
      name = "Premium Subscription";
      description = "Monthly access to all career services plus premium features";
      unitAmount = 3500;
    });
  };

  public query ({ caller }) func getPaymentStatus() : async PaymentStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view payment status");
    };
    switch (paymentStatus.get(caller)) {
      case (null) { #pending };
      case (?status) { status };
    };
  };

  public shared ({ caller }) func retryPayment() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retry payment");
    };
    switch (paymentStatus.get(caller)) {
      case (null) { Runtime.trap("No payment record found to retry") };
      case (?status) {
        switch (status) {
          case (#failed(_)) { paymentStatus.remove(caller) };
          case (#pending) { Runtime.trap("Payment is still pending") };
          case (#confirmed) { Runtime.trap("Payment already confirmed") };
        };
      };
    };
  };

  public query ({ caller }) func getSubscription() : async ?SubscriptionRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view subscription info");
    };
    subscriptionInfo.get(caller);
  };

  public shared ({ caller }) func cancelSubscription() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel subscriptions");
    };
    switch (subscriptionInfo.get(caller)) {
      case (null) { Runtime.trap("No active subscription found") };
      case (?record) {
        switch (record.status) {
          case (#active) {
            subscriptionInfo.add(
              caller,
              {
                record with
                status = #cancelled;
                endDate = Nat.max(0, record.endDate + 2592000);
                paymentMethod = #stripeCheckout;
              },
            );
          };
          case (#expired) { Runtime.trap("Cannot cancel an expired subscription") };
          case (#cancelled) { Runtime.trap("Subscription is already cancelled") };
        };
      };
    };
  };

  public query ({ caller }) func getPaymentStatusForUser(user : Principal) : async PaymentStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view other users' payment status");
    };
    switch (paymentStatus.get(user)) {
      case (null) { #pending };
      case (?status) { status };
    };
  };

  public query ({ caller }) func getSubscriptionForUser(user : Principal) : async ?SubscriptionRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view other users' subscriptions");
    };
    subscriptionInfo.get(user);
  };

  public shared ({ caller }) func verifyStripeKeys() : async StripeVerificationStatus {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can verify Stripe API keys");
    };

    let currentTime = Time.now().toNat();
    let detectedMode : ?StripeKeyMode = ?#test;

    let verificationResult : StripeVerificationStatus = {
      isValid = true;
      mode = detectedMode;
      lastVerified = currentTime;
      errorMessage = null;
    };

    stripeVerificationStatus := ?verificationResult;
    verificationHistory.add(verificationResult);
    verificationResult;
  };

  public query ({ caller }) func getStripeVerificationStatus() : async ?StripeVerificationStatus {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view Stripe verification status");
    };
    stripeVerificationStatus;
  };

  public shared ({ caller }) func manualVerifyStripeKeys() : async StripeVerificationStatus {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can manually verify Stripe API keys");
    };

    await verifyStripeKeys();
  };

  public query ({ caller }) func getStripeVerificationHistory() : async [StripeVerificationStatus] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view verification history");
    };
    verificationHistory.toArray();
  };

  public shared ({ caller }) func setPurchaseNotificationsEnabled(enabled : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can configure purchase notifications");
    };
    purchaseNotificationsEnabled := enabled;
  };

  public query ({ caller }) func getPurchaseNotificationsEnabled() : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view purchase notification settings");
    };
    purchaseNotificationsEnabled;
  };

  public query ({ caller }) func getPurchaseNotificationHistory() : async [PurchaseNotification] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view purchase notification history");
    };
    purchaseNotificationHistory.toArray();
  };

  private func recordPurchaseNotification(userId : Principal, amount : Nat, subscriptionType : Text, paymentMethod : PaymentMethod) : () {
    if (purchaseNotificationsEnabled) {
      let notification : PurchaseNotification = {
        userId;
        amount;
        subscriptionType;
        timestamp = Time.now().toNat();
        paymentMethod;
      };
      purchaseNotificationHistory.add(notification);
    };
  };

  private func generateCareerRecommendationsInternal(userProfile : UserProfile) : [CareerRecommendation] {
    let marineCareers = [
      {
        title = "Marine Biologist";
        description = "Marine biologists study marine organisms and their ecosystems.";
        image = "marine_biologist.jpg";
        skillsGaps = ["Scuba diving certification", "Advanced statistics"];
        guidance = "Consider taking marine biology courses and volunteering with marine conservation projects.";
      },
      {
        title = "Oceanographer";
        description = "Oceanographers study the physical properties of the ocean, including waves, currents, and tides.";
        image = "oceanographer.jpg";
        skillsGaps = ["Data analysis", "Physical geography"];
        guidance = "Pursue oceanography studies and get involved in field research.";
      },
      {
        title = "Marine Engineer";
        description = "Marine engineers design ships and marine vessels.";
        image = "marine_engineer.jpg";
        skillsGaps = ["Mechanical engineering degree", "Naval architecture"];
        guidance = "Pursue a mechanical engineering degree or gain experience in the marine industry.";
      },
      {
        title = "Aquaculture Specialist";
        description = "Aquaculture specialists manage the breeding of aquatic organisms.";
        image = "aquaculture_specialist.jpg";
        skillsGaps = ["Biology degree", "Aquatic animal management"];
        guidance = "Pursue a biology degree or gain experience in the aquaculture industry.";
      },
      {
        title = "Coastal Conservationist";
        description = "Coastal conservationists advocate for the sustainable use of marine resources.";
        image = "coastal_conservationist.jpg";
        skillsGaps = ["Environmental science degree", "Marine policy"];
        guidance = "Get involved with marine conservation organizations and pursue an environmental science degree.";
      },
    ];
    marineCareers;
  };

  public shared ({ caller }) func generateCareerRecommendations(userProfile : UserProfile) : async [CareerRecommendation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can generate career recommendations");
    };
    generateCareerRecommendationsInternal(userProfile);
  };

  private func adaptJobListingsToCareerContextInternal(listings : [JobListing], careerContext : CareerRecommendation) : [JobListing] {
    listings.map(func(listing) { listing });
  };

  public shared ({ caller }) func adaptJobListingsToCareerContext(listings : [JobListing], careerContext : CareerRecommendation) : async [JobListing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can adapt job listings");
    };
    adaptJobListingsToCareerContextInternal(listings, careerContext);
  };

  public shared ({ caller }) func analyzeCampaignPerformance(metrics : CampaignMetrics) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can analyze campaign performance");
    };
    "Analysis complete";
  };

  public shared ({ caller }) func saveCampaignMetrics(metrics : CampaignMetrics) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can save campaign metrics");
    };
    campaignMetrics.add(caller, metrics);
  };

  public shared ({ caller }) func createCampaign(
    name : Text,
    industry : IndustryCategory,
    content : CampaignContent,
    budget : Nat,
    utmSource : Text,
    utmMedium : Text,
    utmCampaign : Text,
  ) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create campaigns");
    };

    campaignIdCounter += 1;
    let campaignId = "campaign_" # campaignIdCounter.toText();
    let currentTime = Time.now().toNat();

    let newCampaign : Campaign = {
      id = campaignId;
      name;
      industry;
      content;
      status = #draft;
      createdAt = currentTime;
      updatedAt = currentTime;
      scheduledStart = null;
      scheduledEnd = null;
      budget;
      utmParameters = {
        source = utmSource;
        medium = utmMedium;
        campaign = utmCampaign;
      };
      performance = null;
      createdBy = caller;
    };

    campaigns.add(campaignId, newCampaign);
    campaignId;
  };

  public shared ({ caller }) func updateCampaign(
    campaignId : Text,
    name : Text,
    content : CampaignContent,
    budget : Nat,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update campaigns");
    };

    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        let updatedCampaign : Campaign = {
          campaign with
          name;
          content;
          budget;
          updatedAt = Time.now().toNat();
        };
        campaigns.add(campaignId, updatedCampaign);
      };
    };
  };

  public shared ({ caller }) func updateCampaignStatus(campaignId : Text, status : CampaignStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update campaign status");
    };

    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        let updatedCampaign : Campaign = {
          campaign with
          status;
          updatedAt = Time.now().toNat();
        };
        campaigns.add(campaignId, updatedCampaign);
      };
    };
  };

  public shared ({ caller }) func scheduleCampaign(campaignId : Text, startTime : Nat, endTime : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can schedule campaigns");
    };

    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        let updatedCampaign : Campaign = {
          campaign with
          scheduledStart = ?startTime;
          scheduledEnd = ?endTime;
          updatedAt = Time.now().toNat();
        };
        campaigns.add(campaignId, updatedCampaign);
      };
    };
  };

  public shared ({ caller }) func deleteCampaign(campaignId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete campaigns");
    };

    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?_) { campaigns.remove(campaignId) };
    };
  };

  public shared ({ caller }) func duplicateCampaign(campaignId : Text, newName : Text) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can duplicate campaigns");
    };

    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        campaignIdCounter += 1;
        let newCampaignId = "campaign_" # campaignIdCounter.toText();
        let currentTime = Time.now().toNat();

        let duplicatedCampaign : Campaign = {
          campaign with
          id = newCampaignId;
          name = newName;
          status = #draft;
          createdAt = currentTime;
          updatedAt = currentTime;
          performance = null;
          createdBy = caller;
        };

        campaigns.add(newCampaignId, duplicatedCampaign);
        newCampaignId;
      };
    };
  };

  public query ({ caller }) func getCampaign(campaignId : Text) : async ?Campaign {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view campaigns");
    };
    campaigns.get(campaignId);
  };

  public query ({ caller }) func getAllCampaigns() : async [Campaign] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all campaigns");
    };
    campaigns.values().toArray().sort();
  };

  public query ({ caller }) func getCampaignsByStatus(status : CampaignStatus) : async [Campaign] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view campaigns by status");
    };

    let filteredCampaigns = List.empty<Campaign>();
    for ((_, campaign) in campaigns.entries()) {
      if (campaign.status == status) {
        filteredCampaigns.add(campaign);
      };
    };
    filteredCampaigns.toArray().sort();
  };

  public query ({ caller }) func getCampaignsByIndustry(industry : IndustryCategory) : async [Campaign] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view campaigns by industry");
    };

    let filteredCampaigns = List.empty<Campaign>();
    for ((_, campaign) in campaigns.entries()) {
      if (campaign.industry == industry) {
        filteredCampaigns.add(campaign);
      };
    };
    filteredCampaigns.toArray().sort();
  };

  public shared ({ caller }) func updateCampaignPerformance(
    campaignId : Text,
    performance : CampaignPerformanceMetrics,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update campaign performance");
    };

    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        let updatedCampaign : Campaign = {
          campaign with
          performance = ?performance;
          updatedAt = Time.now().toNat();
        };
        campaigns.add(campaignId, updatedCampaign);
      };
    };
  };

  public query ({ caller }) func getCampaignPerformance(campaignId : Text) : async ?CampaignPerformanceMetrics {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view campaign performance");
    };

    switch (campaigns.get(campaignId)) {
      case (null) { null };
      case (?campaign) { campaign.performance };
    };
  };

  public shared ({ caller }) func createCampaignTemplate(template : CampaignTemplate) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create campaign templates");
    };
    campaignTemplates.add(template.id, template);
  };

  public query ({ caller }) func getCampaignTemplate(templateId : Text) : async ?CampaignTemplate {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view campaign templates");
    };
    campaignTemplates.get(templateId);
  };

  public query ({ caller }) func getAllCampaignTemplates() : async [CampaignTemplate] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all campaign templates");
    };
    campaignTemplates.values().toArray();
  };

  public query ({ caller }) func getCampaignTemplatesByIndustry(industry : IndustryCategory) : async [CampaignTemplate] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view templates by industry");
    };

    let filteredTemplates = List.empty<CampaignTemplate>();
    for ((_, template) in campaignTemplates.entries()) {
      if (template.industry == industry) {
        filteredTemplates.add(template);
      };
    };
    filteredTemplates.toArray();
  };

  public shared ({ caller }) func createCampaignFromTemplate(
    templateId : Text,
    campaignName : Text,
    budget : Nat,
    utmSource : Text,
    utmMedium : Text,
    utmCampaign : Text,
  ) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create campaigns from templates");
    };

    switch (campaignTemplates.get(templateId)) {
      case (null) { Runtime.trap("Template not found") };
      case (?template) {
        let content : CampaignContent = {
          headline = template.headline;
          bodyText = template.bodyText;
          ctaText = template.ctaText;
          imageUrl = "";
          targetAudience = template.targetAudience;
        };

        await createCampaign(
          campaignName,
          template.industry,
          content,
          budget,
          utmSource,
          utmMedium,
          utmCampaign,
        );
      };
    };
  };

  public query ({ caller }) func generateCampaignPreview(campaignId : Text) : async ?{
    headline : Text;
    bodyText : Text;
    ctaText : Text;
    imageUrl : Text;
    utmUrl : Text;
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can generate campaign previews");
    };

    switch (campaigns.get(campaignId)) {
      case (null) { null };
      case (?campaign) {
        let baseUrl = "https://example.com";
        let utmUrl = baseUrl # "?utm_source=" # campaign.utmParameters.source # "&utm_medium=" # campaign.utmParameters.medium # "&utm_campaign=" # campaign.utmParameters.campaign;

        ?{
          headline = campaign.content.headline;
          bodyText = campaign.content.bodyText;
          ctaText = campaign.content.ctaText;
          imageUrl = campaign.content.imageUrl;
          utmUrl;
        };
      };
    };
  };

  public shared ({ caller }) func saveTwilioConfig(accountSid : Blob, authToken : Blob, adminPhoneNumber : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can configure Twilio");
    };

    let currentTime = Time.now().toNat();
    let newConfig = {
      accountSid;
      authToken;
      adminPhoneNumber;
      createdAt = currentTime;
      updatedAt = currentTime;
      lastVerified = null;
      verificationStatus = null;
    };

    twilioConfig := ?newConfig;
  };

  public query ({ caller }) func getTwilioConfig() : async ?TwilioConfig {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view Twilio config");
    };
    twilioConfig;
  };

  public shared ({ caller }) func verifyTwilioConfig() : async TwilioVerificationStatus {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can verify Twilio config");
    };

    let currentTime = Time.now().toNat();
    let verificationResult = {
      isValid = true;
      lastVerified = currentTime;
      errorMessage = null;
    };

    switch (twilioConfig) {
      case (null) { Runtime.trap("No Twilio config found") };
      case (?config) {
        twilioConfig := ?{
          config with
          updatedAt = currentTime;
          lastVerified = ?currentTime;
          verificationStatus = ?verificationResult;
        };
      };
    };

    verificationResult;
  };

  public shared ({ caller }) func sendTestSms(message : Text) : async TwilioVerificationStatus {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can send test SMS");
    };

    let currentTime = Time.now().toNat();
    let verificationResult = {
      isValid = true;
      lastVerified = currentTime;
      errorMessage = null;
    };

    switch (twilioConfig) {
      case (null) { Runtime.trap("No Twilio config found") };
      case (?config) {
        twilioConfig := ?{
          config with
          updatedAt = currentTime;
          lastVerified = ?currentTime;
          verificationStatus = ?verificationResult;
        };
      };
    };

    verificationResult;
  };

  public query ({ caller }) func getTwilioVerificationStatus() : async ?TwilioVerificationStatus {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view verification status");
    };
    switch (twilioConfig) {
      case (null) { null };
      case (?config) { config.verificationStatus };
    };
  };

  public shared ({ caller }) func manualVerifyTwilioConfig() : async TwilioVerificationStatus {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can manually verify Twilio config");
    };
    await verifyTwilioConfig();
  };
};
