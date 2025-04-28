import { Clock, Mail, MapPin, Phone, Plus, Trash } from 'lucide-react';
import React from 'react';

type ContactInfo = {
    address: string[];
    phone: string[];
    email: string[];
    business_hours: string[];
};

type ContactInfoTabProps = {
    contactInfo: ContactInfo;
    onContactArrayChange: (field: string, index: number, value: string) => void;
    onAddContactArrayItem: (field: string) => void;
    onRemoveContactArrayItem: (field: string, index: number) => void;
};

const ContactInfoTab: React.FC<ContactInfoTabProps> = ({
    contactInfo,
    onContactArrayChange,
    onAddContactArrayItem,
    onRemoveContactArrayItem,
}) => {
    return (
        <div className="space-y-8 py-4">
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <MapPin size={20} className="text-primary mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                            Office Locations
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => onAddContactArrayItem('address')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                    >
                        <Plus size={16} className="mr-1" />
                        Add Location
                    </button>
                </div>

                <div className="space-y-3">
                    {contactInfo.address.map((address, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg relative group"
                        >
                            <textarea
                                value={address}
                                onChange={(e) =>
                                    onContactArrayChange(
                                        'address',
                                        index,
                                        e.target.value
                                    )
                                }
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                rows={3}
                                placeholder="Enter office address (use multiple lines for better formatting)"
                            />

                            {contactInfo.address.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveContactArrayItem(
                                            'address',
                                            index
                                        )
                                    }
                                    className="absolute top-2 right-2 p-2 bg-white rounded-full text-red-500 hover:text-red-700 shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove this address"
                                >
                                    <Trash size={14} />
                                </button>
                            )}

                            <div className="mt-2 text-xs text-gray-500 flex items-center">
                                <span className="mr-1">💡</span>
                                <span>
                                    Separate address lines with Enter for better
                                    display on the website
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <Phone size={20} className="text-primary mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                            Phone Numbers
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => onAddContactArrayItem('phone')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                    >
                        <Plus size={16} className="mr-1" />
                        Add Phone
                    </button>
                </div>

                <div className="space-y-3">
                    {contactInfo.phone.map((phone, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg relative group"
                        >
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) =>
                                    onContactArrayChange(
                                        'phone',
                                        index,
                                        e.target.value
                                    )
                                }
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                placeholder="e.g. +62 21 123 4567 or WhatsApp: +62 812 3456 7890"
                            />

                            {contactInfo.phone.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveContactArrayItem('phone', index)
                                    }
                                    className="absolute top-2 right-2 p-2 bg-white rounded-full text-red-500 hover:text-red-700 shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove this phone"
                                >
                                    <Trash size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <Mail size={20} className="text-primary mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                            Email Addresses
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => onAddContactArrayItem('email')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                    >
                        <Plus size={16} className="mr-1" />
                        Add Email
                    </button>
                </div>

                <div className="space-y-3">
                    {contactInfo.email.map((email, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg relative group"
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    onContactArrayChange(
                                        'email',
                                        index,
                                        e.target.value
                                    )
                                }
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                placeholder="e.g. info@example.com"
                            />

                            {contactInfo.email.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveContactArrayItem('email', index)
                                    }
                                    className="absolute top-2 right-2 p-2 bg-white rounded-full text-red-500 hover:text-red-700 shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove this email"
                                >
                                    <Trash size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <Clock size={20} className="text-primary mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                            Business Hours
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => onAddContactArrayItem('business_hours')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                    >
                        <Plus size={16} className="mr-1" />
                        Add Hours
                    </button>
                </div>

                <div className="space-y-3">
                    {contactInfo.business_hours.map((hours, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg relative group"
                        >
                            <input
                                type="text"
                                value={hours}
                                onChange={(e) =>
                                    onContactArrayChange(
                                        'business_hours',
                                        index,
                                        e.target.value
                                    )
                                }
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                placeholder="e.g. Monday - Friday: 9:00 AM - 5:00 PM"
                            />

                            {contactInfo.business_hours.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveContactArrayItem(
                                            'business_hours',
                                            index
                                        )
                                    }
                                    className="absolute top-2 right-2 p-2 bg-white rounded-full text-red-500 hover:text-red-700 shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove these hours"
                                >
                                    <Trash size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContactInfoTab;
