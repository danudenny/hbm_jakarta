import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { Save, Globe, Image, Twitter, Facebook } from "lucide-react";

interface SEOSettings {
  id?: string;
  page_path: string;
  title: string;
  description?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  robots?: string;
  structured_data?: any;
}

const SEOEditor = () => {
  const [pages, setPages] = useState<{ path: string; name: string }[]>([
    { path: "/", name: "Homepage" },
    { path: "/services", name: "Services" },
    { path: "/about", name: "About Us" },
    { path: "/contact", name: "Contact" },
  ]);
  
  const [selectedPage, setSelectedPage] = useState<string>("/");
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    page_path: "/",
    title: "",
    description: "",
    keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    twitter_card: "summary_large_image",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
    canonical_url: "",
    robots: "index, follow",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSEOSettings(selectedPage);
  }, [selectedPage]);

  const fetchSEOSettings = async (pagePath: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .eq("page_path", pagePath)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setSeoSettings(data);
      } else {
        // Reset to defaults if no data found
        setSeoSettings({
          page_path: pagePath,
          title: getDefaultTitle(pagePath),
          description: "",
          keywords: "",
          og_title: "",
          og_description: "",
          og_image: "",
          twitter_card: "summary_large_image",
          twitter_title: "",
          twitter_description: "",
          twitter_image: "",
          canonical_url: "",
          robots: "index, follow",
        });
      }
    } catch (error: any) {
      toast.error(`Error fetching SEO settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTitle = (pagePath: string) => {
    const page = pages.find(p => p.path === pagePath);
    return page ? `HBM Jakarta | ${page.name}` : "HBM Jakarta";
  };

  const handleInputChange = (
    field: keyof SEOSettings,
    value: string | object
  ) => {
    setSeoSettings({
      ...seoSettings,
      [field]: value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, ...dataToSave } = seoSettings;

      if (id) {
        // Update existing record
        const { error } = await supabase
          .from("seo_settings")
          .update(dataToSave)
          .eq("id", id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("seo_settings")
          .insert([dataToSave]);

        if (error) throw error;
      }

      toast.success("SEO settings saved successfully");
    } catch (error: any) {
      toast.error(`Error saving SEO settings: ${error.message}`);
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
        <h1 className="text-2xl font-bold text-gray-800">SEO Settings</h1>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Page
          </label>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {pages.map((page) => (
              <option key={page.path} value={page.path}>
                {page.name}
              </option>
            ))}
          </select>
        </div>

        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic" className="flex items-center">
              <Globe size={16} className="mr-2" />
              Basic SEO
            </TabsTrigger>
            <TabsTrigger value="opengraph" className="flex items-center">
              <Facebook size={16} className="mr-2" />
              Open Graph
            </TabsTrigger>
            <TabsTrigger value="twitter" className="flex items-center">
              <Twitter size={16} className="mr-2" />
              Twitter Card
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center">
              <Image size={16} className="mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Title
              </label>
              <input
                type="text"
                value={seoSettings.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Page Title"
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended length: 50-60 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                value={seoSettings.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Brief description of the page content"
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended length: 150-160 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <input
                type="text"
                value={seoSettings.keywords || ""}
                onChange={(e) => handleInputChange("keywords", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="mt-1 text-xs text-gray-500">
                Comma-separated list of keywords
              </p>
            </div>
          </TabsContent>

          <TabsContent value="opengraph" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OG Title
              </label>
              <input
                type="text"
                value={seoSettings.og_title || ""}
                onChange={(e) => handleInputChange("og_title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Title for social sharing"
              />
              <p className="mt-1 text-xs text-gray-500">
                If left empty, the page title will be used
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OG Description
              </label>
              <textarea
                value={seoSettings.og_description || ""}
                onChange={(e) => handleInputChange("og_description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Description for social sharing"
              />
              <p className="mt-1 text-xs text-gray-500">
                If left empty, the meta description will be used
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OG Image URL
              </label>
              <input
                type="text"
                value={seoSettings.og_image || ""}
                onChange={(e) => handleInputChange("og_image", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended size: 1200 x 630 pixels
              </p>
            </div>
          </TabsContent>

          <TabsContent value="twitter" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter Card Type
              </label>
              <select
                value={seoSettings.twitter_card || "summary_large_image"}
                onChange={(e) => handleInputChange("twitter_card", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary with Large Image</option>
                <option value="app">App</option>
                <option value="player">Player</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter Title
              </label>
              <input
                type="text"
                value={seoSettings.twitter_title || ""}
                onChange={(e) => handleInputChange("twitter_title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Title for Twitter"
              />
              <p className="mt-1 text-xs text-gray-500">
                If left empty, the OG title or page title will be used
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter Description
              </label>
              <textarea
                value={seoSettings.twitter_description || ""}
                onChange={(e) => handleInputChange("twitter_description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Description for Twitter"
              />
              <p className="mt-1 text-xs text-gray-500">
                If left empty, the OG description or meta description will be used
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter Image URL
              </label>
              <input
                type="text"
                value={seoSettings.twitter_image || ""}
                onChange={(e) => handleInputChange("twitter_image", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                If left empty, the OG image will be used
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canonical URL
              </label>
              <input
                type="text"
                value={seoSettings.canonical_url || ""}
                onChange={(e) => handleInputChange("canonical_url", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/page"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to use the current page URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Robots
              </label>
              <input
                type="text"
                value={seoSettings.robots || ""}
                onChange={(e) => handleInputChange("robots", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="index, follow"
              />
              <p className="mt-1 text-xs text-gray-500">
                Controls how search engines crawl and index the page
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">SEO Preview</h2>
        
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Google Search Result Preview</h3>
          <div className="bg-white p-4 rounded border border-gray-200">
            <div className="text-xl text-blue-600 font-medium truncate">
              {seoSettings.title || "Page Title"}
            </div>
            <div className="text-sm text-green-700 truncate">
              {window.location.origin}{seoSettings.page_path}
            </div>
            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
              {seoSettings.description || "This is where the meta description will appear in search results. Make sure it's compelling and includes relevant keywords."}
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Social Media Preview</h3>
          <div className="bg-gray-100 p-4 rounded border border-gray-200">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              {(seoSettings.og_image || seoSettings.twitter_image) && (
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  <Image size={40} className="text-gray-400" />
                </div>
              )}
              <div className="p-4">
                <div className="text-sm text-gray-500 mb-1">hbmjakarta.com</div>
                <div className="font-bold">
                  {seoSettings.og_title || seoSettings.twitter_title || seoSettings.title || "Page Title"}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {seoSettings.og_description || seoSettings.twitter_description || seoSettings.description || "Social media description preview"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOEditor;
