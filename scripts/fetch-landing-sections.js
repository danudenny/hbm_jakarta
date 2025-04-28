// Script to fetch all landing sections data from Supabase
// and output as JSON (excluding image-based content)
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and key are required. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchLandingSections() {
  try {
    console.log('Fetching landing sections data from Supabase...');
    
    // Fetch all records from landing_sections table
    const { data, error } = await supabase
      .from('landing_sections')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No landing sections found');
      return;
    }
    
    console.log(`Found ${data.length} landing sections`);
    
    // Process each section to extract title, subtitle, and content (excluding images)
    const processedData = data.map(section => {
      const { name, title, subtitle, content, is_active } = section;
      
      // Create a new content object without image-based properties
      let processedContent = {};
      
      if (content) {
        // Deep clone the content object
        processedContent = JSON.parse(JSON.stringify(content));
        
        // Remove image-based properties from content
        removeImageProperties(processedContent);
      }
      
      return {
        name,
        title,
        subtitle,
        content: processedContent,
        is_active
      };
    });
    
    // Write the processed data to a JSON file
    const outputPath = './landing-sections-data.json';
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));
    
    console.log(`Landing sections data written to ${outputPath}`);
    
    // Also output to console
    console.log('\nLanding Sections Data:');
    console.log(JSON.stringify(processedData, null, 2));
    
    return processedData;
  } catch (error) {
    console.error('Error fetching landing sections:', error);
  }
}

// Helper function to recursively remove image properties from an object
function removeImageProperties(obj) {
  if (!obj || typeof obj !== 'object') return;
  
  // Image-related property names to remove
  const imageProps = [
    'image', 'images', 'background_image', 'logo', 'icon_url', 'avatar',
    'thumbnail', 'photo', 'banner', 'cover', 'picture', 'img', 'src'
  ];
  
  // For arrays, process each item
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      if (item && typeof item === 'object') {
        removeImageProperties(item);
      }
    });
    return;
  }
  
  // For objects, check each property
  for (const key in obj) {
    // Remove properties that contain image-related keywords
    if (imageProps.some(prop => key.toLowerCase().includes(prop))) {
      delete obj[key];
      continue;
    }
    
    // Recursively process nested objects
    if (obj[key] && typeof obj[key] === 'object') {
      removeImageProperties(obj[key]);
      
      // If the object is now empty after removing image properties, remove it too
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
}

// Execute the function
fetchLandingSections();
