import React from 'react';
import { Plus, Trash } from 'lucide-react';

type SocialLink = {
  id: string;
  platform: string;
  url: string;
  iconName: string;
};

type SocialLinksTabProps = {
  socialLinks: SocialLink[];
  onSocialLinkChange: (id: string, field: string, value: string) => void;
  onAddSocialLink: () => void;
  onRemoveSocialLink: (id: string) => void;
};

const SocialLinksTab: React.FC<SocialLinksTabProps> = ({
  socialLinks,
  onSocialLinkChange,
  onAddSocialLink,
  onRemoveSocialLink,
}) => {
  // Available social media platforms with their icons
  const availablePlatforms = [
    { name: 'Facebook', icon: 'Facebook' },
    { name: 'Twitter', icon: 'Twitter' },
    { name: 'Instagram', icon: 'Instagram' },
    { name: 'YouTube', icon: 'Youtube' }
  ];

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Social Media Links</h2>
        <button
          type="button"
          onClick={onAddSocialLink}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus size={16} className="mr-2" />
          Add Social Link
        </button>
      </div>
      
      <div className="space-y-4">
        {socialLinks.map((link) => (
          <div key={link.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">{link.platform || 'New Social Link'}</h4>
              <button
                type="button"
                onClick={() => onRemoveSocialLink(link.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                <select
                  value={link.platform}
                  onChange={(e) => {
                    onSocialLinkChange(link.id, 'platform', e.target.value);
                    // Auto-select the matching icon when platform changes
                    const matchingPlatform = availablePlatforms.find(p => p.name === e.target.value);
                    if (matchingPlatform) {
                      onSocialLinkChange(link.id, 'iconName', matchingPlatform.icon);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a platform</option>
                  {availablePlatforms.map(platform => (
                    <option key={platform.name} value={platform.name}>{platform.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => onSocialLinkChange(link.id, 'url', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g. https://facebook.com/yourpage"
                />
              </div>
            </div>
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <select
                value={link.iconName}
                onChange={(e) => onSocialLinkChange(link.id, 'iconName', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select an icon</option>
                {availablePlatforms.map(platform => (
                  <option key={platform.icon} value={platform.icon}>{platform.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select the icon that represents this social media platform
              </p>
            </div>
          </div>
        ))}
        
        {socialLinks.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No social links added yet. Click the button above to add one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialLinksTab;
