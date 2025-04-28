import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Download } from 'lucide-react';

// Define the type for landing section data
type LandingSection = {
  id: string;
  name: string;
  title: string;
  subtitle: string | null;
  content: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Function to remove image-based properties
const removeImageProperties = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Image-related property names to remove
  const imageProps = [
    'image', 'images', 'background_image', 'logo', 'icon_url', 'avatar',
    'thumbnail', 'photo', 'banner', 'cover', 'picture', 'img', 'src'
  ];
  
  // For arrays, process each item
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (item && typeof item === 'object') {
        return removeImageProperties(item);
      }
      return item;
    });
  }
  
  // For objects, check each property
  const result = { ...obj };
  for (const key in result) {
    // Remove properties that contain image-related keywords
    if (imageProps.some(prop => key.toLowerCase().includes(prop))) {
      delete result[key];
      continue;
    }
    
    // Recursively process nested objects
    if (result[key] && typeof result[key] === 'object') {
      result[key] = removeImageProperties(result[key]);
      
      // If the object is now empty after removing image properties, remove it too
      if (Object.keys(result[key]).length === 0) {
        delete result[key];
      }
    }
  }
  
  return result;
};

const LandingSectionsDataExport: React.FC = () => {
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<any>(null);

  useEffect(() => {
    const fetchLandingSections = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('landing_sections')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          setSections(data);
          
          // Process data to remove image content
          const processed = data.map(section => {
            const { name, title, subtitle, content, is_active } = section;
            
            // Create a new content object without image-based properties
            let processedContent = {};
            
            if (content) {
              // Deep clone the content object
              processedContent = removeImageProperties(JSON.parse(JSON.stringify(content)));
            }
            
            return {
              name,
              title,
              subtitle,
              content: processedContent,
              is_active
            };
          });
          
          setProcessedData(processed);
        }
      } catch (err: any) {
        console.error('Error fetching landing sections:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLandingSections();
  }, []);

  const downloadJson = () => {
    if (!processedData) return;
    
    const dataStr = JSON.stringify(processedData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'landing-sections-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Landing Sections Data Export</h1>
        <button 
          onClick={downloadJson}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          <Download size={18} />
          <span>Download JSON</span>
        </button>
      </div>
      
      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-gray-700">
            This page displays all landing section data from the database, with image content removed.
            You can download the JSON data using the button above.
          </p>
        </div>
        
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Processed JSON (Without Images)</h2>
        <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[500px] border border-gray-200">
          <pre className="text-sm text-gray-800">
            {JSON.stringify(processedData, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Available Sections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <div 
              key={section.id} 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{section.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${section.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {section.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">{section.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingSectionsDataExport;
