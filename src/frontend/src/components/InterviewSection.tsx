import { useState } from 'react';
import { useSaveCallerUserProfile, useGetCallerUserProfile, useSaveCareerRecommendations } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Sparkles, X, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import type { UserProfile, CareerRecommendation } from '../backend';

interface InterviewSectionProps {
  onComplete: () => void;
}

// Expanded career image mapping for diverse career domains
const CAREER_IMAGES: Record<string, string> = {
  // Technology & Innovation
  'Software Engineer': '/assets/generated/software-engineer-career.dim_800x600.png',
  'Full-Stack Developer': '/assets/generated/software-engineer-career.dim_800x600.png',
  'Data Scientist': '/assets/generated/data-scientist-career.dim_800x600.png',
  'Data Visualization Specialist': '/assets/generated/data-scientist-career.dim_800x600.png',
  'Business Intelligence Analyst': '/assets/generated/data-scientist-career.dim_800x600.png',
  'Cybersecurity Specialist': '/assets/generated/cybersecurity-specialist-career.dim_800x600.png',
  'UX Designer': '/assets/generated/ux-designer-career.dim_800x600.png',
  'UX Engineer': '/assets/generated/ux-designer-career.dim_800x600.png',
  'User Experience Researcher': '/assets/generated/ux-designer-career.dim_800x600.png',
  
  // Culinary Arts & Food Science
  'Chef': '/assets/generated/chef-culinary-arts.dim_800x600.png',
  'Culinary Arts Specialist': '/assets/generated/chef-culinary-arts.dim_800x600.png',
  'Food Scientist': '/assets/generated/food-scientist.dim_800x600.png',
  'Food Tech Innovator': '/assets/generated/food-scientist.dim_800x600.png',
  
  // Agriculture & Environmental
  'Sustainable Farmer': '/assets/generated/sustainable-farmer.dim_800x600.png',
  'Agricultural Engineer': '/assets/generated/agricultural-engineer.dim_800x600.png',
  'Precision Farming Specialist': '/assets/generated/agricultural-engineer.dim_800x600.png',
  'Environmental Scientist': '/assets/generated/environmental-scientist.dim_800x600.png',
  'Conservation Specialist': '/assets/generated/environmental-scientist.dim_800x600.png',
  
  // Industrial Trades
  'Electrician': '/assets/generated/electrician-trades.dim_800x600.png',
  'Welder': '/assets/generated/welder-trades.dim_800x600.png',
  'Robotics Fabrication Specialist': '/assets/generated/welder-trades.dim_800x600.png',
  'Carpenter': '/assets/generated/carpenter-trades.dim_800x600.png',
  'Mechanical Engineer': '/assets/generated/welder-trades.dim_800x600.png',
  'Automotive Technician': '/assets/generated/welder-trades.dim_800x600.png',
  'Industrial Designer': '/assets/generated/welder-trades.dim_800x600.png',
  'Manufacturing Specialist': '/assets/generated/welder-trades.dim_800x600.png',
  
  // Marine & Ocean Sciences
  'Marine Biologist': '/assets/generated/marine-biologist.dim_800x600.png',
  'Oceanographer': '/assets/generated/marine-biologist.dim_800x600.png',
  'Maritime Engineer': '/assets/generated/marine-biologist.dim_800x600.png',
  'Aquaculture Specialist': '/assets/generated/marine-biologist.dim_800x600.png',
  'Coastal Conservation Specialist': '/assets/generated/marine-biologist.dim_800x600.png',
  
  // Creative Fields
  'Artist': '/assets/generated/artist-creative.dim_800x600.png',
  'Graphic Designer': '/assets/generated/graphic-designer-career.dim_800x600.png',
  'Brand Experience Designer': '/assets/generated/graphic-designer-career.dim_800x600.png',
  'Creative Director': '/assets/generated/graphic-designer-career.dim_800x600.png',
  'Content Writer': '/assets/generated/content-writer-career.dim_800x600.png',
  'Technical Writer': '/assets/generated/content-writer-career.dim_800x600.png',
  'Filmmaker': '/assets/generated/artist-creative.dim_800x600.png',
  'Art Therapist': '/assets/generated/artist-creative.dim_800x600.png',
  'Museum Curator': '/assets/generated/artist-creative.dim_800x600.png',
  
  // Healthcare & Wellness
  'Healthcare Nurse': '/assets/generated/healthcare-nurse-career.dim_800x600.png',
  'Veterinarian': '/assets/generated/healthcare-nurse-career.dim_800x600.png',
  'Wildlife Biologist': '/assets/generated/environmental-scientist.dim_800x600.png',
  'Animal Behaviorist': '/assets/generated/environmental-scientist.dim_800x600.png',
  'Zoo Management Specialist': '/assets/generated/environmental-scientist.dim_800x600.png',
  'Pet Care Specialist': '/assets/generated/healthcare-nurse-career.dim_800x600.png',
  'Healthcare Administrator': '/assets/generated/healthcare-nurse-career.dim_800x600.png',
  'Wellness Coach': '/assets/generated/healthcare-nurse-career.dim_800x600.png',
  
  // Education & Training
  'Teacher': '/assets/generated/teacher-career.dim_800x600.png',
  'Technical Training Developer': '/assets/generated/teacher-career.dim_800x600.png',
  'Corporate Learning & Development Specialist': '/assets/generated/teacher-career.dim_800x600.png',
  
  // Business & Management
  'Marketing Professional': '/assets/generated/marketing-professional-career.dim_800x600.png',
  'Content Marketing Strategist': '/assets/generated/marketing-professional-career.dim_800x600.png',
  'Digital Marketing Strategist': '/assets/generated/marketing-professional-career.dim_800x600.png',
  'Growth Marketing Analyst': '/assets/generated/marketing-professional-career.dim_800x600.png',
  'Project Manager': '/assets/generated/project-manager-career.dim_800x600.png',
  'Technical Product Manager': '/assets/generated/project-manager-career.dim_800x600.png',
  'Agile Project Manager': '/assets/generated/project-manager-career.dim_800x600.png',
  'Operations Manager': '/assets/generated/operations-manager-career.dim_800x600.png',
  'Solutions Architect': '/assets/generated/operations-manager-career.dim_800x600.png',
  'Business Analyst': '/assets/generated/business-analyst-career.dim_800x600.png',
  'Innovation Consultant': '/assets/generated/business-analyst-career.dim_800x600.png',
  'Sales Representative': '/assets/generated/sales-representative-career.dim_800x600.png',
  'Customer Success Manager': '/assets/generated/sales-representative-career.dim_800x600.png',
  'HR Manager': '/assets/generated/hr-manager-career.dim_800x600.png',
  'Career Development Coach': '/assets/generated/hr-manager-career.dim_800x600.png',
  'Financial Advisor': '/assets/generated/financial-advisor-career.dim_800x600.png',
  'Startup Founder / Entrepreneur': '/assets/generated/business-analyst-career.dim_800x600.png',
  'Sustainability Consultant': '/assets/generated/environmental-scientist.dim_800x600.png',
  'AI/ML Specialist': '/assets/generated/data-scientist-career.dim_800x600.png',
  'Food Systems Analyst': '/assets/generated/food-scientist.dim_800x600.png',
  'Conservation Biologist': '/assets/generated/environmental-scientist.dim_800x600.png',
};

const DEFAULT_CAREER_IMAGE = '/assets/generated/business-analyst-career.dim_800x600.png';

const getCareerImage = (title: string): string => {
  return CAREER_IMAGES[title] || DEFAULT_CAREER_IMAGE;
};

export default function InterviewSection({ onComplete }: InterviewSectionProps) {
  const { data: existingProfile } = useGetCallerUserProfile();
  const { identity, login } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const saveProfile = useSaveCallerUserProfile();
  const saveRecommendations = useSaveCareerRecommendations();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hobbies, setHobbies] = useState<string[]>(existingProfile?.hobbies || []);
  const [hobbyInput, setHobbyInput] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [education, setEducation] = useState(existingProfile?.education || '');
  const [workHistory, setWorkHistory] = useState(existingProfile?.workHistory || '');
  const [skills, setSkills] = useState<string[]>(existingProfile?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const questions = [
    {
      id: 'hobbies',
      title: 'What sparks your curiosity?',
      description: 'Tell us about your hobbies and interests—whether you love cooking, building things, creating art, working outdoors, or solving puzzles. Every passion reveals potential career connections.',
      placeholder: 'e.g., Gardening, Woodworking, Photography, Cooking, Gaming, Music',
    },
    {
      id: 'careerGoals',
      title: 'Where do you see yourself going?',
      description: 'Share your career aspirations, no matter how unconventional. Whether you dream of working with your hands, leading teams, creating art, or innovating in tech—all paths are valid.',
      placeholder: 'Describe what you hope to achieve in your professional journey...',
    },
    {
      id: 'education',
      title: 'What have you learned?',
      description: 'Your educational background is unique to you—formal degrees, trade schools, online courses, apprenticeships, or self-taught skills. Every learning experience adds to your story.',
      placeholder: 'List your degrees, certifications, trade training, courses, and self-taught skills...',
    },
    {
      id: 'workHistory',
      title: 'What experiences have shaped you?',
      description: 'Every role matters—from traditional jobs to freelance work, volunteer experiences, side projects, or entrepreneurial ventures. All experiences give you transferable skills.',
      placeholder: 'Describe your previous roles, projects, volunteer work, and achievements...',
    },
    {
      id: 'skills',
      title: 'What can you do?',
      description: 'List all your skills—technical, creative, physical, and interpersonal. From welding to web design, farming to finance, cooking to coding—unexpected combinations lead to extraordinary careers.',
      placeholder: 'e.g., Welding, JavaScript, Cooking, Leadership, Photography, Carpentry',
    },
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const addHobby = () => {
    if (hobbyInput.trim() && !hobbies.includes(hobbyInput.trim())) {
      setHobbies([...hobbies, hobbyInput.trim()]);
      setHobbyInput('');
    }
  };

  const removeHobby = (hobby: string) => {
    setHobbies(hobbies.filter((h) => h !== hobby));
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleNext = () => {
    const question = questions[currentQuestion];
    if (question.id === 'hobbies' && hobbies.length === 0) {
      toast.error('Please add at least one hobby or interest');
      return;
    }
    if (question.id === 'careerGoals' && !careerGoals.trim()) {
      toast.error('Please share your career goals');
      return;
    }
    if (question.id === 'education' && !education.trim()) {
      toast.error('Please describe your educational background');
      return;
    }
    if (question.id === 'workHistory' && !workHistory.trim()) {
      toast.error('Please describe your work experience');
      return;
    }
    if (question.id === 'skills' && skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Enhanced intelligent career recommendation engine with dynamic context-aware matching
  const generateRecommendations = (profile: UserProfile): CareerRecommendation[] => {
    const recommendations: CareerRecommendation[] = [];
    const usedTitles = new Set<string>();

    // Comprehensive skill inference system
    const skillAnalysis = analyzeSkillProfile(profile);
    
    // Priority 1: Skill fusion recommendations (cross-domain combinations)
    const fusionRecs = generateFusionRecommendations(profile, skillAnalysis);
    fusionRecs.forEach(rec => {
      if (!usedTitles.has(rec.title)) {
        recommendations.push(rec);
        usedTitles.add(rec.title);
      }
    });

    // Priority 2: Domain-specific recommendations based on primary skills
    const domainRecs = generateDomainRecommendations(profile, skillAnalysis);
    domainRecs.forEach(rec => {
      if (!usedTitles.has(rec.title) && recommendations.length < 20) {
        recommendations.push(rec);
        usedTitles.add(rec.title);
      }
    });

    // Priority 3: Career goals-based recommendations
    const goalsRecs = generateGoalsBasedRecommendations(profile, skillAnalysis);
    goalsRecs.forEach(rec => {
      if (!usedTitles.has(rec.title) && recommendations.length < 20) {
        recommendations.push(rec);
        usedTitles.add(rec.title);
      }
    });

    // Priority 4: Hobby-to-career mapping
    const hobbyRecs = generateHobbyBasedRecommendations(profile, skillAnalysis);
    hobbyRecs.forEach(rec => {
      if (!usedTitles.has(rec.title) && recommendations.length < 20) {
        recommendations.push(rec);
        usedTitles.add(rec.title);
      }
    });

    // Ensure minimum of 5 recommendations with diverse fallbacks
    if (recommendations.length < 5) {
      const fallbackRecs = generateDiverseFallbacks(profile, skillAnalysis, usedTitles);
      fallbackRecs.forEach(rec => {
        if (!usedTitles.has(rec.title) && recommendations.length < 20) {
          recommendations.push(rec);
          usedTitles.add(rec.title);
        }
      });
    }

    return recommendations.slice(0, 20);
  };

  // Comprehensive skill analysis system
  const analyzeSkillProfile = (profile: UserProfile) => {
    const allText = `${profile.skills.join(' ')} ${profile.hobbies.join(' ')} ${profile.workHistory} ${profile.education} ${profile.careerGoals}`.toLowerCase();
    
    return {
      // Technology domains
      hasTech: /programming|coding|software|web|javascript|python|java|react|development|developer|engineer|computer/.test(allText),
      hasDataScience: /data|analytics|statistics|machine learning|ai|artificial intelligence|sql|database/.test(allText),
      hasCybersecurity: /security|cybersecurity|network|firewall|penetration|ethical hacking/.test(allText),
      
      // Creative domains
      hasDesign: /design|creative|art|visual|ui|ux|graphic|photography|photoshop|illustrator|figma/.test(allText),
      hasWriting: /writing|content|copywriting|journalism|blogging|technical writing|documentation/.test(allText),
      hasFilm: /film|video|cinematography|editing|production|multimedia/.test(allText),
      
      // Business domains
      hasManagement: /management|leadership|team|project|agile|scrum|coordination|planning/.test(allText),
      hasMarketing: /marketing|social media|seo|advertising|branding|campaign|digital marketing/.test(allText),
      hasSales: /sales|business development|account management|client relations|negotiation/.test(allText),
      hasFinance: /finance|accounting|financial|investment|budget|economics/.test(allText),
      
      // Trades & mechanical
      hasTrades: /welding|carpentry|electrical|mechanical|plumbing|construction|fabrication|machining/.test(allText),
      hasAutomotive: /automotive|car|vehicle|mechanic|engine|repair/.test(allText),
      hasManufacturing: /manufacturing|production|assembly|quality control|lean|six sigma/.test(allText),
      
      // Agriculture & environmental
      hasAgriculture: /farming|agriculture|gardening|horticulture|crop|livestock|soil/.test(allText),
      hasEnvironmental: /environmental|sustainability|conservation|ecology|climate|renewable/.test(allText),
      
      // Marine & outdoor
      hasMarine: /marine|ocean|aquatic|diving|fishing|maritime|coastal|sea/.test(allText),
      hasOutdoor: /outdoor|hiking|camping|wilderness|nature|forestry/.test(allText),
      
      // Animal care
      hasAnimalCare: /animal|pet|veterinary|wildlife|zoo|aquarium|dog|cat|horse/.test(allText),
      
      // Culinary
      hasCulinary: /cooking|culinary|baking|food|chef|kitchen|restaurant|cuisine/.test(allText),
      
      // Healthcare
      hasHealthcare: /healthcare|medical|nursing|health|patient|clinical|therapy/.test(allText),
      
      // Education
      hasTeaching: /teaching|training|education|mentoring|coaching|instruction|tutor/.test(allText),
      
      // Analytical
      hasAnalytical: /analysis|research|problem solving|critical thinking|investigation/.test(allText),
      
      // Communication
      hasCommunication: /communication|presentation|public speaking|interpersonal/.test(allText),
    };
  };

  // Generate fusion recommendations (cross-domain combinations)
  const generateFusionRecommendations = (profile: UserProfile, skills: any): CareerRecommendation[] => {
    const recs: CareerRecommendation[] = [];

    if (skills.hasTech && skills.hasTrades) {
      recs.push({
        title: 'Robotics Fabrication Specialist',
        description: 'Combine your technical programming skills with hands-on fabrication expertise to build and program advanced robotic systems. This emerging field bridges the gap between software and hardware.',
        image: getCareerImage('Robotics Fabrication Specialist'),
        skillsGaps: ['Advanced robotics programming (ROS, Python)', 'CAD software for mechanical design', 'Industrial automation protocols'],
        guidance: 'Start with online courses in robotics fundamentals and ROS. Build small robotics projects combining your existing skills. Explore maker spaces and robotics clubs.'
      });
    }

    if (skills.hasCulinary && skills.hasTech) {
      recs.push({
        title: 'Food Tech Innovator',
        description: 'Revolutionize the food industry by combining culinary expertise with technology. Develop apps, smart kitchen devices, or food delivery platforms.',
        image: getCareerImage('Food Tech Innovator'),
        skillsGaps: ['Mobile app development or IoT programming', 'Food science and safety regulations', 'Product management'],
        guidance: 'Explore food tech startups and their innovations. Learn about IoT devices for smart kitchens or develop a food-related app. Study food science basics.'
      });
    }

    if (skills.hasAgriculture && (skills.hasDataScience || skills.hasAnalytical)) {
      recs.push({
        title: 'Precision Farming Specialist',
        description: 'Transform agriculture with data-driven insights. Use sensors, drones, and analytics to optimize crop yields and sustainability.',
        image: getCareerImage('Precision Farming Specialist'),
        skillsGaps: ['GIS and remote sensing technologies', 'Agricultural data analytics and IoT sensors', 'Sustainable farming practices'],
        guidance: 'Learn about precision agriculture technologies and GIS software. Study agricultural data analytics and explore drone technology for farming.'
      });
    }

    if (skills.hasDesign && skills.hasTech) {
      recs.push({
        title: 'UX Engineer',
        description: 'Merge design thinking with technical implementation. Create beautiful, functional user experiences while writing the code that brings them to life.',
        image: getCareerImage('UX Engineer'),
        skillsGaps: ['Advanced front-end frameworks (React, Vue, Angular)', 'Design systems and component libraries', 'User research methodologies'],
        guidance: 'Build a portfolio showcasing both design and coding skills. Learn modern front-end frameworks and study design systems from companies like Google.'
      });
    }

    if (skills.hasManagement && skills.hasTech) {
      recs.push({
        title: 'Technical Product Manager',
        description: 'Lead product development by combining technical understanding with strategic vision. Guide engineering teams while making data-driven decisions.',
        image: getCareerImage('Technical Product Manager'),
        skillsGaps: ['Product management frameworks (Agile, Lean)', 'Data analytics and metrics-driven decision making', 'Stakeholder management'],
        guidance: 'Consider Product Management certification. Read "Inspired" by Marty Cagan. Start managing small projects to build your product management portfolio.'
      });
    }

    if ((skills.hasDataScience || skills.hasAnalytical) && skills.hasDesign) {
      recs.push({
        title: 'Data Visualization Specialist',
        description: 'Transform complex data into compelling visual stories. Use your analytical skills and creative eye to make data accessible and actionable.',
        image: getCareerImage('Data Visualization Specialist'),
        skillsGaps: ['Data visualization tools (Tableau, Power BI, D3.js)', 'Statistical analysis and data storytelling', 'Information design principles'],
        guidance: 'Master tools like Tableau or D3.js. Study examples from data journalism sites. Build a portfolio of data visualization projects.'
      });
    }

    if (skills.hasTeaching && skills.hasTech) {
      recs.push({
        title: 'Technical Training Developer',
        description: 'Create engaging educational content and training programs for technical topics. Help others learn complex technologies through clear instruction.',
        image: getCareerImage('Technical Training Developer'),
        skillsGaps: ['Instructional design methodologies (ADDIE, SAM)', 'E-learning authoring tools', 'Learning management systems'],
        guidance: 'Explore instructional design courses and certifications. Start creating technical tutorials on platforms like YouTube or Udemy.'
      });
    }

    if (skills.hasMarketing && (skills.hasDataScience || skills.hasAnalytical)) {
      recs.push({
        title: 'Growth Marketing Analyst',
        description: 'Drive business growth through data-driven marketing strategies. Analyze user behavior, run experiments, and optimize campaigns for maximum impact.',
        image: getCareerImage('Growth Marketing Analyst'),
        skillsGaps: ['Marketing analytics tools (Google Analytics, Mixpanel)', 'A/B testing and experimentation', 'SQL and data analysis'],
        guidance: 'Get certified in Google Analytics and learn SQL for marketing analysis. Study growth hacking case studies. Practice running experiments.'
      });
    }

    return recs;
  };

  // Generate domain-specific recommendations
  const generateDomainRecommendations = (profile: UserProfile, skills: any): CareerRecommendation[] => {
    const recs: CareerRecommendation[] = [];

    // Mechanical/Engineering backgrounds
    if (skills.hasTrades || skills.hasManufacturing || skills.hasAutomotive) {
      recs.push({
        title: 'Mechanical Engineer',
        description: 'Design, develop, and test mechanical systems and devices. Apply engineering principles to solve real-world problems in manufacturing, automotive, or robotics.',
        image: getCareerImage('Mechanical Engineer'),
        skillsGaps: ['Mechanical engineering degree or certification', 'CAD software (SolidWorks, AutoCAD)', 'Engineering analysis and simulation'],
        guidance: 'Pursue mechanical engineering education or certifications. Learn CAD software and engineering principles. Gain hands-on experience through internships.'
      });
    }

    // Marine/Outdoor backgrounds
    if (skills.hasMarine || skills.hasOutdoor) {
      recs.push(
        {
          title: 'Marine Biologist',
          description: 'Study marine organisms and their ecosystems. Conduct research, conservation work, and contribute to ocean science.',
          image: getCareerImage('Marine Biologist'),
          skillsGaps: ['Marine biology degree', 'Diving certifications', 'Field research techniques'],
          guidance: 'Get diving certifications and volunteer with marine conservation organizations. Study marine biology through degree programs.'
        },
        {
          title: 'Oceanographer',
          description: 'Study the physical properties of the ocean, including waves, currents, and tides. Contribute to climate science and ocean conservation.',
          image: getCareerImage('Oceanographer'),
          skillsGaps: ['Oceanography degree', 'Data analysis skills', 'Field research experience'],
          guidance: 'Pursue oceanography studies and get involved in field research. Learn data analysis and ocean modeling techniques.'
        }
      );
    }

    // Animal care backgrounds
    if (skills.hasAnimalCare) {
      recs.push(
        {
          title: 'Veterinarian',
          description: 'Provide medical care to animals. Diagnose and treat illnesses, perform surgeries, and promote animal health and welfare.',
          image: getCareerImage('Veterinarian'),
          skillsGaps: ['Doctor of Veterinary Medicine (DVM) degree', 'State veterinary license', 'Clinical experience'],
          guidance: 'Complete pre-veterinary coursework and apply to veterinary school. Gain experience through animal care volunteering.'
        },
        {
          title: 'Wildlife Biologist',
          description: 'Study wild animals and their habitats. Conduct research, conservation work, and help protect endangered species.',
          image: getCareerImage('Wildlife Biologist'),
          skillsGaps: ['Biology degree with wildlife focus', 'Field research skills', 'Wildlife tracking and monitoring'],
          guidance: 'Study biology with a focus on wildlife. Volunteer with wildlife conservation organizations. Gain field research experience.'
        }
      );
    }

    // Technology backgrounds
    if (skills.hasTech) {
      recs.push(
        {
          title: 'Full-Stack Developer',
          description: 'Build complete web applications from front-end to back-end. Work with modern technologies to create scalable, user-friendly solutions.',
          image: getCareerImage('Full-Stack Developer'),
          skillsGaps: ['Full-stack frameworks (Node.js, Django)', 'Database design (SQL and NoSQL)', 'DevOps basics (Docker, CI/CD)'],
          guidance: 'Build full-stack projects and deploy them to the cloud. Learn both front-end and back-end technologies. Contribute to open-source projects.'
        },
        {
          title: 'Cybersecurity Specialist',
          description: 'Protect systems and networks from cyber threats. Implement security measures, conduct penetration testing, and respond to security incidents.',
          image: getCareerImage('Cybersecurity Specialist'),
          skillsGaps: ['Security certifications (CISSP, CEH)', 'Network security and cryptography', 'Incident response procedures'],
          guidance: 'Get security certifications and learn about network security. Practice ethical hacking in controlled environments. Stay updated on security threats.'
        }
      );
    }

    // Creative backgrounds
    if (skills.hasDesign || skills.hasFilm) {
      recs.push(
        {
          title: 'Creative Director',
          description: 'Lead creative teams and shape the visual direction of brands and campaigns. Bring creative visions to life while managing teams and stakeholders.',
          image: getCareerImage('Creative Director'),
          skillsGaps: ['Portfolio of creative leadership work', 'Team management skills', 'Client presentation abilities'],
          guidance: 'Build a strong portfolio showcasing your creative work and leadership. Study award-winning campaigns. Gain experience leading creative projects.'
        },
        {
          title: 'Filmmaker',
          description: 'Create compelling visual stories through film and video. Direct, shoot, and edit content for various media platforms.',
          image: getCareerImage('Filmmaker'),
          skillsGaps: ['Film production techniques', 'Video editing software (Premiere, Final Cut)', 'Storytelling and cinematography'],
          guidance: 'Create short films and build a portfolio. Learn video editing and cinematography. Study film theory and successful filmmakers.'
        }
      );
    }

    // Healthcare backgrounds
    if (skills.hasHealthcare) {
      recs.push(
        {
          title: 'Healthcare Administrator',
          description: 'Manage healthcare facilities and operations. Ensure quality patient care while overseeing budgets, staff, and regulatory compliance.',
          image: getCareerImage('Healthcare Administrator'),
          skillsGaps: ['Healthcare administration degree or MBA', 'Healthcare regulations knowledge', 'Operations management'],
          guidance: 'Pursue healthcare administration education. Learn about healthcare regulations and operations. Gain experience in healthcare settings.'
        },
        {
          title: 'Wellness Coach',
          description: 'Help individuals achieve their health and wellness goals. Provide guidance on nutrition, fitness, and lifestyle changes.',
          image: getCareerImage('Wellness Coach'),
          skillsGaps: ['Health coaching certification', 'Nutrition and fitness knowledge', 'Motivational interviewing skills'],
          guidance: 'Get certified as a health or wellness coach. Study nutrition and fitness. Practice coaching techniques and build a client base.'
        }
      );
    }

    // Business backgrounds
    if (skills.hasManagement || skills.hasSales || skills.hasFinance) {
      recs.push(
        {
          title: 'Operations Manager',
          description: 'Optimize business processes and coordinate cross-functional teams. Drive efficiency and ensure smooth operations.',
          image: getCareerImage('Operations Manager'),
          skillsGaps: ['Operations management experience', 'Process improvement methodologies', 'Team leadership'],
          guidance: 'Gain experience in operations roles. Learn process improvement methodologies like Lean or Six Sigma. Develop leadership skills.'
        },
        {
          title: 'Financial Advisor',
          description: 'Help clients manage their finances and achieve their financial goals. Provide investment advice and financial planning services.',
          image: getCareerImage('Financial Advisor'),
          skillsGaps: ['Financial planning certifications (CFP)', 'Investment knowledge', 'Client relationship management'],
          guidance: 'Get certified as a financial planner. Study investment strategies and financial planning. Build client relationships and trust.'
        }
      );
    }

    // Culinary backgrounds
    if (skills.hasCulinary) {
      recs.push(
        {
          title: 'Culinary Arts Specialist',
          description: 'Master the art and science of cooking. Create exceptional dining experiences, develop new recipes, or lead kitchen teams.',
          image: getCareerImage('Culinary Arts Specialist'),
          skillsGaps: ['Professional culinary techniques', 'Food safety certifications (ServSafe)', 'Menu development'],
          guidance: 'Consider culinary school or apprenticeships. Get food safety certifications. Build a portfolio of your culinary creations.'
        },
        {
          title: 'Food Scientist',
          description: 'Apply scientific principles to food production and safety. Develop new food products and improve food processing methods.',
          image: getCareerImage('Food Scientist'),
          skillsGaps: ['Food science degree', 'Laboratory techniques', 'Food safety regulations'],
          guidance: 'Study food science and chemistry. Gain laboratory experience. Learn about food safety regulations and quality control.'
        }
      );
    }

    // Agriculture backgrounds
    if (skills.hasAgriculture) {
      recs.push(
        {
          title: 'Sustainable Farmer',
          description: 'Grow food sustainably while stewarding the land. Implement regenerative farming practices and contribute to local food systems.',
          image: getCareerImage('Sustainable Farmer'),
          skillsGaps: ['Sustainable farming practices', 'Farm business management', 'Soil health strategies'],
          guidance: 'Learn about sustainable farming through courses or apprenticeships. Study soil health and regenerative agriculture. Connect with local farmers.'
        },
        {
          title: 'Agricultural Engineer',
          description: 'Design and develop agricultural equipment and systems. Improve farming efficiency and sustainability through engineering solutions.',
          image: getCareerImage('Agricultural Engineer'),
          skillsGaps: ['Agricultural engineering degree', 'Engineering design software', 'Agricultural systems knowledge'],
          guidance: 'Pursue agricultural engineering education. Learn about farming systems and equipment design. Gain hands-on experience with agricultural technology.'
        }
      );
    }

    // Environmental backgrounds
    if (skills.hasEnvironmental) {
      recs.push(
        {
          title: 'Environmental Scientist',
          description: 'Protect our planet through scientific research and data analysis. Study environmental impacts and develop conservation strategies.',
          image: getCareerImage('Environmental Scientist'),
          skillsGaps: ['Environmental science degree', 'GIS and environmental modeling', 'Environmental regulations knowledge'],
          guidance: 'Study environmental science fundamentals and GIS software. Volunteer with conservation organizations. Learn about environmental regulations.'
        },
        {
          title: 'Sustainability Consultant',
          description: 'Help organizations reduce their environmental impact and implement sustainable practices. Advise on green initiatives and corporate responsibility.',
          image: getCareerImage('Sustainability Consultant'),
          skillsGaps: ['Sustainability frameworks and certifications', 'Environmental impact assessment', 'Change management'],
          guidance: 'Learn about sustainability frameworks and certifications. Study environmental impact assessment. Develop consulting and communication skills.'
        }
      );
    }

    return recs;
  };

  // Generate career goals-based recommendations
  const generateGoalsBasedRecommendations = (profile: UserProfile, skills: any): CareerRecommendation[] => {
    const recs: CareerRecommendation[] = [];
    const goalsLower = profile.careerGoals.toLowerCase();

    if (/help|people|community|social|impact/.test(goalsLower)) {
      recs.push({
        title: 'Career Development Coach',
        description: 'Guide individuals through career transitions and skill development. Help people discover their potential and achieve their professional goals.',
        image: getCareerImage('Career Development Coach'),
        skillsGaps: ['Coaching certifications (ICF, BCC)', 'Career assessment tools', 'Business development'],
        guidance: 'Get certified as a professional coach through ICF. Learn career assessment tools. Build your coaching practice with pro bono sessions initially.'
      });
    }

    if (/entrepreneur|startup|business|own/.test(goalsLower)) {
      recs.push({
        title: 'Startup Founder / Entrepreneur',
        description: 'Build your own business and bring innovative ideas to market. Combine your skills and passions to create something new and valuable.',
        image: getCareerImage('Startup Founder / Entrepreneur'),
        skillsGaps: ['Business planning and financial modeling', 'Fundraising and investor relations', 'Product-market fit validation'],
        guidance: 'Start by validating your business idea with potential customers. Learn lean startup methodology. Join entrepreneurship communities.'
      });
    }

    if (/lead|manage|director|executive/.test(goalsLower)) {
      recs.push({
        title: 'Operations Manager',
        description: 'Optimize business processes and coordinate cross-functional teams. Drive efficiency and ensure smooth operations across the organization.',
        image: getCareerImage('Operations Manager'),
        skillsGaps: ['Operations management experience', 'Process improvement methodologies', 'Strategic planning'],
        guidance: 'Gain experience in operations roles. Learn Lean or Six Sigma methodologies. Develop strategic thinking and leadership skills.'
      });
    }

    if (/innovate|create|invent|new/.test(goalsLower)) {
      recs.push({
        title: 'Innovation Consultant',
        description: 'Help organizations identify opportunities and implement creative solutions. Use your diverse skill set to drive transformation and innovation.',
        image: getCareerImage('Innovation Consultant'),
        skillsGaps: ['Change management methodologies', 'Innovation frameworks (Design Thinking)', 'Consulting skills'],
        guidance: 'Study innovation frameworks and change management. Build case studies of problems you\'ve solved. Network with consultants.'
      });
    }

    return recs;
  };

  // Generate hobby-based recommendations
  const generateHobbyBasedRecommendations = (profile: UserProfile, skills: any): CareerRecommendation[] => {
    const recs: CareerRecommendation[] = [];
    const hobbiesText = profile.hobbies.join(' ').toLowerCase();

    if (/photo|camera|picture/.test(hobbiesText) && skills.hasDesign) {
      recs.push({
        title: 'Brand Experience Designer',
        description: 'Create cohesive brand experiences across digital and physical touchpoints. Shape how users interact with and perceive brands.',
        image: getCareerImage('Brand Experience Designer'),
        skillsGaps: ['Brand strategy and positioning', 'Multi-channel design systems', 'Motion design'],
        guidance: 'Study successful brand identities and their design systems. Learn motion design tools. Build case studies showing cohesive experiences.'
      });
    }

    if (/music|audio|sound/.test(hobbiesText)) {
      recs.push({
        title: 'Content Writer',
        description: 'Create engaging articles and editorial content. Write for various media platforms and help brands tell their stories.',
        image: getCareerImage('Content Writer'),
        skillsGaps: ['SEO and content optimization', 'Content management systems', 'Editorial standards'],
        guidance: 'Build a writing portfolio across different formats. Learn SEO fundamentals. Study successful content and what makes it engaging.'
      });
    }

    return recs;
  };

  // Generate diverse fallback recommendations
  const generateDiverseFallbacks = (profile: UserProfile, skills: any, usedTitles: Set<string>): CareerRecommendation[] => {
    const fallbacks: CareerRecommendation[] = [
      {
        title: 'Business Analyst',
        description: 'Bridge the gap between business needs and technical solutions. Analyze processes, gather requirements, and drive organizational improvements.',
        image: getCareerImage('Business Analyst'),
        skillsGaps: ['Business analysis frameworks', 'Requirements gathering techniques', 'Process modeling tools'],
        guidance: 'Learn business analysis methodologies. Practice requirements gathering and process mapping. Get certified as a business analyst.'
      },
      {
        title: 'Project Manager',
        description: 'Lead cross-functional teams and deliver projects successfully. Coordinate resources, manage timelines, and ensure stakeholder satisfaction.',
        image: getCareerImage('Project Manager'),
        skillsGaps: ['Project management certifications (PMP, PRINCE2)', 'Project management tools', 'Risk management'],
        guidance: 'Get certified in project management. Learn to use PM tools effectively. Practice managing small projects to build experience.'
      },
      {
        title: 'Customer Success Manager',
        description: 'Ensure customers achieve their goals with your company\'s products. Build relationships and drive customer satisfaction and retention.',
        image: getCareerImage('Customer Success Manager'),
        skillsGaps: ['Customer success platforms', 'Account management techniques', 'Customer health metrics'],
        guidance: 'Learn customer success best practices and metrics. Study successful customer success strategies. Develop relationship-building skills.'
      },
      {
        title: 'Marketing Professional',
        description: 'Develop and execute marketing strategies that drive business growth. Create campaigns, analyze results, and optimize for success.',
        image: getCareerImage('Marketing Professional'),
        skillsGaps: ['Digital marketing platforms', 'Marketing analytics', 'Campaign management'],
        guidance: 'Get certified in digital marketing platforms. Learn marketing analytics. Study successful marketing campaigns and strategies.'
      },
      {
        title: 'Teacher',
        description: 'Educate and inspire the next generation. Create engaging learning experiences and help students reach their full potential.',
        image: getCareerImage('Teacher'),
        skillsGaps: ['Teaching certification', 'Curriculum development', 'Classroom management'],
        guidance: 'Pursue teaching certification in your area. Learn about curriculum development and pedagogy. Gain classroom experience through student teaching.'
      },
    ];

    return fallbacks.filter(rec => !usedTitles.has(rec.title));
  };

  const validateData = (): boolean => {
    if (hobbies.length === 0) {
      toast.error('Please add at least one hobby or interest');
      return false;
    }
    if (!careerGoals.trim()) {
      toast.error('Please share your career goals');
      return false;
    }
    if (!education.trim()) {
      toast.error('Please describe your educational background');
      return false;
    }
    if (!workHistory.trim()) {
      toast.error('Please describe your work experience');
      return false;
    }
    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return false;
    }
    return true;
  };

  const attemptSave = async (profile: UserProfile, recommendations: CareerRecommendation[], attempt: number = 1): Promise<boolean> => {
    const maxRetries = 3;
    
    try {
      if (!identity) {
        toast.error('Please log in to save your interview', {
          action: {
            label: 'Login',
            onClick: () => login(),
          },
        });
        return false;
      }

      if (!actor || actorFetching) {
        if (attempt < maxRetries) {
          toast.info(`Connecting to backend... (Attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return attemptSave(profile, recommendations, attempt + 1);
        } else {
          toast.error('Unable to connect to backend. Please try again later.');
          return false;
        }
      }

      await saveProfile.mutateAsync(profile);
      await saveRecommendations.mutateAsync(recommendations);
      
      return true;
    } catch (error: any) {
      console.error('Save error:', error);
      
      if (error.message?.includes('Unauthorized') || error.message?.includes('Only users can')) {
        toast.error('Authentication required. Please log in again.', {
          action: {
            label: 'Login',
            onClick: () => login(),
          },
        });
        return false;
      }
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        if (attempt < maxRetries) {
          toast.info(`Network error. Retrying... (${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return attemptSave(profile, recommendations, attempt + 1);
        } else {
          toast.error('Network error. Please check your connection and try again.');
          return false;
        }
      }
      
      if (attempt < maxRetries) {
        toast.info(`Save failed. Retrying... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return attemptSave(profile, recommendations, attempt + 1);
      } else {
        toast.error('Failed to save your responses. Please try again later.');
        return false;
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateData()) {
      return;
    }

    setIsGenerating(true);
    setRetryCount(0);

    try {
      const profile: UserProfile = {
        hobbies,
        careerGoals,
        education,
        workHistory,
        skills,
      };

      const recommendations = generateRecommendations(profile);

      if (recommendations.length === 0) {
        toast.error('Unable to generate recommendations. Please try again.');
        setIsGenerating(false);
        return;
      }

      const saveSuccess = await attemptSave(profile, recommendations);

      if (saveSuccess) {
        toast.success('Interview complete! Discovering your career connections...', {
          duration: 2000,
        });
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setIsGenerating(false);
    }
  };

  const question = questions[currentQuestion];

  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 xl:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(var(--primary)/0.05),transparent_70%)]" />
      
      <div className="container max-w-4xl relative px-4">
        <div className="mb-8 sm:mb-10 md:mb-12 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="text-center space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold px-2">
              Let's Explore Your{' '}
              <span className="gradient-text">Unique Journey</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Share your story—from creative passions to technical skills, outdoor hobbies to professional experience. Every detail helps us discover your perfect career match.
            </p>
          </div>
          
          <div className="flex items-center justify-between px-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-xs sm:text-sm font-medium text-primary">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2 sm:h-3" />
        </div>

        {!identity && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                Please log in to save your interview responses
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                You can complete the interview, but you'll need to log in before we can save your career recommendations.
              </p>
            </div>
          </div>
        )}

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-3 sm:space-y-4 pb-6 sm:pb-8 p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-tight">
                  {question.title}
                </CardTitle>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                  {question.description}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {question.id === 'hobbies' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={question.placeholder}
                    value={hobbyInput}
                    onChange={(e) => setHobbyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                    className="text-sm sm:text-base h-11 sm:h-12"
                  />
                  <Button onClick={addHobby} type="button" size="lg" className="h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base touch-manipulation">
                    Add
                  </Button>
                </div>
                {hobbies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {hobbies.map((hobby) => (
                      <Badge key={hobby} variant="secondary" className="gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                        {hobby}
                        <button onClick={() => removeHobby(hobby)} className="hover:text-destructive transition-colors touch-manipulation">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {question.id === 'careerGoals' && (
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="careerGoals" className="text-sm sm:text-base font-medium">
                  Your Career Aspirations
                </Label>
                <Textarea
                  id="careerGoals"
                  placeholder={question.placeholder}
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  rows={6}
                  className="text-sm sm:text-base resize-none min-h-[150px] sm:min-h-[200px]"
                />
              </div>
            )}

            {question.id === 'education' && (
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="education" className="text-sm sm:text-base font-medium">
                  Educational Background
                </Label>
                <Textarea
                  id="education"
                  placeholder={question.placeholder}
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  rows={6}
                  className="text-sm sm:text-base resize-none min-h-[150px] sm:min-h-[200px]"
                />
              </div>
            )}

            {question.id === 'workHistory' && (
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="workHistory" className="text-sm sm:text-base font-medium">
                  Work Experience
                </Label>
                <Textarea
                  id="workHistory"
                  placeholder={question.placeholder}
                  value={workHistory}
                  onChange={(e) => setWorkHistory(e.target.value)}
                  rows={6}
                  className="text-sm sm:text-base resize-none min-h-[150px] sm:min-h-[200px]"
                />
              </div>
            )}

            {question.id === 'skills' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={question.placeholder}
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="text-sm sm:text-base h-11 sm:h-12"
                  />
                  <Button onClick={addSkill} type="button" size="lg" className="h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base touch-manipulation">
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors touch-manipulation">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 sm:pt-6">
              <Button 
                variant="outline" 
                onClick={handleBack} 
                disabled={currentQuestion === 0 || isGenerating}
                size="lg"
                className="h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base touch-manipulation order-2 sm:order-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={isGenerating}
                size="lg"
                className="gradient-primary h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base touch-manipulation order-1 sm:order-2"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    Discovering Connections...
                  </>
                ) : currentQuestion === questions.length - 1 ? (
                  <>
                    Complete Interview
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
