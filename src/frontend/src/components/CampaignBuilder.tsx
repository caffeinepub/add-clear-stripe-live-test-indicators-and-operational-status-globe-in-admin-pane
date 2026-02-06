import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  Sparkles,
  Save,
  Eye,
  Copy,
  Trash2,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Edit,
  Play,
  Pause,
  BarChart3,
  ExternalLink,
  Rocket,
  Wand2,
  Heart,
  Brain,
  Zap,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateCampaign,
  useGetAllCampaigns,
  useUpdateCampaign,
  useUpdateCampaignStatus,
  useDeleteCampaign,
  useDuplicateCampaign,
  useGetCampaignTemplatesByIndustry,
  useGenerateCampaignPreview,
  useGetCampaignPerformance
} from '../hooks/useQueries';
import { IndustryCategory, CampaignStatus, type Campaign, type CampaignContent } from '../backend';

const INDUSTRY_OPTIONS = [
  { value: IndustryCategory.technology, label: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { value: IndustryCategory.healthcare, label: 'Healthcare', icon: '🏥', color: 'from-green-500 to-emerald-500' },
  { value: IndustryCategory.creative, label: 'Creative Industries', icon: '🎨', color: 'from-purple-500 to-pink-500' },
  { value: IndustryCategory.skilledTrades, label: 'Skilled Trades', icon: '🔧', color: 'from-orange-500 to-red-500' },
  { value: IndustryCategory.businessFinance, label: 'Business & Finance', icon: '💼', color: 'from-indigo-500 to-blue-500' },
  { value: IndustryCategory.environmentalAgriculture, label: 'Environmental & Agriculture', icon: '🌱', color: 'from-green-600 to-lime-500' },
  { value: IndustryCategory.marineOutdoor, label: 'Marine & Outdoor', icon: '🌊', color: 'from-cyan-500 to-blue-600' },
];

const EMOTIONAL_TRIGGERS = {
  aspiration: { icon: '🎯', label: 'Aspiration', tip: 'Appeal to dreams and future success' },
  belonging: { icon: '🤝', label: 'Belonging', tip: 'Create sense of community and connection' },
  urgency: { icon: '⚡', label: 'Urgency', tip: 'Motivate immediate action' },
  curiosity: { icon: '🔍', label: 'Curiosity', tip: 'Spark interest and exploration' },
  empowerment: { icon: '💪', label: 'Empowerment', tip: 'Inspire confidence and capability' },
  transformation: { icon: '✨', label: 'Transformation', tip: 'Promise meaningful change' }
};

const INDUSTRY_TIPS: Record<string, {
  headline: string;
  bodyTips: string[];
  ctaTips: string[];
  audienceTips: string[];
  emotionalTone: string[];
  sampleHeadlines: string[];
  sampleBody: string;
  keywords: string[];
}> = {
  [IndustryCategory.technology]: {
    headline: 'Focus on innovation, problem-solving, and career growth in tech',
    bodyTips: [
      'Highlight cutting-edge technologies and skills',
      'Emphasize remote work opportunities and flexibility',
      'Showcase career progression paths in software, data, and AI',
      'Use technical language that resonates with developers',
      'Focus on continuous learning and skill development'
    ],
    ctaTips: [
      'Discover Your Tech Career Path',
      'Find Your Next Tech Role',
      'Explore Software Engineering Careers',
      'Start Your Tech Journey Today',
      'Unlock Your Coding Potential'
    ],
    audienceTips: [
      'Software developers and engineers',
      'Data scientists and analysts',
      'Tech professionals seeking career transitions',
      'Recent CS graduates',
      'Self-taught programmers'
    ],
    emotionalTone: ['aspiration', 'curiosity', 'empowerment'],
    sampleHeadlines: [
      'Build the Future: Your Tech Career Starts Here',
      'From Code to Career: Discover Your Path in Technology',
      'Transform Your Passion for Tech Into a Thriving Career'
    ],
    sampleBody: 'Whether you\'re a seasoned developer or just starting your coding journey, discover personalized career paths that match your unique skills and aspirations. Our AI-powered platform analyzes your background and connects you with opportunities in software development, data science, cybersecurity, and emerging tech fields. Join thousands who\'ve found their perfect tech role.',
    keywords: ['software', 'developer', 'coding', 'programming', 'tech career', 'AI', 'data science', 'remote work']
  },
  [IndustryCategory.healthcare]: {
    headline: 'Emphasize impact, compassion, and making a difference in healthcare',
    bodyTips: [
      'Highlight the rewarding nature of healthcare careers',
      'Emphasize work-life balance and job security',
      'Showcase diverse healthcare roles beyond nursing',
      'Use empathetic, caring language',
      'Focus on patient impact and community service'
    ],
    ctaTips: [
      'Start Your Healthcare Journey',
      'Discover Healing Careers',
      'Find Your Medical Calling',
      'Make a Difference in Healthcare',
      'Begin Your Path to Caring'
    ],
    audienceTips: [
      'Healthcare professionals seeking advancement',
      'Career changers interested in medical fields',
      'Recent healthcare graduates',
      'Allied health professionals',
      'Compassionate individuals seeking purpose'
    ],
    emotionalTone: ['empowerment', 'belonging', 'transformation'],
    sampleHeadlines: [
      'Heal Lives, Build Your Future: Healthcare Careers That Matter',
      'Your Compassion Deserves a Career That Fulfills',
      'Discover Healthcare Roles Where You Make a Real Difference'
    ],
    sampleBody: 'Every day in healthcare is an opportunity to change lives. Whether you\'re drawn to nursing, medical technology, therapy, or healthcare administration, find a career path that aligns with your passion for helping others. Our platform matches your unique background with rewarding healthcare opportunities that offer stability, growth, and the chance to make a meaningful impact.',
    keywords: ['healthcare', 'nursing', 'medical', 'patient care', 'wellness', 'therapy', 'compassion', 'healing']
  },
  [IndustryCategory.creative]: {
    headline: 'Celebrate creativity, self-expression, and artistic passion',
    bodyTips: [
      'Highlight portfolio-building opportunities',
      'Emphasize creative freedom and artistic expression',
      'Showcase diverse creative career paths',
      'Use inspiring, visually-focused language',
      'Focus on turning passion into profession'
    ],
    ctaTips: [
      'Unleash Your Creative Potential',
      'Find Your Artistic Career',
      'Discover Creative Opportunities',
      'Turn Your Art Into a Career',
      'Express Yourself Professionally'
    ],
    audienceTips: [
      'Designers and visual artists',
      'Content creators and writers',
      'Marketing and advertising professionals',
      'Freelance creatives',
      'Artists seeking stable income'
    ],
    emotionalTone: ['aspiration', 'empowerment', 'transformation'],
    sampleHeadlines: [
      'Your Creativity Deserves a Career That Inspires',
      'From Passion to Profession: Build Your Creative Future',
      'Design Your Dream Career in the Creative Industries'
    ],
    sampleBody: 'Your artistic vision is valuable. Discover how to transform your creative passion into a sustainable, fulfilling career. Whether you\'re a graphic designer, content creator, photographer, or multimedia artist, our platform connects your unique talents with opportunities in advertising, digital media, entertainment, and beyond. Build a portfolio, find your niche, and thrive doing what you love.',
    keywords: ['creative', 'design', 'art', 'content', 'visual', 'portfolio', 'freelance', 'artistic']
  },
  [IndustryCategory.skilledTrades]: {
    headline: 'Emphasize hands-on work, job security, and tangible results',
    bodyTips: [
      'Highlight high earning potential and job stability',
      'Emphasize the satisfaction of building and creating',
      'Showcase apprenticeship and training opportunities',
      'Use practical, results-oriented language',
      'Focus on independence and entrepreneurship'
    ],
    ctaTips: [
      'Build Your Trade Career',
      'Master a Skilled Trade',
      'Start Your Apprenticeship Journey',
      'Craft Your Future Today',
      'Learn a Trade, Earn a Living'
    ],
    audienceTips: [
      'Tradespeople seeking advancement',
      'Career changers interested in hands-on work',
      'Young adults exploring trade careers',
      'Experienced craftspeople',
      'Individuals seeking stable, well-paying work'
    ],
    emotionalTone: ['empowerment', 'aspiration', 'urgency'],
    sampleHeadlines: [
      'Build Something Real: Start Your Skilled Trade Career',
      'Master a Craft, Secure Your Future',
      'Hands-On Careers with Real Earning Power'
    ],
    sampleBody: 'Skilled trades offer what many careers can\'t: job security, excellent pay, and the satisfaction of creating tangible results. Whether you\'re interested in electrical work, plumbing, carpentry, welding, or HVAC, discover apprenticeship programs and career paths that lead to independence and financial stability. No four-year degree required—just dedication and skill.',
    keywords: ['trades', 'apprenticeship', 'skilled', 'hands-on', 'electrician', 'plumber', 'carpenter', 'welding']
  },
  [IndustryCategory.businessFinance]: {
    headline: 'Focus on leadership, growth, and financial success',
    bodyTips: [
      'Highlight career advancement and earning potential',
      'Emphasize strategic thinking and leadership skills',
      'Showcase diverse business career paths',
      'Use professional, results-driven language',
      'Focus on ROI and measurable success'
    ],
    ctaTips: [
      'Advance Your Business Career',
      'Discover Leadership Opportunities',
      'Find Your Executive Path',
      'Accelerate Your Professional Growth',
      'Lead with Confidence'
    ],
    audienceTips: [
      'Business professionals seeking advancement',
      'MBA graduates and business students',
      'Entrepreneurs and consultants',
      'Finance and accounting professionals',
      'Mid-career professionals seeking leadership roles'
    ],
    emotionalTone: ['aspiration', 'empowerment', 'urgency'],
    sampleHeadlines: [
      'Lead the Way: Accelerate Your Business Career',
      'From Manager to Executive: Your Path to Leadership',
      'Strategic Careers for Ambitious Professionals'
    ],
    sampleBody: 'Your business acumen deserves a career that rewards strategic thinking and leadership. Explore opportunities in consulting, operations management, financial analysis, and executive leadership. Our platform matches your experience and ambitions with roles that offer growth, competitive compensation, and the chance to drive meaningful business impact. Take the next step in your professional journey.',
    keywords: ['business', 'leadership', 'management', 'finance', 'consulting', 'executive', 'strategy', 'MBA']
  },
  [IndustryCategory.environmentalAgriculture]: {
    headline: 'Emphasize sustainability, impact, and connection to nature',
    bodyTips: [
      'Highlight environmental impact and sustainability',
      'Emphasize outdoor work and connection to nature',
      'Showcase innovative agricultural technologies',
      'Use purpose-driven, eco-conscious language',
      'Focus on making a difference for the planet'
    ],
    ctaTips: [
      'Grow Your Green Career',
      'Discover Sustainable Careers',
      'Find Your Environmental Calling',
      'Cultivate a Better Future',
      'Make an Impact on the Planet'
    ],
    audienceTips: [
      'Environmental scientists and conservationists',
      'Agricultural professionals',
      'Sustainability-focused career changers',
      'Outdoor enthusiasts',
      'Eco-conscious individuals'
    ],
    emotionalTone: ['transformation', 'belonging', 'empowerment'],
    sampleHeadlines: [
      'Cultivate Change: Build a Sustainable Career',
      'Your Passion for Nature Deserves a Purpose-Driven Career',
      'Grow the Future: Environmental and Agricultural Careers'
    ],
    sampleBody: 'Make a real difference for the planet while building a fulfilling career. Whether you\'re passionate about sustainable farming, environmental conservation, renewable energy, or agricultural innovation, discover opportunities that align your values with your professional goals. Join a growing movement of professionals creating a more sustainable future through meaningful work.',
    keywords: ['sustainability', 'environment', 'agriculture', 'conservation', 'green', 'eco-friendly', 'farming', 'renewable']
  },
  [IndustryCategory.marineOutdoor]: {
    headline: 'Celebrate adventure, exploration, and ocean conservation',
    bodyTips: [
      'Highlight adventure and outdoor experiences',
      'Emphasize marine conservation and research',
      'Showcase unique career opportunities',
      'Use adventurous, inspiring language',
      'Focus on exploration and discovery'
    ],
    ctaTips: [
      'Dive Into Marine Careers',
      'Explore Outdoor Opportunities',
      'Discover Ocean Careers',
      'Chart Your Adventure Career',
      'Make Waves in Marine Science'
    ],
    audienceTips: [
      'Marine biologists and oceanographers',
      'Outdoor recreation professionals',
      'Conservation-focused individuals',
      'Adventure seekers',
      'Ocean enthusiasts'
    ],
    emotionalTone: ['curiosity', 'aspiration', 'transformation'],
    sampleHeadlines: [
      'Dive Deep: Explore Careers in Marine Science',
      'Your Love for the Ocean Deserves a Career',
      'Adventure Awaits: Marine and Outdoor Careers'
    ],
    sampleBody: 'Turn your passion for the ocean and outdoors into an extraordinary career. From marine biology and oceanography to coastal conservation and maritime engineering, discover unique opportunities that combine adventure with purpose. Whether you\'re drawn to research, conservation, or outdoor recreation, find a career path that lets you explore, protect, and celebrate our natural world.',
    keywords: ['marine', 'ocean', 'outdoor', 'conservation', 'adventure', 'exploration', 'aquatic', 'coastal']
  }
};

interface CampaignFormData {
  name: string;
  industry: IndustryCategory | '';
  headline: string;
  bodyText: string;
  ctaText: string;
  imageUrl: string;
  targetAudience: string;
  budget: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  scheduledStart: string;
  scheduledEnd: string;
}

export default function CampaignBuilder() {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    industry: '',
    headline: '',
    bodyText: '',
    ctaText: '',
    imageUrl: '',
    targetAudience: '',
    budget: '',
    utmSource: '',
    utmMedium: 'cpc',
    utmCampaign: '',
    scheduledStart: '',
    scheduledEnd: ''
  });

  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [previewMode, setPreviewMode] = useState<'facebook' | 'instagram' | 'linkedin' | 'google'>('facebook');
  const [showGuidance, setShowGuidance] = useState(true);
  const [showEmotionalTips, setShowEmotionalTips] = useState(true);
  const [selectedEmotionalTriggers, setSelectedEmotionalTriggers] = useState<string[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  const { data: campaigns, isLoading: campaignsLoading } = useGetAllCampaigns();
  const { data: templates } = useGetCampaignTemplatesByIndustry(formData.industry as IndustryCategory);
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const updateStatus = useUpdateCampaignStatus();
  const deleteCampaign = useDeleteCampaign();
  const duplicateCampaign = useDuplicateCampaign();
  const { data: preview } = useGenerateCampaignPreview(editingCampaign?.id || '');

  const industryTips = formData.industry ? INDUSTRY_TIPS[formData.industry] : null;
  const industryOption = INDUSTRY_OPTIONS.find(i => i.value === formData.industry);

  useEffect(() => {
    if (editingCampaign) {
      setFormData({
        name: editingCampaign.name,
        industry: editingCampaign.industry,
        headline: editingCampaign.content.headline,
        bodyText: editingCampaign.content.bodyText,
        ctaText: editingCampaign.content.ctaText,
        imageUrl: editingCampaign.content.imageUrl,
        targetAudience: editingCampaign.content.targetAudience,
        budget: editingCampaign.budget.toString(),
        utmSource: editingCampaign.utmParameters.source,
        utmMedium: editingCampaign.utmParameters.medium,
        utmCampaign: editingCampaign.utmParameters.campaign,
        scheduledStart: editingCampaign.scheduledStart ? new Date(Number(editingCampaign.scheduledStart) / 1000000).toISOString().slice(0, 16) : '',
        scheduledEnd: editingCampaign.scheduledEnd ? new Date(Number(editingCampaign.scheduledEnd) / 1000000).toISOString().slice(0, 16) : ''
      });
    }
  }, [editingCampaign]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !editingCampaign) return;

    const timer = setTimeout(() => {
      handleSaveCampaign(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSaveEnabled, editingCampaign]);

  const handleInputChange = (field: keyof CampaignFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplySampleContent = () => {
    if (!industryTips) return;

    const randomHeadline = industryTips.sampleHeadlines[Math.floor(Math.random() * industryTips.sampleHeadlines.length)];
    const randomCTA = industryTips.ctaTips[Math.floor(Math.random() * industryTips.ctaTips.length)];

    setFormData(prev => ({
      ...prev,
      headline: randomHeadline,
      bodyText: industryTips.sampleBody,
      ctaText: randomCTA
    }));

    toast.success('Sample content applied', {
      description: 'Feel free to customize it to match your campaign goals'
    });
  };

  const handleSaveCampaign = async (isAutoSave = false) => {
    if (!formData.name || !formData.industry || !formData.headline || !formData.bodyText || !formData.ctaText) {
      if (!isAutoSave) {
        toast.error('Please fill in all required fields');
      }
      return;
    }

    const content: CampaignContent = {
      headline: formData.headline,
      bodyText: formData.bodyText,
      ctaText: formData.ctaText,
      imageUrl: formData.imageUrl,
      targetAudience: formData.targetAudience
    };

    try {
      if (editingCampaign) {
        await updateCampaign.mutateAsync({
          campaignId: editingCampaign.id,
          name: formData.name,
          content,
          budget: BigInt(parseInt(formData.budget) || 0)
        });
        if (!isAutoSave) {
          toast.success('Campaign updated successfully');
        }
      } else {
        const campaignId = await createCampaign.mutateAsync({
          name: formData.name,
          industry: formData.industry as IndustryCategory,
          content,
          budget: BigInt(parseInt(formData.budget) || 0),
          utmSource: formData.utmSource,
          utmMedium: formData.utmMedium,
          utmCampaign: formData.utmCampaign
        });
        toast.success('Campaign created successfully', {
          description: `Campaign ID: ${campaignId}`
        });
        handleResetForm();
      }
    } catch (error) {
      if (!isAutoSave) {
        toast.error('Failed to save campaign', {
          description: error instanceof Error ? error.message : 'Please try again'
        });
      }
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      industry: '',
      headline: '',
      bodyText: '',
      ctaText: '',
      imageUrl: '',
      targetAudience: '',
      budget: '',
      utmSource: '',
      utmMedium: 'cpc',
      utmCampaign: '',
      scheduledStart: '',
      scheduledEnd: ''
    });
    setEditingCampaign(null);
    setSelectedEmotionalTriggers([]);
  };

  const handleStatusChange = async (campaignId: string, status: CampaignStatus) => {
    try {
      await updateStatus.mutateAsync({ campaignId, status });
      toast.success(`Campaign ${status}`);
    } catch (error) {
      toast.error('Failed to update campaign status');
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await deleteCampaign.mutateAsync(campaignId);
      toast.success('Campaign deleted');
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleDuplicate = async (campaignId: string, name: string) => {
    try {
      const newId = await duplicateCampaign.mutateAsync({
        campaignId,
        newName: `${name} (Copy)`
      });
      toast.success('Campaign duplicated', {
        description: `New campaign ID: ${newId}`
      });
    } catch (error) {
      toast.error('Failed to duplicate campaign');
    }
  };

  const toggleEmotionalTrigger = (trigger: string) => {
    setSelectedEmotionalTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const getStatusBadge = (status: CampaignStatus) => {
    const variants: Record<CampaignStatus, { variant: 'default' | 'secondary' | 'outline', className: string }> = {
      [CampaignStatus.draft]: { variant: 'secondary', className: '' },
      [CampaignStatus.active]: { variant: 'default', className: 'bg-green-600' },
      [CampaignStatus.paused]: { variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
      [CampaignStatus.completed]: { variant: 'outline', className: '' }
    };
    
    const config = variants[status];
    return <Badge variant={config.variant} className={config.className}>{status.toUpperCase()}</Badge>;
  };

  const renderPreview = () => {
    const baseUrl = window.location.origin;
    const utmUrl = `${baseUrl}?utm_source=${formData.utmSource || 'preview'}&utm_medium=${formData.utmMedium}&utm_campaign=${formData.utmCampaign || 'preview'}`;

    const previewConfigs = {
      facebook: {
        dimensions: '1200x628',
        aspectRatio: 'aspect-[1200/628]',
        title: 'Facebook Feed',
        bgColor: 'bg-[#1877f2]/5'
      },
      instagram: {
        dimensions: '1080x1080',
        aspectRatio: 'aspect-square',
        title: 'Instagram Post',
        bgColor: 'bg-gradient-to-br from-purple-500/5 to-pink-500/5'
      },
      linkedin: {
        dimensions: '1200x627',
        aspectRatio: 'aspect-[1200/627]',
        title: 'LinkedIn Sponsored',
        bgColor: 'bg-[#0077b5]/5'
      },
      google: {
        dimensions: '1200x628',
        aspectRatio: 'aspect-[1200/628]',
        title: 'Google Display Ad',
        bgColor: 'bg-blue-500/5'
      }
    };

    const config = previewConfigs[previewMode];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {config.title}
          </h3>
          <div className="flex gap-1 flex-wrap">
            {(['facebook', 'instagram', 'linkedin', 'google'] as const).map((platform) => (
              <Button
                key={platform}
                variant={previewMode === platform ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode(platform)}
                className="text-xs"
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className={`border rounded-lg p-4 ${config.bgColor}`}>
          <div className={`${config.aspectRatio} bg-gradient-to-br ${industryOption?.color || 'from-primary/10 to-secondary/10'} rounded-lg overflow-hidden mb-3 flex items-center justify-center relative`}>
            {formData.imageUrl ? (
              <img src={formData.imageUrl} alt="Campaign preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-muted-foreground p-4">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Campaign Image Preview</p>
                <p className="text-xs mt-1">{config.dimensions}</p>
              </div>
            )}
            {industryOption && (
              <div className="absolute top-2 right-2 text-4xl">{industryOption.icon}</div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-lg line-clamp-2">{formData.headline || 'Your Campaign Headline'}</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {formData.bodyText || 'Your campaign body text will appear here. Make it compelling and emotionally resonant!'}
            </p>
            <Button className="w-full" size="sm">
              {formData.ctaText || 'Your Call-to-Action'}
            </Button>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground font-mono truncate">
                {utmUrl}
              </p>
            </div>
          </div>
        </div>

        {selectedEmotionalTriggers.length > 0 && (
          <Alert className="border-purple-500/50 bg-purple-500/5">
            <Heart className="h-4 w-4 text-purple-600" />
            <AlertTitle className="text-sm">Emotional Triggers Active</AlertTitle>
            <AlertDescription className="text-xs">
              {selectedEmotionalTriggers.map(t => EMOTIONAL_TRIGGERS[t as keyof typeof EMOTIONAL_TRIGGERS]?.label).join(', ')}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${industryOption?.color || 'from-purple-500 to-pink-600'} flex items-center justify-center`}>
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Campaign Builder</h2>
            <p className="text-sm text-muted-foreground">
              Create emotionally persuasive campaigns with AI-powered guidance
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {editingCampaign && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
              <Switch
                checked={autoSaveEnabled}
                onCheckedChange={setAutoSaveEnabled}
                id="auto-save"
              />
              <Label htmlFor="auto-save" className="text-xs cursor-pointer">Auto-save</Label>
            </div>
          )}
          <Button onClick={handleResetForm} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="gap-2">
            <Edit className="h-4 w-4" />
            Create / Edit
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Campaign Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Campaign Form - Left Side */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {editingCampaign ? 'Edit Campaign' : 'Campaign Details'}
                  </CardTitle>
                  <CardDescription>
                    {editingCampaign ? `Editing: ${editingCampaign.name}` : 'Create a new marketing campaign with guided best practices'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Tech Career Discovery Q1 2026"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry Category *</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleInputChange('industry', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span>{option.icon}</span>
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {industryTips && (
                    <>
                      {showGuidance && (
                        <Alert className="border-primary/50 bg-primary/5">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          <AlertTitle className="text-sm font-semibold">Industry Best Practices</AlertTitle>
                          <AlertDescription className="text-xs space-y-2">
                            <p>{industryTips.headline}</p>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => setShowGuidance(false)}
                            >
                              Hide guidance
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleApplySampleContent}
                          className="gap-2"
                        >
                          <Wand2 className="h-4 w-4" />
                          Generate Sample Content
                        </Button>
                        {!showGuidance && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowGuidance(true)}
                            className="text-xs"
                          >
                            Show guidance
                          </Button>
                        )}
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Emotional Triggers Section */}
                  {industryTips && showEmotionalTips && (
                    <div className="space-y-3 p-4 rounded-lg border bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <Label className="text-sm font-semibold">Emotional Triggers</Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEmotionalTips(false)}
                          className="h-6 text-xs"
                        >
                          Hide
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select emotional triggers to guide your messaging strategy
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {industryTips.emotionalTone.map((trigger) => {
                          const triggerData = EMOTIONAL_TRIGGERS[trigger as keyof typeof EMOTIONAL_TRIGGERS];
                          if (!triggerData) return null;
                          
                          return (
                            <Button
                              key={trigger}
                              variant={selectedEmotionalTriggers.includes(trigger) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleEmotionalTrigger(trigger)}
                              className="justify-start gap-2 h-auto py-2"
                            >
                              <span>{triggerData.icon}</span>
                              <div className="text-left">
                                <div className="text-xs font-medium">{triggerData.label}</div>
                                <div className="text-[10px] opacity-70">{triggerData.tip}</div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!showEmotionalTips && industryTips && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmotionalTips(true)}
                      className="w-full gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      Show Emotional Triggers
                    </Button>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="headline">Campaign Headline *</Label>
                      <span className="text-xs text-muted-foreground">{formData.headline.length}/100</span>
                    </div>
                    <Input
                      id="headline"
                      placeholder="Compelling headline that grabs attention"
                      value={formData.headline}
                      onChange={(e) => handleInputChange('headline', e.target.value.slice(0, 100))}
                    />
                    {industryTips && (
                      <div className="text-xs text-muted-foreground space-y-1 p-2 rounded bg-muted/30">
                        <p className="font-medium flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Headline Tips:
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 ml-1">
                          <li>Keep it under 60 characters for best results</li>
                          <li>Use action words and emotional triggers</li>
                          <li>Focus on benefits, not features</li>
                          <li>Create urgency or curiosity</li>
                        </ul>
                        {industryTips.sampleHeadlines.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="font-medium mb-1">Examples:</p>
                            <div className="space-y-1">
                              {industryTips.sampleHeadlines.slice(0, 2).map((sample, i) => (
                                <Button
                                  key={i}
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto py-1 px-2 text-xs justify-start w-full text-left"
                                  onClick={() => handleInputChange('headline', sample)}
                                >
                                  "{sample}"
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bodyText">Body Text *</Label>
                      <span className="text-xs text-muted-foreground">{formData.bodyText.length}/500</span>
                    </div>
                    <Textarea
                      id="bodyText"
                      placeholder="Persuasive body copy that resonates with your audience..."
                      value={formData.bodyText}
                      onChange={(e) => handleInputChange('bodyText', e.target.value.slice(0, 500))}
                      rows={6}
                    />
                    {industryTips && (
                      <div className="text-xs text-muted-foreground space-y-1 p-2 rounded bg-muted/30">
                        <p className="font-medium flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Best practices for {industryOption?.label}:
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 ml-1">
                          {industryTips.bodyTips.slice(0, 3).map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ctaText">Call-to-Action Text *</Label>
                    <Input
                      id="ctaText"
                      placeholder="e.g., Discover Your Career Path"
                      value={formData.ctaText}
                      onChange={(e) => handleInputChange('ctaText', e.target.value.slice(0, 50))}
                    />
                    {industryTips && (
                      <div className="text-xs text-muted-foreground p-2 rounded bg-muted/30">
                        <p className="font-medium mb-1 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Suggested CTAs:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {industryTips.ctaTips.slice(0, 4).map((cta, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleInputChange('ctaText', cta)}
                            >
                              {cta}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Campaign Image URL</Label>
                    <Input
                      id="imageUrl"
                      placeholder="/assets/generated/campaign-image.png"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use images from /assets/generated/ or provide external URL
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Textarea
                      id="targetAudience"
                      placeholder="Describe your target audience demographics and interests..."
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      rows={3}
                    />
                    {industryTips && (
                      <div className="text-xs text-muted-foreground p-2 rounded bg-muted/30">
                        <p className="font-medium mb-1 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Target audiences for {industryOption?.label}:
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 ml-1">
                          {industryTips.audienceTips.slice(0, 3).map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Campaign Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="budget"
                        type="number"
                        placeholder="1000"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledStart" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Start Date
                      </Label>
                      <Input
                        id="scheduledStart"
                        type="datetime-local"
                        value={formData.scheduledStart}
                        onChange={(e) => handleInputChange('scheduledStart', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledEnd" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        End Date
                      </Label>
                      <Input
                        id="scheduledEnd"
                        type="datetime-local"
                        value={formData.scheduledEnd}
                        onChange={(e) => handleInputChange('scheduledEnd', e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>UTM Parameters</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="utm_source (e.g., facebook)"
                        value={formData.utmSource}
                        onChange={(e) => handleInputChange('utmSource', e.target.value)}
                      />
                      <Input
                        placeholder="utm_medium (e.g., cpc)"
                        value={formData.utmMedium}
                        onChange={(e) => handleInputChange('utmMedium', e.target.value)}
                      />
                      <Input
                        placeholder="utm_campaign (e.g., career_discovery)"
                        value={formData.utmCampaign}
                        onChange={(e) => handleInputChange('utmCampaign', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleSaveCampaign(false)}
                      disabled={createCampaign.isPending || updateCampaign.isPending}
                      className="flex-1 gap-2"
                    >
                      {(createCampaign.isPending || updateCampaign.isPending) ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                        </>
                      )}
                    </Button>
                    {editingCampaign && (
                      <Button variant="outline" onClick={handleResetForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-Time Preview - Right Side */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Real-Time Preview
                  </CardTitle>
                  <CardDescription>
                    See how your campaign appears across platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderPreview()}
                </CardContent>
              </Card>

              {preview && (
                <Card className="border-green-500/50 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Campaign Preview Generated
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Headline:</p>
                      <p className="text-sm text-muted-foreground">{preview.headline}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">UTM URL:</p>
                      <div className="flex gap-2">
                        <Input value={preview.utmUrl} readOnly className="text-xs font-mono" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(preview.utmUrl);
                            toast.success('URL copied to clipboard');
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {industryTips && (
                <Card className="border-blue-500/50 bg-blue-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      SEO Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {industryTips.keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Campaign Library
              </CardTitle>
              <CardDescription>
                Manage all your marketing campaigns in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : campaigns && campaigns.length > 0 ? (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        onEdit={setEditingCampaign}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">No campaigns yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first marketing campaign to get started
                  </p>
                  <Button onClick={() => {
                    const createTab = document.querySelector('[value="create"]') as HTMLElement;
                    createTab?.click();
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onStatusChange: (id: string, status: CampaignStatus) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, name: string) => void;
  getStatusBadge: (status: CampaignStatus) => React.ReactElement;
}

function CampaignCard({ campaign, onEdit, onStatusChange, onDelete, onDuplicate, getStatusBadge }: CampaignCardProps) {
  const { data: performance } = useGetCampaignPerformance(campaign.id);
  const industryOption = INDUSTRY_OPTIONS.find(i => i.value === campaign.industry);

  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {industryOption && <span className="text-xl">{industryOption.icon}</span>}
            <h3 className="font-semibold truncate">{campaign.name}</h3>
            {getStatusBadge(campaign.status)}
          </div>
          <p className="text-sm text-muted-foreground">{industryOption?.label}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button size="sm" variant="ghost" onClick={() => onEdit(campaign)} title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDuplicate(campaign.id, campaign.name)} title="Duplicate">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(campaign.id)} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium line-clamp-1">{campaign.content.headline}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{campaign.content.bodyText}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            {campaign.content.ctaText}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <DollarSign className="h-3 w-3 mr-1" />
            ${Number(campaign.budget).toLocaleString()}
          </Badge>
        </div>
      </div>

      {performance && (
        <div className="grid grid-cols-4 gap-2 pt-2 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Impressions</p>
            <p className="text-sm font-semibold">{Number(performance.impressions).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Clicks</p>
            <p className="text-sm font-semibold">{Number(performance.clicks).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">CTR</p>
            <p className="text-sm font-semibold">{(performance.ctr * 100).toFixed(2)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">ROI</p>
            <p className="text-sm font-semibold">{(performance.roi * 100).toFixed(0)}%</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {campaign.status === CampaignStatus.draft && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onStatusChange(campaign.id, CampaignStatus.active)}
          >
            <Play className="h-3 w-3" />
            Activate
          </Button>
        )}
        {campaign.status === CampaignStatus.active && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onStatusChange(campaign.id, CampaignStatus.paused)}
          >
            <Pause className="h-3 w-3" />
            Pause
          </Button>
        )}
        {campaign.status === CampaignStatus.paused && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onStatusChange(campaign.id, CampaignStatus.active)}
          >
            <Play className="h-3 w-3" />
            Resume
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => window.open(`${window.location.origin}?utm_source=${campaign.utmParameters.source}&utm_medium=${campaign.utmParameters.medium}&utm_campaign=${campaign.utmParameters.campaign}`, '_blank')}
        >
          <ExternalLink className="h-3 w-3" />
          Preview
        </Button>
      </div>
    </div>
  );
}
