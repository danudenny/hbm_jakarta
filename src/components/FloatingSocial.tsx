import {
    Facebook,
    Instagram,
    Link,
    MessageCircle,
    Phone,
    Share2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface SocialLink {
    id: string;
    platform: string;
    url: string;
    icon: string;
    color: string;
}

// Default social links as a fallback if database fetch fails
const DEFAULT_SOCIAL_LINKS: Omit<SocialLink, 'id'>[] = [
    {
        platform: 'Facebook',
        url: 'https://facebook.com',
        icon: 'Facebook',
        color: '#1877F2',
    },
    {
        platform: 'Instagram',
        url: 'https://instagram.com',
        icon: 'Instagram',
        color: '#E4405F',
    },
    {
        platform: 'WhatsApp',
        url: 'https://wa.me/6281234567890',
        icon: 'MessageCircle',
        color: '#25D366',
    },
    {
        platform: 'Phone',
        url: 'tel:+6281234567890',
        icon: 'Phone',
        color: '#4F46E5',
    },
];

const FloatingSocial = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.dir() === 'rtl';
    const [isMobile, setIsMobile] = useState(false);

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        // Initial check
        checkMobile();
        
        // Add event listener for window resize
        window.addEventListener('resize', checkMobile);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchSocialLinks = async () => {
            try {
                const { data, error } = await supabase
                    .from('floating_social_links')
                    .select('*')
                    .order('id');

                if (error) {
                    console.error('Error fetching social links:', error);
                    // Use default links if there's an error
                    setSocialLinks(
                        DEFAULT_SOCIAL_LINKS.map((link, index) => ({
                            ...link,
                            id: `default-${index}`,
                        }))
                    );
                    return;
                }

                if (data && data.length > 0) {
                    setSocialLinks(data);
                } else {
                    // Use default links if no data is returned
                    console.info(
                        'No social links found in database, using defaults'
                    );
                    setSocialLinks(
                        DEFAULT_SOCIAL_LINKS.map((link, index) => ({
                            ...link,
                            id: `default-${index}`,
                        }))
                    );
                }
            } catch (error) {
                console.error('Error in fetching social links:', error);
                // Use default links for any exception
                setSocialLinks(
                    DEFAULT_SOCIAL_LINKS.map((link, index) => ({
                        ...link,
                        id: `default-${index}`,
                    }))
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchSocialLinks();
    }, []);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    // Function to render the appropriate icon component based on the icon name
    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'Facebook':
                return <Facebook size={24} className="w-5 h-5 md:w-6 md:h-6" />;
            case 'Instagram':
                return (
                    <Instagram size={24} className="w-5 h-5 md:w-6 md:h-6" />
                );
            case 'MessageCircle':
                return (
                    <MessageCircle
                        size={24}
                        className="w-5 h-5 md:w-6 md:h-6"
                    />
                );
            case 'Phone':
                return <Phone size={24} className="w-5 h-5 md:w-6 md:h-6" />;
            default:
                return <Link size={24} className="w-5 h-5 md:w-6 md:h-6" />;
        }
    };

    // Show loading or return null only if we have no links even after loading
    if (isLoading) {
        return null; // Don't show anything while loading
    }

    // Even with the fallbacks, double-check we have links to display
    if (socialLinks.length === 0) {
        return null;
    }

    // For mobile: only show WhatsApp button at bottom left
    if (isMobile) {
        const whatsappLink = socialLinks.find(link => link.platform === 'WhatsApp');
        
        if (!whatsappLink) return null;
        
        return (
            <div className="fixed left-4 bottom-4 z-50">
                <a
                    href={whatsappLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 rounded-full bg-[#25D366] shadow-lg hover:scale-110 transition-all duration-300"
                    aria-label="WhatsApp"
                >
                    <MessageCircle size={24} className="text-white" />
                </a>
            </div>
        );
    }

    // Desktop version remains unchanged
    return (
        <div
            className={`fixed ${
                isRTL ? 'right-0' : 'left-0'
            } top-1/2 -translate-y-1/2 z-50`}
        >
            {/* Main floating container */}
            <div
                className={`
          flex items-center
          ${isRTL ? 'justify-start' : 'justify-start'}
          relative
        `}
                data-aos="fade-right"
                data-aos-delay="100"
            >
                <div
                    className={`
            bg-primary/90 backdrop-blur-lg md:p-3 p-2 
            ${isRTL ? 'rounded-l-xl' : 'rounded-r-xl'}
            border-2 border-primary/50
            shadow-lg shadow-black/20 transition-all duration-300 ease-in-out
            ${
                isExpanded
                    ? isRTL
                        ? 'translate-x-0'
                        : 'translate-x-0'
                    : isRTL
                    ? 'translate-x-1'
                    : '-translate-x-1'
            }
            z-10
          `}
                >
                    {/* Social icons */}
                    <div className="py-1 space-y-4 md:space-y-5 md:py-2">
                        {socialLinks.map((link) => (
                            <div key={link.id} className="relative group">
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`
                    flex items-center transition-all duration-300 relative
                    ${
                        isExpanded
                            ? isRTL
                                ? 'md:pl-20 pl-16'
                                : 'md:pr-20 pr-16'
                            : isRTL
                            ? 'pl-0'
                            : 'pr-0'
                    }
                    hover:scale-110
                  `}
                                    aria-label={link.platform}
                                >
                                    <div
                                        className="md:p-2 p-1.5 rounded-full transition-all duration-300 hover:bg-white/30"
                                        style={{
                                            color: 'white',
                                        }}
                                    >
                                        {getIconComponent(link.icon)}
                                    </div>

                                    {/* Label that appears when expanded */}
                                    <span
                                        className={`
                      absolute ${
                          isRTL ? 'md:right-12 right-10' : 'md:left-12 left-10'
                      } whitespace-nowrap md:text-sm text-xs font-medium
                      transition-all duration-300 origin-left text-white
                      ${
                          isExpanded
                              ? 'opacity-100 scale-100'
                              : 'opacity-0 scale-90'
                      }
                    `}
                                        style={{
                                            color: 'white',
                                        }}
                                    >
                                        {t(
                                            `social.${link.platform.toLowerCase()}`,
                                            link.platform
                                        )}
                                    </span>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Toggle button - positioned outside the main container */}
                <button
                    className={`
            absolute ${
                isRTL ? 'md:-left-12 -left-10' : 'md:-right-12 -right-10'
            } top-1/2 -translate-y-1/2 
            bg-accent md:p-2.5 p-2 
            ${isRTL ? 'rounded-l-lg' : 'rounded-r-lg'}
            shadow-lg cursor-pointer border-2 border-white/30 
            transition-transform duration-300 hover:scale-110
            z-20
          `}
                    onClick={toggleExpanded}
                    aria-label={
                        isExpanded
                            ? 'Collapse social menu'
                            : 'Expand social menu'
                    }
                >
                    <Share2
                        size={20}
                        className={`text-white transition-transform duration-300 md:w-5 md:h-5 w-4 h-4 ${
                            isExpanded
                                ? isRTL
                                    ? 'rotate-0'
                                    : 'rotate-180'
                                : isRTL
                                ? 'rotate-180'
                                : 'rotate-0'
                        }`}
                    />
                </button>

                {/* Pulse animation for attention */}
                {!isExpanded && (
                    <div
                        className={`absolute ${
                            isRTL
                                ? 'md:-left-12 -left-10'
                                : 'md:-right-12 -right-10'
                        } top-1/2 -translate-y-1/2 z-10`}
                    >
                        <span className="absolute flex w-8 h-8 md:h-10 md:w-10">
                            <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-accent"></span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloatingSocial;
