import React from 'react';

type Feature = {
  title: string;
  description: string;
};

type FeaturesTabProps = {
  features: Feature[];
  onFeatureChange: (index: number, key: string, value: string) => void;
};

const FeaturesTab: React.FC<FeaturesTabProps> = ({
  features,
  onFeatureChange,
}) => {
  return (
    <div className="space-y-6 py-4">
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Features Settings</h3>
        <p className="text-xs text-gray-500">
          Configure the key features or benefits that appear in the hero section. These should highlight the main advantages of your services.
        </p>
      </div>

      <div className="space-y-6">
        {features.map((feature, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
            <h4 className="font-medium text-gray-700 mb-3">Feature #{index + 1}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={feature.title}
                  onChange={(e) => onFeatureChange(index, 'title', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Fast Processing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={feature.description}
                  onChange={(e) => onFeatureChange(index, 'description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Get your visa processed in record time"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 border border-gray-200 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-100 rounded-md">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-3 rounded shadow-sm">
              <h5 className="font-medium text-primary">{feature.title || 'Feature Title'}</h5>
              <p className="text-sm text-gray-600 mt-1">{feature.description || 'Feature description goes here'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesTab;
