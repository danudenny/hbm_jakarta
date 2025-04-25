import React from 'react';

type FormSettingsTabProps = {
  formTitle: string;
  onFormTitleChange: (value: string) => void;
};

const FormSettingsTab: React.FC<FormSettingsTabProps> = ({
  formTitle,
  onFormTitleChange,
}) => {
  return (
    <div className="space-y-6 py-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Form Title</label>
        <input
          type="text"
          value={formTitle}
          onChange={(e) => onFormTitleChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="e.g. Request a Consultation"
        />
        <p className="mt-1 text-xs text-gray-500">This will be displayed above the contact form</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Form Preview</h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">{formTitle || 'Contact Form'}</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  disabled
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  disabled
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                disabled
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                placeholder="Email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                disabled
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                placeholder="Phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                disabled
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                rows={3}
                placeholder="Your message"
              ></textarea>
            </div>
            <button
              type="button"
              disabled
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary opacity-75"
            >
              Submit
            </button>
            <p className="text-xs text-center text-gray-500">This is a preview. The form will be functional on the live site.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSettingsTab;
