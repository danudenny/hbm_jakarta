import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import {
  Facebook,
  Instagram,
  MessageCircle,
  Phone,
  Save,
  Trash,
  Plus,
  ExternalLink,
} from "lucide-react";

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  icon: string;
  color: string;
}

const FloatingSocialEditor = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("floating_social_links")
        .select("*")
        .order("id");

      if (error) throw error;

      if (data && data.length > 0) {
        setSocialLinks(data);
      } else {
        // Set default social links if none exist
        setSocialLinks([
          {
            platform: "Facebook",
            url: "https://facebook.com",
            icon: "Facebook",
            color: "#1877F2",
          },
          {
            platform: "Instagram",
            url: "https://instagram.com",
            icon: "Instagram",
            color: "#E4405F",
          },
          {
            platform: "WhatsApp",
            url: "https://wa.me/6281234567890",
            icon: "MessageCircle",
            color: "#25D366",
          },
          {
            platform: "Phone",
            url: "tel:+6281234567890",
            icon: "Phone",
            color: "#4F46E5",
          },
        ]);
      }
    } catch (error: any) {
      toast.error(`Error fetching social links: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    index: number,
    field: keyof SocialLink,
    value: string
  ) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value,
    };
    setSocialLinks(updatedLinks);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // First delete all existing links
      const { error: deleteError } = await supabase
        .from("floating_social_links")
        .delete()
        .not("id", "is", null);

      if (deleteError) throw deleteError;

      // Then insert the new links
      const { error: insertError } = await supabase
        .from("floating_social_links")
        .insert(socialLinks);

      if (insertError) throw insertError;

      toast.success("Social links saved successfully");
    } catch (error: any) {
      toast.error(`Error saving social links: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const addNewLink = () => {
    setSocialLinks([
      ...socialLinks,
      {
        platform: "",
        url: "",
        icon: "Link",
        color: "#64748b",
      },
    ]);
  };

  const removeLink = (index: number) => {
    const updatedLinks = [...socialLinks];
    updatedLinks.splice(index, 1);
    setSocialLinks(updatedLinks);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Facebook":
        return <Facebook size={20} />;
      case "Instagram":
        return <Instagram size={20} />;
      case "MessageCircle":
        return <MessageCircle size={20} />;
      case "Phone":
        return <Phone size={20} />;
      default:
        return <ExternalLink size={20} />;
    }
  };

  const platformOptions = [
    { label: "Facebook", value: "Facebook", icon: "Facebook", color: "#1877F2" },
    {
      label: "Instagram",
      value: "Instagram",
      icon: "Instagram",
      color: "#E4405F",
    },
    {
      label: "WhatsApp",
      value: "MessageCircle",
      icon: "MessageCircle",
      color: "#25D366",
    },
    { label: "Phone", value: "Phone", icon: "Phone", color: "#4F46E5" },
    { label: "Other", value: "ExternalLink", icon: "ExternalLink", color: "#64748b" },
  ];

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
        <h1 className="text-2xl font-bold text-gray-800">
          Floating Social Links
        </h1>
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
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Edit Floating Social Links
          </h2>
          <p className="text-gray-500 text-sm">
            These links appear on the left side of your website. You can add up
            to 5 social media links.
          </p>
        </div>

        <div className="space-y-6">
          {socialLinks.map((link, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-5 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-700">Social Link #{index + 1}</h3>
                <button
                  onClick={() => removeLink(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  disabled={socialLinks.length <= 1}
                >
                  <Trash size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={
                      platformOptions.find(
                        (option) => option.icon === link.icon
                      )?.value || ""
                    }
                    onChange={(e) => {
                      const selected = platformOptions.find(
                        (option) => option.value === e.target.value
                      );
                      if (selected) {
                        handleInputChange(index, "platform", selected.label);
                        handleInputChange(index, "icon", selected.icon);
                        handleInputChange(index, "color", selected.color);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="" disabled>
                      Select Platform
                    </option>
                    {platformOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) =>
                      handleInputChange(index, "url", e.target.value)
                    }
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview
                </label>
                <div className="flex items-center p-3 bg-white rounded-md border border-gray-200">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: link.color + "20" }}
                  >
                    <span style={{ color: link.color }}>
                      {getIconComponent(link.icon)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {link.platform || "Platform"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {link.url || "https://example.com"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {socialLinks.length < 5 && (
            <button
              onClick={addNewLink}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center"
            >
              <Plus size={18} className="mr-2" />
              Add Another Social Link
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Preview</h2>
        <div className="relative h-96 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-r-lg border border-white/20 space-y-4">
              {socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="block transition-colors"
                  style={{ color: link.color }}
                >
                  {getIconComponent(link.icon)}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-30 text-lg font-medium">
            Website Background
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingSocialEditor;
