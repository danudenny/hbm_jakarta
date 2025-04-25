import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Palette,
  Image,
} from "lucide-react";
import { fetchSiteSettings, updateSiteSettings, uploadLogo, type SiteSettings } from "../../lib/siteSettings";

const SettingsPage = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    company_name: "",
    company_logo: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_password: "",
    smtp_from_email: "",
    smtp_from_name: "",
    primary_color: "#4F46E5",
    accent_color: "#EC4899",
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
          throw new Error("Failed to process logo");
        }
      }

      const dataToSave = {
        ...settings,
        company_logo: logoUrl,
      };

      console.log('Saving settings data:', dataToSave);
      
      const success = await updateSiteSettings(dataToSave);
      
      if (success) {
        toast.success("Settings saved successfully");
        loadSettings(); // Refresh data
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error: any) {
      toast.error(`Error saving settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Site Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <Tabs defaultValue="company">
          <TabsList className="mb-6">
            <TabsTrigger value="company">Company Info</TabsTrigger>
            <TabsTrigger value="email">Email Settings</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                  {logoPreview || settings.company_logo ? (
                    <img
                      src={logoPreview || settings.company_logo}
                      alt="Company Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Image
                      size={32}
                      className="text-gray-300"
                    />
                  )}
                </div>
                <div>
                  <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
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
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <Building size={16} className="inline mr-1" />
                Company Name
              </label>
              <input
                type="text"
                id="company_name"
                value={settings.company_name}
                onChange={(e) =>
                  handleInputChange("company_name", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="company_email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <Mail size={16} className="inline mr-1" />
                Company Email
              </label>
              <input
                type="email"
                id="company_email"
                value={settings.company_email}
                onChange={(e) =>
                  handleInputChange("company_email", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="company_phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <Phone size={16} className="inline mr-1" />
                Company Phone
              </label>
              <input
                type="text"
                id="company_phone"
                value={settings.company_phone}
                onChange={(e) =>
                  handleInputChange("company_phone", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="company_address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <MapPin size={16} className="inline mr-1" />
                Company Address
              </label>
              <textarea
                id="company_address"
                value={settings.company_address}
                onChange={(e) =>
                  handleInputChange("company_address", e.target.value)
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
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                SMTP Host
              </label>
              <input
                type="text"
                id="smtp_host"
                value={settings.smtp_host}
                onChange={(e) => handleInputChange("smtp_host", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="smtp_port"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                SMTP Port
              </label>
              <input
                type="number"
                id="smtp_port"
                value={settings.smtp_port}
                onChange={(e) =>
                  handleInputChange("smtp_port", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="smtp_user"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                SMTP Username
              </label>
              <input
                type="text"
                id="smtp_user"
                value={settings.smtp_user}
                onChange={(e) => handleInputChange("smtp_user", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="smtp_password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                SMTP Password
              </label>
              <input
                type="password"
                id="smtp_password"
                value={settings.smtp_password}
                onChange={(e) =>
                  handleInputChange("smtp_password", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="smtp_from_email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                From Email
              </label>
              <input
                type="email"
                id="smtp_from_email"
                value={settings.smtp_from_email}
                onChange={(e) =>
                  handleInputChange("smtp_from_email", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="smtp_from_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                From Name
              </label>
              <input
                type="text"
                id="smtp_from_name"
                value={settings.smtp_from_name}
                onChange={(e) =>
                  handleInputChange("smtp_from_name", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div>
              <label
                htmlFor="primary_color"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                    handleInputChange("primary_color", e.target.value)
                  }
                  className="w-12 h-10 border-0 p-0 rounded"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) =>
                    handleInputChange("primary_color", e.target.value)
                  }
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="accent_color"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                    handleInputChange("accent_color", e.target.value)
                  }
                  className="w-12 h-10 border-0 p-0 rounded"
                />
                <input
                  type="text"
                  value={settings.accent_color}
                  onChange={(e) =>
                    handleInputChange("accent_color", e.target.value)
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
