import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

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

const LandingSectionsData: React.FC = () => {
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

  if (loading) {
    return <div>Loading landing sections data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Landing Sections Data</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Processed JSON (Without Images)</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
          {JSON.stringify(processedData, null, 2)}
        </pre>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Raw Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px]">
          {JSON.stringify(sections, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default LandingSectionsData;
