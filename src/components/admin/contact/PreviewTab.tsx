import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Youtube, Linkedin, Github } from 'lucide-react';

type SocialLink = {
  id: string;
  platform: string;
  url: string;
  iconName: string;
};

type ContactInfo = {
  address: string;
  phone: string[];
  email: string[];
  business_hours: string[];
};

type PreviewTabProps = {
  title: string;
  subtitle: string;
  description: string;
  contactInfo: ContactInfo;
  socialLinks: SocialLink[];
  formTitle: string;
  isActive: boolean;
};

const PreviewTab: React.FC<PreviewTabProps> = ({
  title,
  subtitle,
  description,
  contactInfo,
  socialLinks,
  formTitle,
  isActive,
}) => {
  // Helper function to render social media icon based on iconName
  const renderSocialIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'facebook':
        return <Facebook size={20} />;
      case 'twitter':
        return <Twitter size={20} />;
      case 'instagram':
        return <Instagram size={20} />;
      case 'youtube':
        return <Youtube size={20} />;
      case 'linkedin':
        return <Linkedin size={20} />;
      case 'github':
        return <Github size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-sm uppercase tracking-wider text-primary mb-2">{subtitle}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="max-w-2xl mx-auto text-gray-600">{description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact info */}
            <div className="space-y-6">
              <div className="space-y-4">
                {contactInfo.address && (
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mr-4">
                      <MapPin size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Our Location</h3>
                      <p className="text-gray-600">{contactInfo.address}</p>
                    </div>
                  </div>
                )}
                
                {contactInfo.phone.length > 0 && contactInfo.phone[0] && (
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mr-4">
                      <Phone size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Phone</h3>
                      {contactInfo.phone.map((phone, index) => (
                        phone && <p key={index} className="text-gray-600">{phone}</p>
                      ))}
                    </div>
                  </div>
                )}
                
                {contactInfo.email.length > 0 && contactInfo.email[0] && (
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mr-4">
                      <Mail size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Email</h3>
                      {contactInfo.email.map((email, index) => (
                        email && <p key={index} className="text-gray-600">{email}</p>
                      ))}
                    </div>
                  </div>
                )}
                
                {contactInfo.business_hours.length > 0 && contactInfo.business_hours[0] && (
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mr-4">
                      <Clock size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Business Hours</h3>
                      {contactInfo.business_hours.map((hours, index) => (
                        hours && <p key={index} className="text-gray-600">{hours}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {socialLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Follow Us</h3>
                  <div className="flex space-x-3">
                    {socialLinks.map((link) => (
                      <div key={link.id} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                        {renderSocialIcon(link.iconName)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Contact form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{formTitle}</h3>
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
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            {isActive ? 'Section is visible on the landing page' : 'Section is hidden on the landing page'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PreviewTab;
