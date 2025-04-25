import React from 'react';

type GeneralTabProps = {
  title: string;
  subtitle: string;
  description: string;
  isActive: boolean;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onActiveChange: (value: boolean) => void;
};

const GeneralTab: React.FC<GeneralTabProps> = ({
  title,
  subtitle,
  description,
  isActive,
  onTitleChange,
  onSubtitleChange,
  onDescriptionChange,
  onActiveChange,
}) => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center mb-4">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-medium text-gray-700">Section Status</span>
          <label className="inline-flex items-center cursor-pointer">
            <span className="mr-3 text-sm text-gray-500">
              {isActive ? 'Active' : 'Inactive'}
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => onActiveChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <p className="mt-1 text-xs text-gray-500">The main heading displayed in the contact section</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Subtitle
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <p className="mt-1 text-xs text-gray-500">Optional smaller text displayed above the title (usually in uppercase)</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter a description for your contact section..."
        />
        <p className="mt-1 text-xs text-gray-500">The main paragraph text that appears below the title</p>
      </div>
    </div>
  );
};

export default GeneralTab;
