import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Note: You'll need to install react-quill with: npm install react-quill
// If you'd like to use a different rich text editor, replace this import
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

type AboutSectionData = {
    title: string;
    subtitle: string;
    content: {
        description1: string;
        description2: string;
        image: string;
        experience_years: number;
        experience_label: string;
        cta_text: string;
        cta_link: string;
    };
    is_active: boolean;
};

const AboutSectionEditor = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<AboutSectionData>({
        title: '',
        subtitle: '',
        content: {
            description1: '',
            description2: '',
            image: '',
            experience_years: 10,
            experience_label: 'Experience',
            cta_text: 'Get In Touch',
            cta_link: '#contact',
        },
        is_active: true,
    });

    useEffect(() => {
        fetchAboutSection();
    }, []);

    const fetchAboutSection = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('landing_sections')
                .select('*')
                .eq('name', 'about')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No data found, create a new section
                    await createDefaultSection();
                    return;
                }
                throw error;
            }

            setFormData({
                title: data.title || '',
                subtitle: data.subtitle || '',
                content: {
                    description1: data.content.description1 || '',
                    description2: data.content.description2 || '',
                    image: data.content.image || '',
                    experience_years: data.content.experience_years || 10,
                    experience_label:
                        data.content.experience_label || 'Experience',
                    cta_text: data.content.cta_text || 'Get In Touch',
                    cta_link: data.content.cta_link || '#contact',
                },
                is_active: data.is_active,
            });
        } catch (error: any) {
            toast.error(`Error loading about section: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const createDefaultSection = async () => {
        try {
            const defaultSection = {
                name: 'about',
                title: 'Your Trusted Partner for Immigration Solutions',
                subtitle: 'ABOUT US',
                content: {
                    description1:
                        'Since 2014, we have been providing expert consultation and comprehensive documentation services for foreign workers and companies operating in Indonesia. Our team of experienced professionals understands the complexities of Indonesian immigration laws and processes.',
                    description2:
                        'We take pride in our attention to detail, ensuring that every application is properly prepared, submitted, and followed through to successful completion. Our goal is to make the immigration process as smooth and stress-free as possible for our clients.',
                    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
                    experience_years: 10,
                    experience_label: 'Experience',
                    cta_text: 'Get In Touch',
                    cta_link: '#contact',
                },
                is_active: true,
            };

            const { data, error } = await supabase
                .from('landing_sections')
                .insert(defaultSection)
                .select()
                .single();

            if (error) throw error;

            setFormData({
                title: data.title,
                subtitle: data.subtitle || '',
                content: data.content,
                is_active: data.is_active,
            });

            toast.success('Created default about section');
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

    const handleContentChange = (field: string, value: string | number) => {
        setFormData({
            ...formData,
            content: {
                ...formData.content,
                [field]: value,
            },
        });
    };

    const handleRichTextChange = (value: string) => {
        handleContentChange('description2', value);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }

        const file = files[0];

        // Validate file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds 5MB limit');
            return;
        }

        // Validate file type
        const validTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        if (!validTypes.includes(file.type)) {
            toast.error(
                'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image'
            );
            return;
        }

        setUploading(true);

        try {
            // Instead of uploading to Supabase Storage which has RLS issues,
            // we'll convert the image to a data URL and use that directly
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    const dataUrl = event.target.result as string;

                    // Update form data with the data URL
                    handleContentChange('image', dataUrl);
                    toast.success('Image uploaded successfully');
                    setUploading(false);
                }
            };

            reader.onerror = () => {
                toast.error('Error reading file');
                setUploading(false);
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        } catch (error: any) {
            toast.error(`Error uploading image: ${error.message}`);
            setUploading(false);
        } finally {
            // Clear the file input
            e.target.value = '';
        }
    };

    const handleRemoveImage = () => {
        handleContentChange('image', '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('landing_sections')
                .update({
                    title: formData.title,
                    subtitle: formData.subtitle,
                    content: formData.content,
                    is_active: formData.is_active,
                })
                .eq('name', 'about');

            if (error) throw error;

            toast.success('About section updated successfully');
        } catch (error: any) {
            toast.error(`Error saving section: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
            </div>
        );
    }

    // This is a simple textarea-based rich text editor that mimics a WYSIWYG editor
    // until you can install a proper rich text editor like React-Quill
    const RichTextEditorPlaceholder = ({
        value,
        onChange,
    }: {
        value: string;
        onChange: (value: string) => void;
    }) => {
        return (
            <div className="rich-text-editor">
                <div className="flex gap-2 p-2 bg-gray-100 border border-gray-300 rounded-t-md">
                    <button
                        type="button"
                        className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        title="Bold"
                    >
                        B
                    </button>
                    <button
                        type="button"
                        className="px-2 py-1 italic bg-white border border-gray-300 rounded hover:bg-gray-50"
                        title="Italic"
                    >
                        I
                    </button>
                    <button
                        type="button"
                        className="px-2 py-1 underline bg-white border border-gray-300 rounded hover:bg-gray-50"
                        title="Underline"
                    >
                        U
                    </button>
                    <button
                        type="button"
                        className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        title="Heading"
                    >
                        H
                    </button>
                    <button
                        type="button"
                        className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        title="List"
                    >
                        • List
                    </button>
                </div>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-2 border border-t-0 border-gray-300 rounded-b-md"
                    rows={6}
                    placeholder="Add rich text content here..."
                />
            </div>
        );
    };

    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Link to="/admin" className="mr-4">
                        <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit About Section
                    </h1>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                {/* Left Column - Content & Image */}
                <div className="space-y-6">
                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h2 className="mb-4 text-lg font-medium">Content</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    First Paragraph
                                </label>
                                <textarea
                                    value={formData.content.description1}
                                    onChange={(e) =>
                                        handleContentChange(
                                            'description1',
                                            e.target.value
                                        )
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                    placeholder="Describe your company's history and mission..."
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    This will appear as the first paragraph in
                                    the about section
                                </p>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Second Paragraph (Rich Text)
                                </label>
                                {/* Replace this with actual ReactQuill when you have it installed */}
                                <RichTextEditorPlaceholder
                                    value={formData.content.description2}
                                    onChange={handleRichTextChange}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    This rich text editor allows you to format
                                    your content with styles, lists, and more
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h2 className="mb-4 text-lg font-medium">
                            About Image
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={formData.content.image}
                                    onChange={(e) =>
                                        handleContentChange(
                                            'image',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter image URL or upload an image"
                                    className="flex-1 p-2 border border-gray-300 rounded-md"
                                />
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="about-image-upload"
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                        className="sr-only"
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="about-image-upload"
                                        className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none ${
                                            uploading
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'cursor-pointer'
                                        }`}
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-gray-700 rounded-full animate-spin"></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                Upload
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {formData.content.image && (
                                <div className="relative mt-2">
                                    <div className="absolute z-10 top-2 right-2">
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <img
                                        src={formData.content.image}
                                        alt="About Preview"
                                        className="object-cover w-full rounded-md h-60"
                                    />
                                </div>
                            )}
                            <p className="text-xs text-gray-500">
                                Choose a high-quality image that represents your
                                company or team
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h2 className="mb-4 text-lg font-medium">Experience</h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Experience Years
                                </label>
                                <input
                                    type="number"
                                    value={formData.content.experience_years}
                                    onChange={(e) =>
                                        handleContentChange(
                                            'experience_years',
                                            parseInt(e.target.value)
                                        )
                                    }
                                    min="1"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Number of years of experience
                                </p>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Experience Label
                                </label>
                                <input
                                    type="text"
                                    value={formData.content.experience_label}
                                    onChange={(e) =>
                                        handleContentChange(
                                            'experience_label',
                                            e.target.value
                                        )
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="e.g. Years Experience"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Label displayed below the years number
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Section Settings */}
                <div className="space-y-6">
                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h2 className="mb-4 text-lg font-medium">
                            Section Settings
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Section Subtitle
                                    </label>
                                    <input
                                        type="text"
                                        name="subtitle"
                                        value={formData.subtitle}
                                        onChange={handleInputChange}
                                        placeholder="e.g. ABOUT US"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Appears above the main title (usually in
                                        uppercase)
                                    </p>
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Section Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="e.g. Your Trusted Partner"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        The main heading for this section
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        CTA Button Text
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.content.cta_text}
                                        onChange={(e) =>
                                            handleContentChange(
                                                'cta_text',
                                                e.target.value
                                            )
                                        }
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="e.g. Get In Touch"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Text displayed on the call-to-action
                                        button
                                    </p>
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        CTA Button Link
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.content.cta_link}
                                        onChange={(e) =>
                                            handleContentChange(
                                                'cta_link',
                                                e.target.value
                                            )
                                        }
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="e.g. #contact"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Use # for page sections (e.g. #contact)
                                        or full URLs
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-medium text-gray-700">
                                    Section Status
                                </span>
                                <label className="inline-flex items-center cursor-pointer">
                                    <span className="mr-3 text-sm text-gray-500">
                                        {formData.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                    </span>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    is_active: e.target.checked,
                                                })
                                            }
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                When disabled, this section will not be shown on
                                the landing page
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-width Preview Section */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-lg font-medium">Preview</h2>
                <div className="p-6 rounded-md bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8 text-center">
                            {formData.subtitle && (
                                <p className="mb-1 text-sm font-medium tracking-wider uppercase text-primary">
                                    {formData.subtitle}
                                </p>
                            )}
                            <h3 className="mb-4 text-3xl font-semibold">
                                {formData.title}
                            </h3>
                        </div>

                        <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
                            <div className="space-y-6">
                                {formData.content.description1 && (
                                    <p className="text-gray-600">
                                        {formData.content.description1}
                                    </p>
                                )}

                                {formData.content.description2 && (
                                    <div
                                        className="text-gray-600"
                                        dangerouslySetInnerHTML={{
                                            __html: formData.content
                                                .description2,
                                        }}
                                    />
                                )}

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="p-4 text-center bg-white rounded-lg shadow-sm">
                                        <div className="mb-1 text-3xl font-bold text-primary">
                                            {formData.content.experience_years}+
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formData.content.experience_label}
                                        </div>
                                    </div>

                                    <div className="p-4 text-center bg-white rounded-lg shadow-sm">
                                        <div className="mb-1 text-3xl font-bold text-primary">
                                            24/7
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Support
                                        </div>
                                    </div>
                                </div>

                                {formData.content.cta_text && (
                                    <div className="mt-8">
                                        <button className="px-6 py-3 text-white transition-colors rounded-md bg-primary hover:bg-primary-dark">
                                            {formData.content.cta_text}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                {formData.content.image ? (
                                    <img
                                        src={formData.content.image}
                                        alt="About"
                                        className="w-full h-auto rounded-lg shadow-md"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full bg-gray-200 rounded-lg h-80">
                                        <p className="text-gray-400">
                                            No image uploaded
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutSectionEditor;
