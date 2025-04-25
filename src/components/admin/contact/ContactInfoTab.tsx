import React from 'react';
import { Plus, Trash, MapPin, Phone, Mail, Clock } from 'lucide-react';

type ContactInfo = {
  address: string;
  phone: string[];
  email: string[];
  business_hours: string[];
};

type ContactInfoTabProps = {
  contactInfo: ContactInfo;
  onAddressChange: (value: string) => void;
  onContactArrayChange: (field: string, index: number, value: string) => void;
  onAddContactArrayItem: (field: string) => void;
  onRemoveContactArrayItem: (field: string, index: number) => void;
};

const ContactInfoTab: React.FC<ContactInfoTabProps> = ({
  contactInfo,
  onAddressChange,
  onContactArrayChange,
  onAddContactArrayItem,
  onRemoveContactArrayItem,
}) => {
  return (
    <div className="space-y-6 py-4">
      <div>
        <div className="flex items-center mb-1">
          <MapPin size={16} className="text-gray-500 mr-2" />
          <label className="block text-sm font-medium text-gray-700">Office Address</label>
        </div>
        <textarea
          value={contactInfo.address}
          onChange={(e) => onAddressChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={2}
          placeholder="Enter your office address"
        />
        <p className="mt-1 text-xs text-gray-500">Your physical office location</p>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Phone size={16} className="text-gray-500 mr-2" />
            <label className="block text-sm font-medium text-gray-700">Phone Numbers</label>
          </div>
          <button
            type="button"
            onClick={() => onAddContactArrayItem('phone')}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-primary hover:bg-primary-dark"
          >
            <Plus size={14} className="mr-1" />
            Add Phone
          </button>
        </div>
        
        {contactInfo.phone.map((phone, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={phone}
              onChange={(e) => onContactArrayChange('phone', index, e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              placeholder="e.g. +62 21 123 4567"
            />
            {contactInfo.phone.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveContactArrayItem('phone', index)}
                className="ml-2 p-2 text-red-500 hover:text-red-700"
              >
                <Trash size={16} />
              </button>
            )}
          </div>
        ))}
        <p className="mt-1 text-xs text-gray-500">Contact phone numbers (you can add multiple)</p>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Mail size={16} className="text-gray-500 mr-2" />
            <label className="block text-sm font-medium text-gray-700">Email Addresses</label>
          </div>
          <button
            type="button"
            onClick={() => onAddContactArrayItem('email')}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-primary hover:bg-primary-dark"
          >
            <Plus size={14} className="mr-1" />
            Add Email
          </button>
        </div>
        
        {contactInfo.email.map((email, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={email}
              onChange={(e) => onContactArrayChange('email', index, e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              placeholder="e.g. info@example.com"
            />
            {contactInfo.email.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveContactArrayItem('email', index)}
                className="ml-2 p-2 text-red-500 hover:text-red-700"
              >
                <Trash size={16} />
              </button>
            )}
          </div>
        ))}
        <p className="mt-1 text-xs text-gray-500">Contact email addresses (you can add multiple)</p>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Clock size={16} className="text-gray-500 mr-2" />
            <label className="block text-sm font-medium text-gray-700">Business Hours</label>
          </div>
          <button
            type="button"
            onClick={() => onAddContactArrayItem('business_hours')}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-primary hover:bg-primary-dark"
          >
            <Plus size={14} className="mr-1" />
            Add Hours
          </button>
        </div>
        
        {contactInfo.business_hours.map((hours, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={hours}
              onChange={(e) => onContactArrayChange('business_hours', index, e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              placeholder="e.g. Monday - Friday: 9:00 AM - 5:00 PM"
            />
            {contactInfo.business_hours.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveContactArrayItem('business_hours', index)}
                className="ml-2 p-2 text-red-500 hover:text-red-700"
              >
                <Trash size={16} />
              </button>
            )}
          </div>
        ))}
        <p className="mt-1 text-xs text-gray-500">Your business operating hours (you can add multiple)</p>
      </div>
    </div>
  );
};

export default ContactInfoTab;
