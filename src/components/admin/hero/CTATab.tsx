import React from 'react';

type CTATabProps = {
  ctaText: string;
  ctaLink: string;
  onCtaTextChange: (value: string) => void;
  onCtaLinkChange: (value: string) => void;
};

const CTATab: React.FC<CTATabProps> = ({
  ctaText,
  ctaLink,
  onCtaTextChange,
  onCtaLinkChange,
}) => {
  return (
    <div className="space-y-6 py-4">
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Call to Action Settings</h3>
        <p className="text-xs text-gray-500 mb-4">
          Configure the primary button that appears in the hero section. This is typically used to direct visitors to the most important action on your site.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CTA Button Text
          </label>
          <input
            type="text"
            value={ctaText}
            onChange={(e) => onCtaTextChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., Get Started, Contact Us"
          />
          <p className="mt-1 text-xs text-gray-500">The text displayed on the button</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CTA Button Link
          </label>
          <input
            type="text"
            value={ctaLink}
            onChange={(e) => onCtaLinkChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., /contact, #services"
          />
          <p className="mt-1 text-xs text-gray-500">Where the button should link to when clicked</p>
        </div>
      </div>

      <div className="mt-6 p-4 border border-gray-200 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div className="flex justify-center p-4 bg-gray-100 rounded-md">
          <button
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            {ctaText || 'Button Text'}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">
          Links to: {ctaLink || 'No link set'}
        </p>
      </div>
    </div>
  );
};

export default CTATab;
