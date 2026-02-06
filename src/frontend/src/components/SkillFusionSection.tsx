import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Zap } from 'lucide-react';

export default function SkillFusionSection() {
  const fusionExamples = [
    {
      skill1: 'Welding',
      skill2: 'Programming',
      result: 'Robotics Fabrication',
      description: 'Build and program advanced robotic systems',
      color: 'from-primary/20 to-secondary/20',
    },
    {
      skill1: 'Culinary Arts',
      skill2: 'Technology',
      result: 'Food Tech Innovation',
      description: 'Revolutionize the food industry with smart solutions',
      color: 'from-secondary/20 to-accent/20',
    },
    {
      skill1: 'Agriculture',
      skill2: 'Data Science',
      result: 'Precision Farming',
      description: 'Optimize crop yields with data-driven insights',
      color: 'from-accent/20 to-primary/20',
    },
    {
      skill1: 'Design',
      skill2: 'Data Analysis',
      result: 'Data Visualization',
      description: 'Transform complex data into visual stories',
      color: 'from-primary/20 to-accent/20',
    },
    {
      skill1: 'Marine Biology',
      skill2: 'Research',
      result: 'Ocean Conservation',
      description: 'Protect marine ecosystems through science',
      color: 'from-secondary/20 to-primary/20',
    },
    {
      skill1: 'Teaching',
      skill2: 'Technology',
      result: 'EdTech Developer',
      description: 'Create innovative learning platforms',
      color: 'from-accent/20 to-secondary/20',
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <picture>
          <source
            media="(min-width: 1024px)"
            srcSet="/assets/generated/skill-fusion-paths.dim_800x600.png"
            type="image/png"
          />
          <source
            media="(min-width: 640px)"
            srcSet="/assets/generated/skill-fusion-paths.dim_800x600.png"
            type="image/png"
          />
          <img 
            src="/assets/generated/skill-fusion-paths.dim_800x600.png" 
            alt=""
            role="presentation"
            className="w-full h-full object-cover"
            loading="lazy"
            width="800"
            height="600"
          />
        </picture>
      </div>
      
      <div className="container relative px-4">
        <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold border border-primary/20 mb-3 sm:mb-4">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Skill Fusion Spotlight
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold px-4">
            When Skills <span className="gradient-text">Combine</span>, Magic Happens
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Discover how unexpected skill combinations across all industries can open doors to exciting new career fields
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8 max-w-6xl mx-auto mb-8 sm:mb-10 md:mb-12">
          {fusionExamples.map((example, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${example.color} opacity-50 group-hover:opacity-70 transition-opacity`} />
              <CardContent className="relative pt-6 sm:pt-8 pb-6 sm:pb-8 space-y-4 sm:space-y-5 md:space-y-6 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                  <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-background/80 backdrop-blur-sm font-semibold text-xs sm:text-sm border text-center min-h-[44px] flex items-center">
                    {example.skill1}
                  </div>
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-primary rotate-90 sm:rotate-0" />
                  </div>
                  <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-background/80 backdrop-blur-sm font-semibold text-xs sm:text-sm border text-center min-h-[44px] flex items-center">
                    {example.skill2}
                  </div>
                </div>
                
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                
                <div className="text-center space-y-1.5 sm:space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold">{example.result}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{example.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-7 md:gap-8">
                <div className="flex-shrink-0 w-full md:w-auto">
                  <picture>
                    <source
                      media="(min-width: 768px)"
                      srcSet="/assets/generated/career-transition-diagram.dim_800x600.png"
                      type="image/png"
                    />
                    <source
                      media="(min-width: 640px)"
                      srcSet="/assets/generated/career-transition-diagram.dim_800x600.png"
                      type="image/png"
                    />
                    <img 
                      src="/assets/generated/career-transition-diagram.dim_800x600.png" 
                      alt="Career transition diagram showing diverse skill combinations forming new opportunities across industries" 
                      className="rounded-xl shadow-lg w-full md:w-56 lg:w-64 h-auto"
                      loading="lazy"
                      width="800"
                      height="600"
                    />
                  </picture>
                </div>
                <div className="space-y-3 sm:space-y-4 text-center md:text-left">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                    Your Unique Combination is Your Superpower
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                    The most innovative careers emerge at the intersection of different fields—from culinary arts meeting technology to agriculture combining with data science. 
                    Your diverse background isn't a limitation—it's your competitive advantage. 
                    Let our AI help you discover where your unique skills can take you across all industries.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
