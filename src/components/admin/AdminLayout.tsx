import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  LogOut,
  Home,
  ChevronDown,
  ChevronUp,
  User,
  Layout,
  Globe,
  Settings,
  Languages,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<{
    [key: string]: boolean;
  }>({
    landingPage: false,
  });

  useEffect(() => {
    checkUser();

    // Auto-expand the menu if a child route is active
    const currentPath = location.pathname;
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) =>
            currentPath === child.path ||
            currentPath.startsWith(`${child.path}/`)
        );
        if (isChildActive) {
          setExpandedMenus((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [location.pathname]);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    } else {
      setUserEmail(session.user.email || null);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const navItems = [
    { id: "dashboard", path: "/admin", label: "Dashboard", icon: Home },
    {
      id: "landingPage",
      path: "#",
      label: "Landing Page",
      icon: Layout,
      children: [
        { path: "/admin/sections/hero", label: "Hero Section" },
        { path: "/admin/sections/trusted-by", label: "Trusted By" },
        { path: "/admin/sections/services", label: "Services Section" },
        { path: "/admin/sections/process", label: "Process Section" },
        { path: "/admin/sections/about", label: "About Section" },
        { path: "/admin/sections/testimonials", label: "Testimonials Section" },
        { path: "/admin/sections/faqs", label: "FAQ Section" },
        { path: "/admin/sections/contact", label: "Contact Section" },
        { path: "/admin/sections/floating-social", label: "Floating Social" },
      ],
    },
    { id: "seo", path: "/admin/seo", label: "SEO Settings", icon: Globe },
    { id: "translations", path: "/admin/translations", label: "Translations", icon: Languages },
    { id: "settings", path: "/admin/settings", label: "Site Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-primary font-bold text-xl">
                  HBM<span className="text-accent">Jakarta</span>
                </Link>
                <span className="ml-2 text-sm text-gray-500 hidden md:inline">
                  Admin Panel
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700">
                  {userEmail || "Admin"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <ChevronUp className="block h-6 w-6" />
                ) : (
                  <ChevronDown className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
          <div className="pt-2 pb-3 space-y-1">
            <div className="flex items-center justify-between px-4 py-2 border-t">
              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700">
                  {userEmail || "Admin"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  if (item.children) {
                    const isExpanded = expandedMenus[item.id] || false;
                    const isAnyChildActive = item.children.some((child) =>
                      isActive(child.path)
                    );
                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          onClick={() => toggleMenu(item.id)}
                          className={`w-full group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${
                            isAnyChildActive
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon
                              className={`mr-3 flex-shrink-0 h-5 w-5 ${
                                isAnyChildActive
                                  ? "text-indigo-500"
                                  : "text-gray-400 group-hover:text-gray-500"
                              }`}
                            />
                            {item.label}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        {isExpanded && (
                          <ul className="pl-8 space-y-1">
                            {item.children.map((child) => (
                              <li key={child.path}>
                                <Link
                                  to={child.path}
                                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                    isActive(child.path)
                                      ? "bg-indigo-50 text-indigo-600"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive(item.path)
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Icon
                          className={`mr-3 flex-shrink-0 h-5 w-5 ${
                            isActive(item.path)
                              ? "text-indigo-500"
                              : "text-gray-400 group-hover:text-gray-500"
                          }`}
                        />
                        {item.label}
                      </Link>
                    );
                  }
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <Link to="/" className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <Home className="inline-block h-9 w-9 rounded-full text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      Back to Website
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        <div
          className={`md:hidden fixed inset-0 flex z-40 ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
        >
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 px-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  if (item.children) {
                    const isExpanded = expandedMenus[item.id] || false;
                    const isAnyChildActive = item.children.some((child) =>
                      isActive(child.path)
                    );
                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          onClick={() => toggleMenu(item.id)}
                          className={`w-full group flex items-center justify-between px-2 py-2 text-base font-medium rounded-md ${
                            isAnyChildActive
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon
                              className={`mr-4 flex-shrink-0 h-6 w-6 ${
                                isAnyChildActive
                                  ? "text-indigo-500"
                                  : "text-gray-400 group-hover:text-gray-500"
                              }`}
                            />
                            {item.label}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        {isExpanded && (
                          <ul className="pl-10 space-y-1">
                            {item.children.map((child) => (
                              <li key={child.path}>
                                <Link
                                  to={child.path}
                                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                    isActive(child.path)
                                      ? "bg-indigo-50 text-indigo-600"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive(item.path)
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon
                          className={`mr-4 flex-shrink-0 h-6 w-6 ${
                            isActive(item.path)
                              ? "text-indigo-500"
                              : "text-gray-400 group-hover:text-gray-500"
                          }`}
                        />
                        {item.label}
                      </Link>
                    );
                  }
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <Link
                to="/"
                className="flex-shrink-0 group block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <div>
                    <Home className="inline-block h-10 w-10 rounded-full text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                      Back to Website
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
