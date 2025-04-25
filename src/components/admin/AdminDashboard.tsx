import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Briefcase,
  HelpCircle,
  Image,
  Clock,
  ArrowRight,
  Layers,
  Users,
  Layout,
  FileText,
  Phone,
  Mail,
  Info,
} from "lucide-react";

type SiteStats = {
  services: number;
  testimonials: number;
  faqs: number;
  companies: number;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<SiteStats>({
    services: 0,
    testimonials: 0,
    faqs: 0,
    companies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch counts from each table
        const [
          { count: servicesCount, error: servicesError },
          { count: testimonialsCount, error: testimonialsError },
          { count: faqsCount, error: faqsError },
          { count: companiesCount, error: companiesError },
          { data: settingsData, error: settingsError },
        ] = await Promise.all([
          supabase.from("services").select("*", { count: "exact", head: true }),
          supabase
            .from("testimonials")
            .select("*", { count: "exact", head: true }),
          supabase.from("faqs").select("*", { count: "exact", head: true }),
          supabase
            .from("trusted_companies")
            .select("*", { count: "exact", head: true }),
          supabase.from("admin_settings").select("*"),
        ]);

        if (servicesError) throw servicesError;
        if (testimonialsError) throw testimonialsError;
        if (faqsError) throw faqsError;
        if (companiesError) throw companiesError;
        if (settingsError) throw settingsError;

        setStats({
          services: servicesCount || 0,
          testimonials: testimonialsCount || 0,
          faqs: faqsCount || 0,
          companies: companiesCount || 0,
        });

        // Convert settings to key-value object
        const settingsObj: Record<string, string> = {};
        settingsData?.forEach((item) => {
          settingsObj[item.setting_key] = item.setting_value;
        });
        setSiteSettings(settingsObj);

        // Get last login time from local storage
        const lastLoginTime = localStorage.getItem("lastLoginTime");
        setLastLogin(lastLoginTime);

        // Update last login time
        localStorage.setItem("lastLoginTime", new Date().toISOString());
      } catch (error: any) {
        toast.error(`Error fetching dashboard data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    bgColor: string;
  }) => (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={`${bgColor} rounded-lg p-3`}>
            <Icon className={`${color}`} size={22} />
          </div>
        </div>
      </div>
      <div className={`h-1 w-full ${color.replace("text", "bg")}`}></div>
    </div>
  );

  const SectionCard = ({
    title,
    path,
    icon: Icon,
    color,
    description,
  }: {
    title: string;
    path: string;
    icon: any;
    color: string;
    description: string;
  }) => (
    <Link
      to={path}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col h-full"
    >
      <div
        className={`${color.replace(
          "text",
          "bg"
        )} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}
      >
        <Icon className="text-white" size={18} />
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-3 flex-grow">{description}</p>
      <div className="flex items-center text-sm font-medium text-indigo-600">
        Edit Section <ArrowRight size={14} className="ml-1" />
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "First login";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome to HBM Jakarta Admin
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your landing page content and website settings
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center text-sm text-gray-500">
            <Clock size={16} className="mr-1" />
            <span>Last login: {formatDate(lastLogin)}</span>
          </div>
        </div>
      </div>

      {/* Section Editors */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Layout size={18} className="mr-2" />
          Landing Page Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SectionCard
            title="Hero Section"
            path="/admin/sections/hero"
            icon={Home}
            color="text-indigo-600"
            description="Edit your main banner, headline, and call-to-action buttons"
          />
          <SectionCard
            title="Trusted By Section"
            path="/admin/sections/trusted-by"
            icon={Users}
            color="text-amber-600"
            description="Showcase companies that trust your services"
          />
          <SectionCard
            title="Services Section"
            path="/admin/sections/services"
            icon={Briefcase}
            color="text-blue-600"
            description="Manage the services you offer to your clients"
          />
          <SectionCard
            title="Process Section"
            path="/admin/sections/process"
            icon={Layers}
            color="text-green-600"
            description="Explain your service process and workflow"
          />
          <SectionCard
            title="About Section"
            path="/admin/sections/about"
            icon={Info}
            color="text-purple-600"
            description="Share your company story and mission"
          />
          <SectionCard
            title="Testimonials Section"
            path="/admin/sections/testimonials"
            icon={MessageSquare}
            color="text-rose-600"
            description="Display client reviews and testimonials"
          />
          <SectionCard
            title="FAQ Section"
            path="/admin/sections/faqs"
            icon={HelpCircle}
            color="text-cyan-600"
            description="Answer common questions about your services"
          />
          <SectionCard
            title="Contact Section"
            path="/admin/sections/contact"
            icon={Phone}
            color="text-teal-600"
            description="Update your contact information and form settings"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
