import {
    ExternalLink,
    Facebook,
    Instagram,
    MessageCircle,
    Phone,
    Plus,
    Save,
    Trash,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

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
                .from('floating_social_links')
                .select('*')
                .order('id');

            if (error) throw error;

            if (data && data.length > 0) {
                setSocialLinks(data);
            } else {
                // Set default social links if none exist
                const defaultLinks = [
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

                // Insert default links if none exist
                const { error: insertError } = await supabase
                    .from('floating_social_links')
                    .insert(defaultLinks);

                if (insertError) {
                    console.error(
                        'Error inserting default links:',
                        insertError
                    );
                    // If insert fails, just use the defaults in state without saving to DB
                    setSocialLinks(defaultLinks);
                } else {
                    // Fetch the newly inserted links with their IDs
                    const { data: newData, error: fetchError } = await supabase
                        .from('floating_social_links')
                        .select('*')
                        .order('id');

                    if (fetchError) throw fetchError;
                    setSocialLinks(newData || defaultLinks);
                }
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
            // First, handle updates and inserts
            for (const link of socialLinks) {
                if (!link.id) {
                    // New link - insert
                    const { id, ...newLink } = link;
                    const { error: insertError } = await supabase
                        .from('floating_social_links')
                        .insert(newLink);
                    
                    if (insertError) throw insertError;
                } else {
                    // Existing link - update
                    const { error: updateError } = await supabase
                        .from('floating_social_links')
                        .update({
                            platform: link.platform,
                            url: link.url,
                            icon: link.icon,
                            color: link.color,
                        })
                        .eq('id', link.id);
                    
                    if (updateError) throw updateError;
                }
            }

            // Get current IDs in the database
            const { data: currentData, error: fetchError } = await supabase
                .from('floating_social_links')
                .select('id');
            
            if (fetchError) throw fetchError;

            // Find IDs to delete (IDs in DB but not in current state)
            const currentIds = currentData?.map((item) => item.id) || [];
            const stateIds = socialLinks
                .filter((link) => link.id)
                .map((link) => link.id);
            const idsToDelete = currentIds.filter(
                (id) => !stateIds.includes(id)
            );

            // Handle deletions
            if (idsToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from('floating_social_links')
                    .delete()
                    .in('id', idsToDelete);
                
                if (deleteError) throw deleteError;
            }

            toast.success('Social links saved successfully');

            // Refresh links to get updated data
            await fetchSocialLinks();
        } catch (error: any) {
            toast.error(`Error saving social links: ${error.message}`);
            console.error('Detailed error:', error);
        } finally {
            setSaving(false);
        }
    };

    const addNewLink = () => {
        setSocialLinks([
            ...socialLinks,
            {
                platform: '',
                url: '',
                icon: 'Link',
                color: '#64748b',
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
            case 'Facebook':
                return <Facebook size={20} />;
            case 'Instagram':
                return <Instagram size={20} />;
            case 'MessageCircle':
                return <MessageCircle size={20} />;
            case 'Phone':
                return <Phone size={20} />;
            default:
                return <ExternalLink size={20} />;
        }
    };

    const platformOptions = [
        {
            label: 'Facebook',
            value: 'Facebook',
            icon: 'Facebook',
            color: '#1877F2',
        },
        {
            label: 'Instagram',
            value: 'Instagram',
            icon: 'Instagram',
            color: '#E4405F',
        },
        {
            label: 'WhatsApp',
            value: 'MessageCircle',
            icon: 'MessageCircle',
            color: '#25D366',
        },
        { label: 'Phone', value: 'Phone', icon: 'Phone', color: '#4F46E5' },
        {
            label: 'Other',
            value: 'ExternalLink',
            icon: 'ExternalLink',
            color: '#64748b',
        },
    ];

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
                    Floating Social Links
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
                <div className="mb-6">
                    <h2 className="mb-2 text-lg font-semibold text-gray-800">
                        Edit Floating Social Links
                    </h2>
                    <p className="text-sm text-gray-500">
                        These links appear on the left side of your website. You
                        can add up to 5 social media links.
                    </p>
                </div>

                <div className="space-y-6">
                    {socialLinks.map((link, index) => (
                        <div
                            key={index}
                            className="p-5 border border-gray-200 rounded-lg bg-gray-50"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-gray-700">
                                    Social Link #{index + 1}
                                </h3>
                                <button
                                    onClick={() => removeLink(index)}
                                    className="text-red-500 transition-colors hover:text-red-700"
                                    disabled={socialLinks.length <= 1}
                                >
                                    <Trash size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Platform
                                    </label>
                                    <select
                                        value={
                                            platformOptions.find(
                                                (option) =>
                                                    option.icon === link.icon
                                            )?.value || ''
                                        }
                                        onChange={(e) => {
                                            const selected =
                                                platformOptions.find(
                                                    (option) =>
                                                        option.value ===
                                                        e.target.value
                                                );
                                            if (selected) {
                                                handleInputChange(
                                                    index,
                                                    'platform',
                                                    selected.label
                                                );
                                                handleInputChange(
                                                    index,
                                                    'icon',
                                                    selected.icon
                                                );
                                                handleInputChange(
                                                    index,
                                                    'color',
                                                    selected.color
                                                );
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="" disabled>
                                            Select Platform
                                        </option>
                                        {platformOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        URL
                                    </label>
                                    <input
                                        type="text"
                                        value={link.url}
                                        onChange={(e) =>
                                            handleInputChange(
                                                index,
                                                'url',
                                                e.target.value
                                            )
                                        }
                                        placeholder="https://example.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Preview
                                </label>
                                <div className="flex items-center p-3 bg-white border border-gray-200 rounded-md">
                                    <div
                                        className="flex items-center justify-center w-8 h-8 mr-3 rounded-full"
                                        style={{
                                            backgroundColor: link.color + '20',
                                        }}
                                    >
                                        <span style={{ color: link.color }}>
                                            {getIconComponent(link.icon)}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700">
                                            {link.platform || 'Platform'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {link.url || 'https://example.com'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {socialLinks.length < 5 && (
                        <button
                            onClick={addNewLink}
                            className="flex items-center justify-center w-full py-3 text-gray-500 transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:text-gray-700 hover:border-gray-400"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Another Social Link
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">
                    Preview
                </h2>
                <div className="relative overflow-hidden rounded-lg h-96 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <div className="absolute left-0 -translate-y-1/2 top-1/2">
                        <div className="p-3 space-y-4 border rounded-r-lg bg-white/10 backdrop-blur-md border-white/20">
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
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-medium text-white text-opacity-30">
                        Website Background
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FloatingSocialEditor;
