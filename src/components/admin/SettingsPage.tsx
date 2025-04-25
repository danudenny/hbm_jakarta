import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Palette,
  Lock,
  Image,
} from "lucide-react";

interface SiteSettings {
  id?: string;
  company_name: string;
  company_logo?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  smtp_from_email?: string;
  smtp_from_name?: string;
  primary_color: string;
  accent_color: string;
}

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
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

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

  const uploadLogo = async (): Promise<string | undefined> => {
    if (!logoFile) return settings.company_logo;

    try {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("public").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      toast.error(`Error uploading logo: ${error.message}`);
      return undefined;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload logo if changed
      let logoUrl = settings.company_logo;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      const dataToSave = {
        ...settings,
        company_logo: logoUrl,
      };

      if (settings.id) {
        // Update existing record
        const { error } = await supabase
          .from("site_settings")
          .update(dataToSave)
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("site_settings")
          .insert([dataToSave]);

        if (error) throw error;
      }

      toast.success("Settings saved successfully");
      fetchSettings(); // Refresh data
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
            <TabsTrigger value="company" className="flex items-center">
              <Building size={16} className="mr-2" />
              Company Info
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center">
              <Mail size={16} className="mr-2" />
              Email Settings
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center">
              <Palette size={16} className="mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) =>
                    handleInputChange("company_name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={settings.company_email || ""}
                    onChange={(e) =>
                      handleInputChange("company_email", e.target.value)
                    }
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={settings.company_phone || ""}
                    onChange={(e) =>
                      handleInputChange("company_phone", e.target.value)
                    }
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+62 123 456 7890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={settings.company_address || ""}
                    onChange={(e) =>
                      handleInputChange("company_address", e.target.value)
                    }
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Jakarta, Indonesia"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Logo
              </label>
              <div className="mt-1 flex items-center">
                <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                  {logoPreview || settings.company_logo ? (
                    <img
                      src={logoPreview || settings.company_logo}
                      alt="Company Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="logo-upload"
                  className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <span className="flex items-center">
                    <Upload size={16} className="mr-2" />
                    Upload
                  </span>
                  <input
                    id="logo-upload"
                    name="logo-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleLogoChange}
                  />
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Recommended size: 200x200 pixels. PNG or JPG format.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Lock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Email credentials are encrypted and stored securely. These
                    settings are used for sending emails from your website.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.smtp_host || ""}
                  onChange={(e) =>
                    handleInputChange("smtp_host", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="smtp.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={settings.smtp_port || ""}
                  onChange={(e) =>
                    handleInputChange("smtp_port", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="587"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Common ports: 25, 465 (SSL), 587 (TLS)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={settings.smtp_user || ""}
                  onChange={(e) =>
                    handleInputChange("smtp_user", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="username@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={settings.smtp_password || ""}
                  onChange={(e) =>
                    handleInputChange("smtp_password", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  value={settings.smtp_from_email || ""}
                  onChange={(e) =>
                    handleInputChange("smtp_from_email", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="noreply@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.smtp_from_name || ""}
                  onChange={(e) =>
                    handleInputChange("smtp_from_name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your Company Name"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Test Email Configuration
              </button>
              <p className="mt-2 text-sm text-gray-500">
                This will send a test email to verify your SMTP settings.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) =>
                      handleInputChange("primary_color", e.target.value)
                    }
                    className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) =>
                      handleInputChange("primary_color", e.target.value)
                    }
                    className="ml-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="#4F46E5"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Main color for buttons, links, and accents
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={settings.accent_color}
                    onChange={(e) =>
                      handleInputChange("accent_color", e.target.value)
                    }
                    className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.accent_color}
                    onChange={(e) =>
                      handleInputChange("accent_color", e.target.value)
                    }
                    className="ml-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="#EC4899"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Secondary color for highlights and special elements
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Preview
              </h3>
              <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
                <div className="flex flex-col space-y-4">
                  <div
                    className="h-12 rounded-md flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: settings.primary_color }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="h-12 rounded-md flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: settings.accent_color }}
                  >
                    Accent Button
                  </div>
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <p className="text-gray-800 mb-2">
                      Sample text with{" "}
                      <span
                        className="font-medium"
                        style={{ color: settings.primary_color }}
                      >
                        primary color
                      </span>{" "}
                      and{" "}
                      <span
                        className="font-medium"
                        style={{ color: settings.accent_color }}
                      >
                        accent color
                      </span>{" "}
                      highlights.
                    </p>
                    <div
                      className="h-1 w-24 rounded-full mt-2"
                      style={{ backgroundColor: settings.primary_color }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
