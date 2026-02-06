import { useState, useEffect } from 'react';
import { useFetchLiveJobs, useSaveJobListings, useGetJobListings, useGetCallerUserProfile, useSaveSkillGapAnalysis, useGetSkillGapAnalysis } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Briefcase, MapPin, Building2, Search, ExternalLink, AlertCircle, CheckCircle2, BookOpen, GraduationCap, Clock, Target, X, Loader2, WifiOff } from 'lucide-react';
import type { JobListing, SkillGapAnalysis, CareerRecommendation } from '../backend';

interface JobListingsSectionProps {
  selectedCareer?: CareerRecommendation | null;
  onClearCareer: () => void;
}

export default function JobListingsSection({ selectedCareer, onClearCareer }: JobListingsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [liveJobs, setLiveJobs] = useState<JobListing[]>([]);
  
  const fetchLiveJobs = useFetchLiveJobs();
  const saveJobs = useSaveJobListings();
  const { data: savedJobs } = useGetJobListings();
  const { data: userProfile } = useGetCallerUserProfile();
  const saveSkillGapAnalysis = useSaveSkillGapAnalysis();
  const { data: skillGapAnalysis } = useGetSkillGapAnalysis();

  // Generate skill gap analysis for each job
  const generateSkillGapAnalysis = (job: JobListing): SkillGapAnalysis => {
    const userSkills = userProfile?.skills || [];
    const missingSkills = job.requiredSkills.filter(
      (skill) => !userSkills.some((userSkill) => userSkill.toLowerCase().includes(skill.toLowerCase()))
    );

    const recommendedSteps: string[] = [];

    if (missingSkills.length === 0) {
      recommendedSteps.push('You have all the required skills! Apply now to showcase your qualifications.');
      recommendedSteps.push('Prepare a tailored resume highlighting your relevant experience.');
      recommendedSteps.push('Research the company culture and prepare thoughtful interview questions.');
    } else if (missingSkills.length <= 2) {
      recommendedSteps.push(`Focus on developing: ${missingSkills.join(', ')}`);
      recommendedSteps.push('Consider online courses on platforms like Coursera, Udemy, or LinkedIn Learning (2-4 weeks).');
      recommendedSteps.push('Build a portfolio project demonstrating these skills.');
      recommendedSteps.push('Apply with a strong cover letter explaining your learning plan.');
    } else if (missingSkills.length <= 4) {
      recommendedSteps.push(`Priority skills to develop: ${missingSkills.slice(0, 2).join(', ')}`);
      recommendedSteps.push('Enroll in a comprehensive bootcamp or certification program (2-3 months).');
      recommendedSteps.push('Gain practical experience through freelance projects or open-source contributions.');
      recommendedSteps.push('Network with professionals in this field through LinkedIn and industry events.');
      recommendedSteps.push('Consider applying for junior or mid-level positions to gain experience.');
    } else {
      recommendedSteps.push('This role requires significant skill development. Consider a structured learning path.');
      recommendedSteps.push(`Start with foundational skills: ${missingSkills.slice(0, 3).join(', ')}`);
      recommendedSteps.push('Pursue a formal degree, bootcamp, or extensive certification program (6-12 months).');
      recommendedSteps.push('Seek mentorship from professionals in this field.');
      recommendedSteps.push('Build a comprehensive portfolio showcasing projects in this domain.');
      recommendedSteps.push('Look for entry-level or internship positions to gain industry experience.');
    }

    return {
      jobTitle: job.title,
      missingSkills,
      recommendedSteps,
    };
  };

  // Auto-generate skill gap analysis when jobs are loaded
  useEffect(() => {
    const allJobs = liveJobs.length > 0 ? liveJobs : savedJobs || [];
    if (allJobs.length > 0 && userProfile) {
      const analysis = allJobs.map(generateSkillGapAnalysis);
      saveSkillGapAnalysis.mutate(analysis);
    }
  }, [liveJobs, savedJobs, userProfile]);

  // Automatically search for jobs when a career is selected
  useEffect(() => {
    if (selectedCareer && !hasAutoSearched) {
      setSearchQuery(selectedCareer.title);
      setHasAutoSearched(true);
      performSearch(selectedCareer.title, locationQuery);
    }
  }, [selectedCareer, hasAutoSearched]);

  const performSearch = async (query: string, location?: string) => {
    if (!query.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setApiError(null);
    
    try {
      // Fetch live jobs from public APIs
      const result = await fetchLiveJobs.mutateAsync({ 
        query: query.trim(),
        location: location?.trim() || undefined
      });

      if (result.length > 0) {
        // Add career context to jobs
        const jobsWithContext = result.map(job => ({
          ...job,
          careerContext: selectedCareer || undefined,
        }));
        
        setLiveJobs(jobsWithContext);
        
        // Save to backend for persistence
        try {
          await saveJobs.mutateAsync(jobsWithContext);
        } catch (saveError) {
          console.warn('Failed to save jobs to backend:', saveError);
        }
        
        toast.success(`Found ${result.length} live job listings${selectedCareer ? ` for ${selectedCareer.title}` : ''}`);
      } else {
        setApiError('No jobs found. Try different search terms or check your API configuration.');
        toast.info('No jobs found. Try a different search term or location.');
      }
    } catch (error: any) {
      console.error('Job search error:', error);
      
      let errorMessage = 'Failed to fetch job listings. ';
      
      if (error.message?.includes('API key not configured')) {
        errorMessage += 'API credentials are not configured. Please add VITE_JSEARCH_API_KEY or VITE_ADZUNA_APP_ID/VITE_ADZUNA_APP_KEY to your environment variables.';
      } else if (error.message?.includes('API error')) {
        errorMessage += 'The job API is temporarily unavailable. Please try again in a few moments.';
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }
      
      setApiError(errorMessage);
      toast.error('Job search failed. See details below.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    await performSearch(searchQuery, locationQuery);
  };

  const handleClearCareerContext = () => {
    setSearchQuery('');
    setLocationQuery('');
    setHasAutoSearched(false);
    setLiveJobs([]);
    setApiError(null);
    onClearCareer();
  };

  const handleRetry = () => {
    if (searchQuery) {
      performSearch(searchQuery, locationQuery);
    }
  };

  const displayJobs = liveJobs.length > 0 ? liveJobs : savedJobs || [];

  const getSkillGapForJob = (jobTitle: string): SkillGapAnalysis | undefined => {
    return skillGapAnalysis?.find((analysis) => analysis.jobTitle === jobTitle);
  };

  const getSkillMatchPercentage = (job: JobListing): number => {
    const userSkills = userProfile?.skills || [];
    if (job.requiredSkills.length === 0) return 100;
    
    const matchedSkills = job.requiredSkills.filter((skill) =>
      userSkills.some((userSkill) => userSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    
    return Math.round((matchedSkills.length / job.requiredSkills.length) * 100);
  };

  return (
    <section className="py-10 sm:py-12 md:py-14 lg:py-16">
      <div className="container max-w-6xl px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Live Job Opportunities
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">Real-Time Job Listings</h2>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            {selectedCareer 
              ? `Explore live opportunities in ${selectedCareer.title}` 
              : 'Search for real job opportunities from public job APIs'}
          </p>
        </div>

        {/* Career Context Alert */}
        {selectedCareer && (
          <Alert className="mb-6 sm:mb-8 border-2 border-primary/20 bg-primary/5">
            <Target className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <span className="font-semibold">Searching for: </span>
                <span className="text-muted-foreground">{selectedCareer.title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCareerContext}
                className="gap-2 flex-shrink-0"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* API Error Alert */}
        {apiError && (
          <Alert className="mb-6 sm:mb-8 border-2 border-destructive/20 bg-destructive/5">
            <WifiOff className="h-4 w-4 text-destructive" />
            <AlertDescription className="space-y-3">
              <p className="text-sm">{apiError}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isSearching}
                  className="gap-2"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    'Retry Search'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setApiError(null)}
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 sm:mb-8">
          <CardContent className="pt-5 sm:pt-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Search by job title or keywords (e.g., Software Engineer, Data Analyst)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
              />
              <Input
                placeholder="Location (optional, e.g., New York, Remote)..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="sm:w-64 h-11 sm:h-12 text-sm sm:text-base"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()} 
                className="gap-2 h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Powered by live job APIs (JSearch & Adzuna). Results are fetched in real-time.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {displayJobs.map((job, index) => {
            const skillGap = getSkillGapForJob(job.title);
            const matchPercentage = getSkillMatchPercentage(job);
            const userSkills = userProfile?.skills || [];
            const matchedSkills = job.requiredSkills.filter((skill) =>
              userSkills.some((userSkill) => userSkill.toLowerCase().includes(skill.toLowerCase()))
            );

            return (
              <Card key={index} className="hover:shadow-lg transition-shadow border-2">
                <CardHeader className="p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl">{job.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{job.company}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </span>
                      </div>
                      {job.careerContext && (
                        <Badge variant="outline" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Matched to: {job.careerContext.title}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-start sm:items-end">
                      {liveJobs.includes(job) && (
                        <Badge variant="default" className="text-xs sm:text-sm flex-shrink-0 bg-green-600">
                          Live
                        </Badge>
                      )}
                      <Badge 
                        variant={matchPercentage >= 80 ? "default" : matchPercentage >= 50 ? "secondary" : "outline"}
                        className="text-xs sm:text-sm flex-shrink-0"
                      >
                        {matchPercentage}% Match
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-5 md:p-6 pt-0">
                  <CardDescription className="text-sm sm:text-base leading-relaxed line-clamp-3">
                    {job.description}
                  </CardDescription>
                  
                  {/* Required Skills */}
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill, idx) => {
                          const hasSkill = matchedSkills.includes(skill);
                          return (
                            <Badge 
                              key={idx} 
                              variant={hasSkill ? "default" : "outline"}
                              className="text-xs"
                            >
                              {hasSkill && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {skill}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Skill Gap & Next Steps Panel */}
                  {skillGap && (
                    <div className="space-y-4 p-4 sm:p-5 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <h4 className="text-base sm:text-lg font-bold">Skill Gap & Next Steps</h4>
                          
                          {/* Missing Skills */}
                          {skillGap.missingSkills.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Skills to develop:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {skillGap.missingSkills.map((skill, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="font-medium">You meet all the skill requirements!</span>
                            </div>
                          )}

                          {/* Recommended Steps */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-secondary" />
                              <p className="text-sm font-medium">Recommended Action Plan:</p>
                            </div>
                            <ul className="space-y-2 pl-6">
                              {skillGap.recommendedSteps.map((step, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground leading-relaxed list-disc">
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Timeline Estimate */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {skillGap.missingSkills.length === 0
                                ? 'Ready to apply now'
                                : skillGap.missingSkills.length <= 2
                                ? 'Estimated preparation: 2-4 weeks'
                                : skillGap.missingSkills.length <= 4
                                ? 'Estimated preparation: 2-3 months'
                                : 'Estimated preparation: 6-12 months'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="gap-2 h-10 sm:h-11 text-sm sm:text-base touch-manipulation w-full sm:w-auto">
                    View Full Details
                    <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {displayJobs.length === 0 && !isSearching && !apiError && (
          <Card>
            <CardContent className="pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-10 md:pb-12 text-center space-y-4">
              <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-muted-foreground px-4">
                  No job listings yet. Enter a search term above to find live job opportunities.
                </p>
                <p className="text-xs text-muted-foreground px-4">
                  Try searching for job titles like "Software Engineer", "Data Analyst", or "Marketing Manager"
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isSearching && displayJobs.length === 0 && (
          <Card>
            <CardContent className="pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-10 md:pb-12 text-center space-y-4">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto animate-spin" />
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Searching live job APIs for opportunities...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
