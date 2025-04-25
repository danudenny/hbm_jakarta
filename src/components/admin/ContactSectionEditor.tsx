import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  Save,
  ArrowLeft,
  User,
  Phone,
  Share2,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import TabComponent from "./common/TabComponent";
import GeneralTab from "./contact/GeneralTab";
import ContactInfoTab from "./contact/ContactInfoTab";
import SocialLinksTab from "./contact/SocialLinksTab";
import FormSettingsTab from "./contact/FormSettingsTab";

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

type ContactSectionData = {
  title: string;
  subtitle: string;
  content: {
    description: string;
    contact_info: ContactInfo;
    social_links: SocialLink[];
    form_title: string;
  };
  is_active: boolean;
};

const ContactSectionEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<ContactSectionData>({
    title: "",
    subtitle: "",
    content: {
      description: "",
      contact_info: {
        address: "",
        phone: [""],
        email: [""],
        business_hours: [""],
      },
      social_links: [],
      form_title: "",
    },
    is_active: true,
  });

  useEffect(() => {
    fetchContactSection();
  }, []);

  const fetchContactSection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .eq("name", "contact")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No data found, create a new section
          await createDefaultSection();
          return;
        }
        throw error;
      }

      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        content: {
          description: data.content?.description || "",
          contact_info: data.content?.contact_info || {
            address: "",
            phone: [""],
            email: [""],
            business_hours: [""],
          },
          social_links: data.content?.social_links || [],
          form_title: data.content?.form_title || "",
        },
        is_active: data.is_active,
      });
    } catch (error: any) {
      toast.error(`Error loading contact section: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSection = async () => {
    try {
      const defaultSection = {
        name: "contact",
        title: "Get in Touch with Our Experts",
        subtitle: "CONTACT US",
        content: {
          description:
            "Have questions about visa requirements or need assistance with your documentation? Our team is ready to help you navigate the process smoothly.",
          contact_info: {
            address:
              "Jl. Sudirman Kav. 52-53, Jakarta Selatan, 12190, Indonesia",
            phone: ["+62 21 123 4567", "+62 812 3456 7890 (WhatsApp)"],
            email: [
              "info@HBM Jakarta-indonesia.com",
              "support@HBM Jakarta-indonesia.com",
            ],
            business_hours: [
              "Monday - Friday: 9:00 AM - 5:00 PM",
              "Saturday: 9:00 AM - 1:00 PM",
            ],
          },
          social_links: [
            {
              id: "1",
              platform: "Facebook",
              url: "#",
              iconName: "Facebook",
            },
            {
              id: "2",
              platform: "Instagram",
              url: "#",
              iconName: "Instagram",
            },
            {
              id: "3",
              platform: "Twitter",
              url: "#",
              iconName: "Twitter",
            },
            {
              id: "4",
              platform: "YouTube",
              url: "#",
              iconName: "Youtube",
            },
          ],
          form_title: "Request a Consultation",
        },
        is_active: true,
      };

      const { data, error } = await supabase
        .from("landing_sections")
        .insert(defaultSection)
        .select()
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        is_active: data.is_active,
      });

      toast.success("Created default contact section");
    } catch (error: any) {
      toast.error(`Error creating default section: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleContentChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [field]: value,
      },
    });
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        contact_info: {
          ...formData.content.contact_info,
          [field]: value,
        },
      },
    });
  };

  const handleContactArrayChange = (
    field: string,
    index: number,
    value: string
  ) => {
    const newArray = [
      ...(formData.content.contact_info[
        field as keyof ContactInfo
      ] as string[]),
    ];
    newArray[index] = value;

    setFormData({
      ...formData,
      content: {
        ...formData.content,
        contact_info: {
          ...formData.content.contact_info,
          [field]: newArray,
        },
      },
    });
  };

  const handleAddContactArrayItem = (field: string) => {
    const newArray = [
      ...(formData.content.contact_info[
        field as keyof ContactInfo
      ] as string[]),
      "",
    ];

    setFormData({
      ...formData,
      content: {
        ...formData.content,
        contact_info: {
          ...formData.content.contact_info,
          [field]: newArray,
        },
      },
    });
  };

  const handleRemoveContactArrayItem = (field: string, index: number) => {
    const newArray = [
      ...(formData.content.contact_info[
        field as keyof ContactInfo
      ] as string[]),
    ];
    newArray.splice(index, 1);

    setFormData({
      ...formData,
      content: {
        ...formData.content,
        contact_info: {
          ...formData.content.contact_info,
          [field]: newArray,
        },
      },
    });
  };

  const handleSocialLinkChange = (id: string, field: string, value: string) => {
    const updatedLinks = formData.content.social_links.map((link) =>
      link.id === id ? { ...link, [field]: value } : link
    );

    setFormData({
      ...formData,
      content: {
        ...formData.content,
        social_links: updatedLinks,
      },
    });
  };

  const handleAddSocialLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      platform: "",
      url: "",
      iconName: "",
    };

    setFormData({
      ...formData,
      content: {
        ...formData.content,
        social_links: [...formData.content.social_links, newLink],
      },
    });
  };

  const handleRemoveSocialLink = (id: string) => {
    const updatedLinks = formData.content.social_links.filter(
      (link) => link.id !== id
    );

    setFormData({
      ...formData,
      content: {
        ...formData.content,
        social_links: updatedLinks,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("landing_sections")
        .update({
          title: formData.title,
          subtitle: formData.subtitle,
          content: formData.content,
          is_active: formData.is_active,
        })
        .eq("name", "contact");

      if (error) throw error;

      toast.success("Contact section updated successfully");
    } catch (error: any) {
      toast.error(`Error saving section: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: <User size={16} /> },
    { id: "contact-info", label: "Contact Info", icon: <Phone size={16} /> },
    { id: "social-links", label: "Social Links", icon: <Share2 size={16} /> },
    {
      id: "form-settings",
      label: "Form Settings",
      icon: <MessageSquare size={16} />,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/admin" className="mr-4 p-2 rounded-full hover:bg-gray-200">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Edit Contact Section
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <TabComponent
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="px-6 pt-4"
        />

        <div className="p-6">
          {activeTab === "general" && (
            <GeneralTab
              title={formData.title}
              subtitle={formData.subtitle}
              description={formData.content.description}
              isActive={formData.is_active}
              onTitleChange={(value) =>
                setFormData({ ...formData, title: value })
              }
              onSubtitleChange={(value) =>
                setFormData({ ...formData, subtitle: value })
              }
              onDescriptionChange={(value) =>
                handleContentChange("description", value)
              }
              onActiveChange={(value) =>
                setFormData({ ...formData, is_active: value })
              }
            />
          )}

          {activeTab === "contact-info" && (
            <ContactInfoTab
              contactInfo={formData.content.contact_info}
              onAddressChange={(value) =>
                handleContactInfoChange("address", value)
              }
              onContactArrayChange={handleContactArrayChange}
              onAddContactArrayItem={handleAddContactArrayItem}
              onRemoveContactArrayItem={handleRemoveContactArrayItem}
            />
          )}

          {activeTab === "social-links" && (
            <SocialLinksTab
              socialLinks={formData.content.social_links}
              onSocialLinkChange={handleSocialLinkChange}
              onAddSocialLink={handleAddSocialLink}
              onRemoveSocialLink={handleRemoveSocialLink}
            />
          )}

          {activeTab === "form-settings" && (
            <FormSettingsTab
              formTitle={formData.content.form_title}
              onFormTitleChange={(value) =>
                handleContentChange("form_title", value)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSectionEditor;
