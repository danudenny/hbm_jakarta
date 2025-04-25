import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Plus, Trash, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';

type Advantage = {
  id: string;
  text: string;
};

type AboutSectionData = {
  title: string;
  subtitle: string;
  content: {
    description1: string;
    description2: string;
    image: string;
    experience_years: number;
    experience_label: string;
    advantages: Advantage[];
    cta_text: string;
    cta_link: string;
  };
  is_active: boolean;
};

const AboutSectionEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<AboutSectionData>({
    title: '',
    subtitle: '',
    content: {
      description1: '',
      description2: '',
      image: '',
      experience_years: 10,
      experience_label: 'Experience',
      advantages: [],
      cta_text: 'Get In Touch',
      cta_link: '#contact'
    },
    is_active: true
  });

  useEffect(() => {
    fetchAboutSection();
  }, []);

  const fetchAboutSection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('landing_sections')
        .select('*')
        .eq('name', 'about')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, create a new section
          await createDefaultSection();
          return;
        }
        throw error;
      }
      
      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        content: {
          description1: data.content.description1 || '',
          description2: data.content.description2 || '',
          image: data.content.image || '',
          experience_years: data.content.experience_years || 10,
          experience_label: data.content.experience_label || 'Experience',
          advantages: data.content.advantages || [],
          cta_text: data.content.cta_text || 'Get In Touch',
          cta_link: data.content.cta_link || '#contact'
        },
        is_active: data.is_active
      });
    } catch (error: any) {
      toast.error(`Error loading about section: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSection = async () => {
    try {
      const defaultAdvantages = [
        { id: '1', text: "Extensive experience with Indonesian immigration regulations" },
        { id: '2', text: "Direct relationships with immigration offices" },
        { id: '3', text: "Dedicated case managers for each client" },
        { id: '4', text: "Multilingual support staff (English, Indonesian, Mandarin)" },
        { id: '5', text: "Regular status updates throughout the process" },
        { id: '6', text: "Transparent pricing with no hidden fees" }
      ];

      const defaultSection = {
        name: 'about',
        title: 'Your Trusted Partner for Immigration Solutions',
        subtitle: 'ABOUT US',
        content: {
          description1: 'Since 2014, we have been providing expert consultation and comprehensive documentation services for foreign workers and companies operating in Indonesia. Our team of experienced professionals understands the complexities of Indonesian immigration laws and processes.',
          description2: 'We take pride in our attention to detail, ensuring that every application is properly prepared, submitted, and followed through to successful completion. Our goal is to make the immigration process as smooth and stress-free as possible for our clients.',
          image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
          experience_years: 10,
          experience_label: 'Experience',
          advantages: defaultAdvantages,
          cta_text: 'Get In Touch',
          cta_link: '#contact'
        },
        is_active: true
      };

      const { data, error } = await supabase
        .from('landing_sections')
        .insert(defaultSection)
        .select()
        .single();

      if (error) throw error;
      
      setFormData({
        title: data.title,
        subtitle: data.subtitle || '',
        content: data.content,
        is_active: data.is_active
      });
      
      toast.success('Created default about section');
    } catch (error: any) {
      toast.error(`Error creating default section: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleContentChange = (field: string, value: string | number | Advantage[]) => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [field]: value
      }
    });
  };

  const handleAdvantageChange = (index: number, value: string) => {
    const newAdvantages = [...formData.content.advantages];
    newAdvantages[index] = { ...newAdvantages[index], text: value };
    
    handleContentChange('advantages', newAdvantages);
  };

  const handleAddAdvantage = () => {
    const newAdvantage = { id: Date.now().toString(), text: '' };
    const newAdvantages = [...formData.content.advantages, newAdvantage];
    
    handleContentChange('advantages', newAdvantages);
  };

  const handleRemoveAdvantage = (index: number) => {
    const newAdvantages = [...formData.content.advantages];
    newAdvantages.splice(index, 1);
    
    handleContentChange('advantages', newAdvantages);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    
    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image');
      return;
    }

    setUploading(true);

    try {
      // Instead of uploading to Supabase Storage which has RLS issues,
      // we'll convert the image to a data URL and use that directly
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const dataUrl = event.target.result as string;
          
          // Update form data with the data URL
          handleContentChange('image', dataUrl);
          toast.success('Image uploaded successfully');
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        toast.error('Error reading file');
        setUploading(false);
      };
      
      // Read the file as a data URL
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error(`Error uploading image: ${error.message}`);
      setUploading(false);
    } finally {
      // Clear the file input
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    handleContentChange('image', '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('landing_sections')
        .update({
          title: formData.title,
          subtitle: formData.subtitle,
          content: formData.content,
          is_active: formData.is_active
        })
        .eq('name', 'about');
      
      if (error) throw error;
      
      toast.success('About section updated successfully');
    } catch (error: any) {
      toast.error(`Error saving section: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/admin" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit About Section</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Content & Image */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Paragraph</label>
                <textarea
                  value={formData.content.description1}
                  onChange={(e) => handleContentChange('description1', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Describe your company's history and mission..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will appear as the first paragraph in the about section
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Second Paragraph</label>
                <textarea
                  value={formData.content.description2}
                  onChange={(e) => handleContentChange('description2', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Describe your company's values and approach..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will appear as the second paragraph in the about section
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">About Image</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={formData.content.image}
                  onChange={(e) => handleContentChange('image', e.target.value)}
                  placeholder="Enter image URL or upload an image"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                <div className="relative">
                  <input
                    type="file"
                    id="about-image-upload"
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="about-image-upload"
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700 mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="mr-2" />
                        Upload
                      </>
                    )}
                  </label>
                </div>
              </div>

              {formData.content.image && (
                <div className="relative mt-2">
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <img 
                    src={formData.content.image} 
                    alt="About Preview" 
                    className="w-full h-60 object-cover rounded-md"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">
                Choose a high-quality image that represents your company or team
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Experience</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Years</label>
                <input
                  type="number"
                  value={formData.content.experience_years}
                  onChange={(e) => handleContentChange('experience_years', parseInt(e.target.value))}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Number of years of experience
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Label</label>
                <input
                  type="text"
                  value={formData.content.experience_label}
                  onChange={(e) => handleContentChange('experience_label', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g. Years Experience"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Label displayed below the years number
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Section Settings & Advantages */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Section Settings</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="e.g. ABOUT US"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Appears above the main title (usually in uppercase)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. Your Trusted Partner"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The main heading for this section
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.content.cta_text}
                    onChange={(e) => handleContentChange('cta_text', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. Get In Touch"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Text displayed on the call-to-action button
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Link</label>
                  <input
                    type="text"
                    value={formData.content.cta_link}
                    onChange={(e) => handleContentChange('cta_link', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. #contact"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use # for page sections (e.g. #contact) or full URLs
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-700">Section Status</span>
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-3 text-sm text-gray-500">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                When disabled, this section will not be shown on the landing page
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Advantages</h2>
              <button
                type="button"
                onClick={handleAddAdvantage}
                className="flex items-center px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Advantage</span>
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              List the key advantages or unique selling points of your company
            </p>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {formData.content.advantages.map((advantage, index) => (
                <div key={advantage.id} className="flex items-start group bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 mr-3 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={advantage.text}
                    onChange={(e) => handleAdvantageChange(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md bg-white"
                    placeholder="Enter an advantage..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAdvantage(index)}
                    className="ml-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={formData.content.advantages.length <= 1}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Full-width Preview Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Preview</h2>
        <div className="p-6 bg-gray-50 rounded-md">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              {formData.subtitle && (
                <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">
                  {formData.subtitle}
                </p>
              )}
              <h3 className="text-3xl font-semibold mb-4">{formData.title}</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {formData.content.description1 && (
                  <p className="text-gray-600">{formData.content.description1}</p>
                )}
                
                {formData.content.description2 && (
                  <p className="text-gray-600">{formData.content.description2}</p>
                )}
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formData.content.experience_years}+
                    </div>
                    <div className="text-sm text-gray-500">
                      {formData.content.experience_label}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formData.content.advantages.length}
                    </div>
                    <div className="text-sm text-gray-500">
                      Advantages
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-primary mb-1">
                      24/7
                    </div>
                    <div className="text-sm text-gray-500">
                      Support
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                  {formData.content.advantages.slice(0, 6).map((advantage, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-2 text-sm text-gray-600">{advantage.text}</p>
                    </div>
                  ))}
                </div>
                
                {formData.content.cta_text && (
                  <div className="mt-8">
                    <button className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                      {formData.content.cta_text}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="relative">
                {formData.content.image ? (
                  <img 
                    src={formData.content.image} 
                    alt="About" 
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">No image uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSectionEditor;
