import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

type BackgroundTabProps = {
  backgroundImage: string;
  onBackgroundImageChange: (value: string) => void;
};

const BackgroundTab: React.FC<BackgroundTabProps> = ({
  backgroundImage,
  onBackgroundImageChange,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    setUploading(true);

    try {
      // Instead of uploading to Supabase, we'll use a data URL approach
      // This allows us to embed the image directly without needing storage permissions
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          // The result is a data URL representing the file
          const dataUrl = event.target.result as string;
          onBackgroundImageChange(dataUrl);
          toast.success('Image loaded successfully');
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        toast.error('Error reading the image file');
        setUploading(false);
      };
      
      // Read the file as a data URL
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error(`Error processing image: ${error.message}`);
      setUploading(false);
    } finally {
      // Clear the file input
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    onBackgroundImageChange('');
  };

  return (
    <div className="space-y-6 py-4">
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Background Image Settings</h3>
        <p className="text-xs text-gray-500">
          Upload or provide a URL for the hero section background image. For best results, use a high-quality image with dimensions of at least 1920x1080 pixels.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          <strong>Note:</strong> Uploaded images are encoded directly in the database. For production use, consider using an image hosting service and entering the URL.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={backgroundImage && !backgroundImage.startsWith('data:') ? backgroundImage : ''}
              onChange={(e) => onBackgroundImageChange(e.target.value)}
              placeholder="Enter image URL or upload an image"
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
            <div className="relative">
              <input
                type="file"
                id="background-image-upload"
                onChange={handleFileUpload}
                accept="image/*"
                className="sr-only"
                disabled={uploading}
              />
              <label
                htmlFor="background-image-upload"
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700 mr-2"></div>
                    Processing...
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
        </div>

        {backgroundImage && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="relative border border-gray-200 rounded-md overflow-hidden">
              <div className="absolute top-2 right-2 z-10">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                >
                  <X size={16} />
                </button>
              </div>
              <img 
                src={backgroundImage} 
                alt="Background Preview" 
                className="w-full h-64 object-cover"
              />
            </div>
            {backgroundImage.startsWith('data:') && (
              <p className="text-xs text-amber-600 mt-2">
                This image is stored as a data URL. For better performance with large images, consider using an external image hosting service.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundTab;
