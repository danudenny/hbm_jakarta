import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Layout, Image, Zap, BarChart2, MousePointer } from 'lucide-react';
import { Link } from 'react-router-dom';
import TabComponent from './common/TabComponent';
import GeneralTab from './hero/GeneralTab';
import CTATab from './hero/CTATab';
import BackgroundTab from './hero/BackgroundTab';
import FeaturesTab from './hero/FeaturesTab';
import StatsTab from './hero/StatsTab';

type HeroSectionContent = {
  id: string;
  name: string;
  title: string;
  subtitle: string | null;
  content: {
    description: string;
    cta_text: string;
    cta_link: string;
    background_image: string;
    features: Array<{
      title: string;
      description: string;
    }>;
    stats: Array<{
      value: number;
      suffix: string;
      label: string;
      duration?: number;
    }>;
  };
  is_active: boolean;
};

const HeroSectionEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<HeroSectionContent | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: {
      description: '',
      cta_text: '',
      cta_link: '',
      background_image: '',
      features: [
        { title: '', description: '' },
        { title: '', description: '' }
      ],
      stats: [
        { value: 5000, suffix: '', label: 'Visas Processed', duration: 2.5 },
        { value: 98, suffix: '%', label: 'Success Rate', duration: 2.5 },
        { value: 200, suffix: '+', label: 'Partner Companies', duration: 2.5 },
        { value: 10, suffix: '+', label: 'Years Experience', duration: 2.5 }
      ]
    },
    is_active: true
  });

  useEffect(() => {
    fetchHeroSection();
  }, []);

  const fetchHeroSection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('landing_sections')
        .select('*')
        .eq('name', 'hero')
        .single();

      if (error) throw error;
      
      setSection(data);
      
      // Initialize stats array if it doesn't exist in the data
      const content = {
        ...data.content,
        stats: data.content.stats || [
          { value: 5000, suffix: '', label: 'Visas Processed', duration: 2.5 },
          { value: 98, suffix: '%', label: 'Success Rate', duration: 2.5 },
          { value: 200, suffix: '+', label: 'Partner Companies', duration: 2.5 },
          { value: 10, suffix: '+', label: 'Years Experience', duration: 2.5 }
        ]
      };
      
      setFormData({
        title: data.title,
        subtitle: data.subtitle || '',
        content: content,
        is_active: data.is_active
      });
    } catch (error: any) {
      toast.error(`Error loading hero section: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!section) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('landing_sections')
        .update({
          title: formData.title,
          subtitle: formData.subtitle || null,
          content: formData.content,
          is_active: formData.is_active
        })
        .eq('id', section.id);

      if (error) throw error;
      
      toast.success('Hero section updated successfully');
      fetchHeroSection();
    } catch (error: any) {
      toast.error(`Error saving hero section: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleContentChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [key]: value
      }
    }));
  };

  const handleFeatureChange = (index: number, key: string, value: string) => {
    setFormData((prev) => {
      const newFeatures = [...prev.content.features];
      newFeatures[index] = {
        ...newFeatures[index],
        [key]: value
      };
      
      return {
        ...prev,
        content: {
          ...prev.content,
          features: newFeatures
        }
      };
    });
  };

  const handleStatChange = (index: number, key: string, value: any) => {
    setFormData((prev) => {
      const newStats = [...prev.content.stats];
      newStats[index] = {
        ...newStats[index],
        [key]: key === 'value' || key === 'duration' ? Number(value) : value
      };
      
      return {
        ...prev,
        content: {
          ...prev.content,
          stats: newStats
        }
      };
    });
  };
  
  const handleAddStat = () => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        stats: [
          ...prev.content.stats,
          { value: 0, suffix: '', label: 'New Stat', duration: 2.5 }
        ]
      }
    }));
  };
  
  const handleRemoveStat = (index: number) => {
    setFormData((prev) => {
      const newStats = [...prev.content.stats];
      newStats.splice(index, 1);
      
      return {
        ...prev,
        content: {
          ...prev.content,
          stats: newStats
        }
      };
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Layout size={16} /> },
    { id: 'cta', label: 'Call to Action', icon: <MousePointer size={16} /> },
    { id: 'background', label: 'Background', icon: <Image size={16} /> },
    { id: 'features', label: 'Features', icon: <Zap size={16} /> },
    { id: 'stats', label: 'Stats', icon: <BarChart2 size={16} /> },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 mb-4">Hero section not found in the database.</p>
        <Link to="/admin/site-content" className="btn btn-primary">
          Back to Content Manager
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/admin/site-content" className="mr-4 p-2 rounded-full hover:bg-gray-200">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Edit Hero Section</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <TabComponent 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          className="px-6 pt-4"
        />
        
        <div className="p-6">
          {activeTab === 'general' && (
            <GeneralTab
              title={formData.title}
              subtitle={formData.subtitle}
              description={formData.content.description}
              isActive={formData.is_active}
              onTitleChange={(value) => handleInputChange('title', value)}
              onSubtitleChange={(value) => handleInputChange('subtitle', value)}
              onDescriptionChange={(value) => handleContentChange('description', value)}
              onActiveChange={(value) => handleInputChange('is_active', value)}
            />
          )}
          
          {activeTab === 'cta' && (
            <CTATab
              ctaText={formData.content.cta_text}
              ctaLink={formData.content.cta_link}
              onCtaTextChange={(value) => handleContentChange('cta_text', value)}
              onCtaLinkChange={(value) => handleContentChange('cta_link', value)}
            />
          )}
          
          {activeTab === 'background' && (
            <BackgroundTab
              backgroundImage={formData.content.background_image}
              onBackgroundImageChange={(value) => handleContentChange('background_image', value)}
            />
          )}
          
          {activeTab === 'features' && (
            <FeaturesTab
              features={formData.content.features}
              onFeatureChange={handleFeatureChange}
            />
          )}
          
          {activeTab === 'stats' && (
            <StatsTab
              stats={formData.content.stats}
              onStatChange={handleStatChange}
              onAddStat={handleAddStat}
              onRemoveStat={handleRemoveStat}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSectionEditor;
