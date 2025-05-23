import {
    Building,
    Image,
    Mail,
    MapPin,
    Palette,
    Phone,
    Save,
    Upload,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    fetchSiteSettings,
    updateSiteSettings,
    uploadLogo,
    type SiteSettings,
} from '../../lib/siteSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const SettingsPage = () => {
    const [settings, setSettings] = useState<SiteSettings>({
        company_name: '',
        company_logo: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_password: '',
        smtp_from_email: '',
        smtp_from_name: '',
        primary_color: '#4F46E5',
        accent_color: '#EC4899',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await fetchSiteSettings();
            if (data) {
                setSettings(data);
            }
        } catch (error: any) {
            toast.error(`Error fetching settings: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        field: keyof SiteSettings,
        value: string | number
    ) => {
        setSettings({
            ...settings,
            [field]: value,
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Upload logo if changed
            let logoUrl = settings.company_logo;
            if (logoFile) {
                const uploadedLogoUrl = await uploadLogo(logoFile);
                if (uploadedLogoUrl) {
                    logoUrl = uploadedLogoUrl;
                } else {
                    throw new Error('Failed to process logo');
                }
            }

            const dataToSave = {
                ...settings,
                company_logo: logoUrl,
            };

            const success = await updateSiteSettings(dataToSave);

            if (success) {
                toast.success('Settings saved successfully');
                loadSettings(); // Refresh data
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error: any) {
            toast.error(`Error saving settings: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    Site Settings
                </h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 mr-2 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} className="mr-2" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                <Tabs defaultValue="company">
                    <TabsList className="mb-6">
                        <TabsTrigger value="company">Company Info</TabsTrigger>
                        <TabsTrigger value="email">Email Settings</TabsTrigger>
                        <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="company" className="space-y-6">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Company Logo
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-24 h-24 overflow-hidden border border-gray-200 rounded-md">
                                    {logoPreview || settings.company_logo ? (
                                        <img
                                            src={
                                                logoPreview ||
                                                settings.company_logo
                                            }
                                            alt="Company Logo"
                                            className="object-contain w-full h-full"
                                        />
                                    ) : (
                                        <Image
                                            size={32}
                                            className="text-gray-300"
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50">
                                        <Upload size={18} className="mr-2" />
                                        Upload Logo
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                        />
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Recommended size: 200x200px. Max 2MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="company_name"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                <Building size={16} className="inline mr-1" />
                                Company Name
                            </label>
                            <input
                                type="text"
                                id="company_name"
                                value={settings.company_name}
                                onChange={(e) =>
                                    handleInputChange(
                                        'company_name',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="company_email"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                <Mail size={16} className="inline mr-1" />
                                Company Email
                            </label>
                            <input
                                type="email"
                                id="company_email"
                                value={settings.company_email}
                                onChange={(e) =>
                                    handleInputChange(
                                        'company_email',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="company_phone"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                <Phone size={16} className="inline mr-1" />
                                Company Phone
                            </label>
                            <input
                                type="text"
                                id="company_phone"
                                value={settings.company_phone}
                                onChange={(e) =>
                                    handleInputChange(
                                        'company_phone',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="company_address"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                <MapPin size={16} className="inline mr-1" />
                                Company Address
                            </label>
                            <textarea
                                id="company_address"
                                value={settings.company_address}
                                onChange={(e) =>
                                    handleInputChange(
                                        'company_address',
                                        e.target.value
                                    )
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="email" className="space-y-6">
                        <div>
                            <label
                                htmlFor="smtp_host"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                SMTP Host
                            </label>
                            <input
                                type="text"
                                id="smtp_host"
                                value={settings.smtp_host}
                                onChange={(e) =>
                                    handleInputChange(
                                        'smtp_host',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="smtp_port"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                SMTP Port
                            </label>
                            <input
                                type="number"
                                id="smtp_port"
                                value={settings.smtp_port}
                                onChange={(e) =>
                                    handleInputChange(
                                        'smtp_port',
                                        parseInt(e.target.value)
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="smtp_user"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                SMTP Username
                            </label>
                            <input
                                type="text"
                                id="smtp_user"
                                value={settings.smtp_user}
                                onChange={(e) =>
                                    handleInputChange(
                                        'smtp_user',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="smtp_password"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                SMTP Password
                            </label>
                            <input
                                type="password"
                                id="smtp_password"
                                value={settings.smtp_password}
                                onChange={(e) =>
                                    handleInputChange(
                                        'smtp_password',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="smtp_from_email"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                From Email
                            </label>
                            <input
                                type="email"
                                id="smtp_from_email"
                                value={settings.smtp_from_email}
                                onChange={(e) =>
                                    handleInputChange(
                                        'smtp_from_email',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="smtp_from_name"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                From Name
                            </label>
                            <input
                                type="text"
                                id="smtp_from_name"
                                value={settings.smtp_from_name}
                                onChange={(e) =>
                                    handleInputChange(
                                        'smtp_from_name',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-6">
                        <div>
                            <label
                                htmlFor="primary_color"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                <Palette size={16} className="inline mr-1" />
                                Primary Color
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    id="primary_color"
                                    value={settings.primary_color}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'primary_color',
                                            e.target.value
                                        )
                                    }
                                    className="w-12 h-10 p-0 border-0 rounded"
                                />
                                <input
                                    type="text"
                                    value={settings.primary_color}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'primary_color',
                                            e.target.value
                                        )
                                    }
                                    className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="accent_color"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                <Palette size={16} className="inline mr-1" />
                                Accent Color
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    id="accent_color"
                                    value={settings.accent_color}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'accent_color',
                                            e.target.value
                                        )
                                    }
                                    className="w-12 h-10 p-0 border-0 rounded"
                                />
                                <input
                                    type="text"
                                    value={settings.accent_color}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'accent_color',
                                            e.target.value
                                        )
                                    }
                                    className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default SettingsPage;
