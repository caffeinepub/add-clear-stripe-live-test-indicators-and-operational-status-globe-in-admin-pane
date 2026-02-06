import { useState } from 'react';
import { useGetCareerRecommendations } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, TrendingUp, ArrowRight, Target, Lightbulb, BookOpen, X, Heart } from 'lucide-react';
import type { CareerRecommendation } from '../backend';

interface RecommendationsSectionProps {
  onExploreJobs: (career?: CareerRecommendation) => void;
}

const getCareerImageAlt = (title: string): string => {
  const altTextMap: Record<string, string> = {
    'Software Engineer': 'Professional software engineer working on code with multiple monitors in modern office environment',
    'Full-Stack Developer': 'Full-stack developer coding on laptop with both frontend and backend development tools visible',
    'Healthcare Nurse': 'Healthcare nurse providing patient care in medical facility with professional medical equipment',
    'Marketing Professional': 'Marketing professional analyzing campaign data and creating digital marketing strategies',
    'Content Marketing Strategist': 'Content marketing strategist planning content calendar and analyzing engagement metrics',
    'Digital Marketing Strategist': 'Digital marketing strategist reviewing analytics dashboard and campaign performance',
    'Growth Marketing Analyst': 'Growth marketing analyst examining user acquisition data and conversion funnels',
    'Data Scientist': 'Data scientist analyzing complex datasets with data visualization tools and statistical models',
    'Data Visualization Specialist': 'Data visualization specialist creating interactive charts and dashboards from complex data',
    'Business Intelligence Analyst': 'Business intelligence analyst working with BI tools and creating executive reports',
    'Teacher': 'Teacher engaging with students in modern classroom with educational technology',
    'Technical Training Developer': 'Technical training developer creating educational content and instructional materials',
    'Corporate Learning & Development Specialist': 'Corporate learning specialist designing employee training programs and workshops',
    'Financial Advisor': 'Financial advisor consulting with clients and reviewing investment portfolios',
    'Graphic Designer': 'Graphic designer creating visual designs using professional design software and tools',
    'Brand Experience Designer': 'Brand experience designer developing cohesive brand identity across multiple touchpoints',
    'UX Designer': 'UX designer sketching user interface wireframes and conducting usability research',
    'UX Engineer': 'UX engineer building interactive prototypes and implementing design systems',
    'User Experience Researcher': 'User experience researcher conducting user interviews and analyzing behavioral data',
    'Project Manager': 'Project manager coordinating team activities and tracking project milestones on digital boards',
    'Technical Product Manager': 'Technical product manager reviewing product roadmap with engineering team',
    'Agile Project Manager': 'Agile project manager facilitating scrum ceremonies and sprint planning sessions',
    'Cybersecurity Specialist': 'Cybersecurity specialist monitoring network security and analyzing threat detection systems',
    'Sales Representative': 'Sales representative presenting product demonstrations and building client relationships',
    'Customer Success Manager': 'Customer success manager meeting with clients and ensuring product adoption success',
    'HR Manager': 'HR manager conducting employee interviews and managing talent development programs',
    'Career Development Coach': 'Career development coach guiding professionals through career transitions and goal setting',
    'Operations Manager': 'Operations manager optimizing business processes and coordinating cross-functional teams',
    'Solutions Architect': 'Solutions architect designing technical system architecture and cloud infrastructure',
    'Content Writer': 'Content writer creating engaging articles and editorial content on laptop',
    'Technical Writer': 'Technical writer documenting software features and creating user guides',
    'Business Analyst': 'Business analyst reviewing requirements and creating process flow diagrams',
    'Innovation Consultant': 'Innovation consultant facilitating design thinking workshops and strategic planning sessions',
    'Robotics Fabrication Specialist': 'Robotics specialist programming and assembling advanced robotic systems in workshop',
    'Creative Director': 'Creative director leading design team and reviewing creative campaign concepts',
    'Startup Founder / Entrepreneur': 'Entrepreneur presenting business pitch and leading startup team meeting',
    'Chef': 'Professional chef preparing gourmet dishes in modern commercial kitchen',
    'Culinary Arts Specialist': 'Culinary arts specialist creating innovative dishes with fresh ingredients',
    'Food Scientist': 'Food scientist conducting research and developing new food products in laboratory',
    'Food Tech Innovator': 'Food tech innovator developing smart kitchen technology and food delivery platforms',
    'Sustainable Farmer': 'Sustainable farmer working in organic farm with regenerative agriculture practices',
    'Agricultural Engineer': 'Agricultural engineer designing precision farming systems and agricultural technology',
    'Precision Farming Specialist': 'Precision farming specialist using drones and sensors to optimize crop yields',
    'Environmental Scientist': 'Environmental scientist conducting field research and analyzing ecosystem data',
    'Conservation Specialist': 'Conservation specialist working on wildlife protection and habitat restoration',
    'Electrician': 'Professional electrician installing and maintaining electrical systems in commercial building',
    'Welder': 'Skilled welder working on metal fabrication with protective equipment',
    'Carpenter': 'Master carpenter crafting custom woodwork with precision tools',
    'Marine Biologist': 'Marine biologist studying ocean life and conducting underwater research',
    'Oceanographer': 'Oceanographer analyzing ocean data and conducting marine research',
    'Artist': 'Professional artist creating original artwork in creative studio space',
  };

  return altTextMap[title] || `Professional ${title} working in their field with relevant tools and environment`;
};

export default function RecommendationsSection({ onExploreJobs }: RecommendationsSectionProps) {
  const { data: recommendations, isLoading } = useGetCareerRecommendations();
  const [selectedRecommendation, setSelectedRecommendation] = useState<CareerRecommendation | null>(null);

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(var(--primary)/0.08),transparent_70%)]" />
        <div className="container max-w-7xl relative px-4">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="inline-flex items-center justify-center">
              <div className="h-12 w-12 sm:h-16 sm:w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold">Analyzing Your Unique Profile</h3>
              <p className="text-base sm:text-lg text-muted-foreground px-4">
                Discovering career paths that match your skills and passions...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(var(--primary)/0.08),transparent_70%)]" />
        <div className="container max-w-7xl relative px-4">
          <Card className="max-w-2xl mx-auto border-2">
            <CardContent className="pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-10 md:pb-12 text-center space-y-4 sm:space-y-6">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full gradient-primary flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="space-y-2 px-4">
                <h3 className="text-xl sm:text-2xl font-bold">Ready to Discover Your Path?</h3>
                <p className="text-muted-foreground text-base sm:text-lg">
                  Complete the AI interview to get personalized career recommendations tailored to your unique skills and interests.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(var(--primary)/0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,oklch(var(--secondary)/0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,oklch(var(--accent)/0.06),transparent_50%)]" />
        
        <div className="container max-w-7xl relative px-4">
          {/* Inspirational Banner */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full gradient-primary flex items-center justify-center">
                      <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                      "Any combination of skills can lead to something extraordinary"
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Your unique background isn't a limitation—it's your superpower. From culinary arts to technology, trades to creative fields, every skill you have opens new doors.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Header */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-4 sm:space-y-5 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-2 animate-pulse-slow">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Your Personalized Career Paths
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight px-4">
              Discover Your{' '}
              <span className="gradient-text">Perfect Career Match</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Based on your unique combination of skills and experiences, we've identified {recommendations.length} exciting career {recommendations.length === 1 ? 'path' : 'paths'} spanning multiple industries—from creative fields to technology, trades to innovation
            </p>
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-12 sm:mb-14 md:mb-16">
            {recommendations.map((rec, index) => (
              <Card
                key={index}
                className="group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 sm:hover:-translate-y-2 touch-manipulation"
                onClick={() => setSelectedRecommendation(rec)}
              >
                <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
                  <picture>
                    <source
                      media="(min-width: 1024px)"
                      srcSet={rec.image}
                    />
                    <source
                      media="(min-width: 640px)"
                      srcSet={rec.image}
                    />
                    <img
                      src={rec.image}
                      alt={getCareerImageAlt(rec.title)}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <Badge
                    variant="secondary"
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-background/90 backdrop-blur-sm font-semibold text-xs sm:text-sm"
                  >
                    #{index + 1}
                  </Badge>
                </div>

                <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {rec.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-primary font-medium pt-2">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Click to explore details</span>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="inline-block p-1 rounded-2xl gradient-primary">
              <div className="bg-background rounded-xl px-6 sm:px-8 py-5 sm:py-6 space-y-3 sm:space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold">Ready to Take the Next Step?</h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                  Explore real job opportunities across all industries that match your selected career paths
                </p>
                <Button size="lg" onClick={() => onExploreJobs()} className="gap-2 gradient-primary text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 touch-manipulation">
                  Explore Job Listings
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded View Dialog */}
      <Dialog open={!!selectedRecommendation} onOpenChange={() => setSelectedRecommendation(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] p-0 gap-0">
          {selectedRecommendation && (
            <>
              <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                <picture>
                  <source
                    media="(min-width: 1024px)"
                    srcSet={selectedRecommendation.image}
                  />
                  <source
                    media="(min-width: 640px)"
                    srcSet={selectedRecommendation.image}
                  />
                  <img
                    src={selectedRecommendation.image}
                    alt={getCareerImageAlt(selectedRecommendation.title)}
                    className="w-full h-full object-cover"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors touch-manipulation"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <ScrollArea className="max-h-[calc(90vh-12rem)] sm:max-h-[calc(90vh-14rem)] md:max-h-[calc(90vh-16rem)]">
                <div className="p-5 sm:p-6 md:p-8 space-y-6 sm:space-y-7 md:space-y-8">
                  <DialogHeader className="space-y-3 sm:space-y-4">
                    <DialogTitle className="text-2xl sm:text-3xl font-bold leading-tight">
                      {selectedRecommendation.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                      {selectedRecommendation.description}
                    </DialogDescription>
                  </DialogHeader>

                  {selectedRecommendation.skillsGaps && selectedRecommendation.skillsGaps.length > 0 && (
                    <div className="space-y-3 sm:space-y-4 p-4 sm:p-5 md:p-6 rounded-xl bg-secondary/5 border-2 border-secondary/20">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold">Skills to Develop</h4>
                      </div>
                      <div className="space-y-2.5 sm:space-y-3 pl-0 sm:pl-13">
                        {selectedRecommendation.skillsGaps.map((gap, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 sm:gap-3">
                            <div className="h-2 w-2 rounded-full bg-secondary mt-1.5 sm:mt-2 flex-shrink-0" />
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{gap}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRecommendation.guidance && (
                    <div className="space-y-3 sm:space-y-4 p-4 sm:p-5 md:p-6 rounded-xl bg-accent/5 border-2 border-accent/20">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold">How to Get Started</h4>
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-0 sm:pl-13 whitespace-pre-line">
                        {selectedRecommendation.guidance}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 sm:pt-4">
                    <Button
                      size="lg"
                      onClick={() => {
                        onExploreJobs(selectedRecommendation);
                        setSelectedRecommendation(null);
                      }}
                      className="w-full gap-2 gradient-primary text-base sm:text-lg py-5 sm:py-6 touch-manipulation"
                    >
                      Find Jobs in {selectedRecommendation.title}
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
