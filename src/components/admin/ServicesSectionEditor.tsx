import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ArrowLeft,
    Award,
    Book,
    Briefcase,
    Building,
    Calendar,
    Clipboard,
    Clock,
    CreditCard,
    FileCheck,
    FileText,
    Globe,
    Grip,
    Heart,
    HelpCircle,
    Home,
    Key,
    Lock,
    Mail,
    MapPin,
    Phone,
    Plane,
    Plus,
    Save,
    Shield,
    ShoppingBag,
    Star,
    Trash,
    Truck,
    Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Create a list of available icons from lucide-react
const availableIcons = [
    'FileText',
    'Plane',
    'CreditCard',
    'MapPin',
    'FileCheck',
    'Users',
    'Briefcase',
    'Globe',
    'Clock',
    'Shield',
    'Award',
    'Star',
    'Heart',
    'Phone',
    'Mail',
    'Calendar',
    'Book',
    'Clipboard',
    'Key',
    'Lock',
    'Home',
    'Building',
    'Truck',
    'ShoppingBag',
];

// Map of icon names to components
const iconMap = {
    FileText,
    Plane,
    CreditCard,
    MapPin,
    FileCheck,
    Users,
    Briefcase,
    Globe,
    Clock,
    Shield,
    Award,
    Star,
    Heart,
    Phone,
    Mail,
    Calendar,
    Book,
    Clipboard,
    Key,
    Lock,
    Home,
    Building,
    Truck,
    ShoppingBag,
    HelpCircle,
};

type ServiceItem = {
    id: string;
    icon: string;
    title: string;
    description: string;
};

type ServicesSectionContent = {
    id: string;
    name: string;
    title: string;
    subtitle: string;
    content: {
        description: string;
        cta_text: string;
        cta_link: string;
        note: string;
        services: ServiceItem[];
    };
    is_active: boolean;
};

// Sortable service item component
const SortableServiceItem = ({
    service,
    index,
    onRemove,
    onChange,
    disableRemove,
}: {
    service: ServiceItem;
    index: number;
    onRemove: () => void;
    onChange: (field: string, value: string) => void;
    disableRemove: boolean;
}) => {
    const [showIconPicker, setShowIconPicker] = useState(false);

    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: service.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="p-4 mb-4 bg-white border border-gray-200 rounded-md"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-2 mr-2 text-gray-500 cursor-grab hover:text-gray-700"
                    >
                        <Grip size={16} />
                    </div>
                    <h4 className="font-medium">Service #{index + 1}</h4>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-1 text-red-500 hover:text-red-700"
                        disabled={disableRemove}
                    >
                        <Trash size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Icon
                    </label>
                    <div className="flex items-center space-x-2">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            {React.createElement(
                                iconMap[service.icon as keyof typeof iconMap] ||
                                    iconMap.HelpCircle,
                                { size: 24 }
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            {showIconPicker
                                ? 'Close Icon Picker'
                                : 'Select Icon'}
                        </button>
                    </div>

                    {showIconPicker && (
                        <div className="p-3 mt-2 border border-gray-200 rounded-md bg-gray-50">
                            <div className="mb-2 text-sm font-medium">
                                Select an icon:
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                                {availableIcons.map((iconName) => {
                                    const IconComponent =
                                        iconMap[
                                            iconName as keyof typeof iconMap
                                        ];
                                    return (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => {
                                                onChange('icon', iconName);
                                                setShowIconPicker(false);
                                            }}
                                            className={`p-2 rounded-md hover:bg-primary/10 ${
                                                service.icon === iconName
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {React.createElement(
                                                IconComponent,
                                                { size: 20 }
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        type="text"
                        value={service.title}
                        onChange={(e) => onChange('title', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        value={service.description}
                        onChange={(e) =>
                            onChange('description', e.target.value)
                        }
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
            </div>
        </div>
    );
};

const ServicesSectionEditor = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        content: {
            description: '',
            cta_text: 'Request Consultation',
            cta_link: '#contact',
            note: 'Need a service not listed above? We offer customized solutions for special cases.',
            services: [] as ServiceItem[],
        },
        is_active: true,
    });

    // Set up DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchServicesSection();
    }, []);

    const fetchServicesSection = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('landing_sections')
                .select('*')
                .eq('name', 'services')
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
                    description: data.content.description || '',
                    cta_text: data.content.cta_text || 'Request Consultation',
                    cta_link: data.content.cta_link || '#contact',
                    note:
                        data.content.note ||
                        'Need a service not listed above? We offer customized solutions for special cases.',
                    services: data.content.services || [],
                },
                is_active: data.is_active,
            });
        } catch (error: any) {
            toast.error(`Error loading services section: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const createDefaultSection = async () => {
        try {
            const defaultServices = [
                {
                    id: '1',
                    icon: 'FileText',
                    title: 'RPTKA Handling',
                    description:
                        'Complete assistance with Foreign Worker Placement Plan (RPTKA) documentation and approval process.',
                },
                {
                    id: '2',
                    icon: 'Plane',
                    title: 'Work Visa Processing',
                    description:
                        'Expert guidance and handling of work visa applications for foreign nationals entering Indonesia.',
                },
                {
                    id: '3',
                    icon: 'CreditCard',
                    title: 'KITAS Creation',
                    description:
                        'Streamlined processing of Temporary Stay Permit Cards (KITAS) for foreign workers.',
                },
                {
                    id: '4',
                    icon: 'MapPin',
                    title: 'SKTT & Domicile Reporting',
                    description:
                        'Efficient handling of Temporary Residence Card (SKTT) and mandatory domicile reporting requirements.',
                },
                {
                    id: '5',
                    icon: 'FileCheck',
                    title: 'Document Consultation',
                    description:
                        'Professional advice on required documentation and compliance with Indonesian immigration regulations.',
                },
                {
                    id: '6',
                    icon: 'Users',
                    title: 'Company Sponsorship',
                    description:
                        'Guidance for companies sponsoring foreign employees and ensuring legal compliance.',
                },
            ];

            const defaultSection = {
                name: 'services',
                title: 'Comprehensive Immigration Solutions for Expatriates',
                subtitle: 'OUR SERVICES',
                content: {
                    description:
                        'We provide end-to-end services for all foreign worker documentation needs in Indonesia, ensuring full compliance with current regulations and streamlined processes.',
                    cta_text: 'Request Consultation',
                    cta_link: '#contact',
                    note: 'Need a service not listed above? We offer customized solutions for special cases.',
                    services: defaultServices,
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

            toast.success('Created default services section');
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

    const handleServiceChange = (
        index: number,
        field: string,
        value: string
    ) => {
        setFormData((prev) => {
            const newServices = [...prev.content.services];
            newServices[index] = {
                ...newServices[index],
                [field]: value,
            };

            return {
                ...prev,
                content: {
                    ...prev.content,
                    services: newServices,
                },
            };
        });
    };

    const handleAddService = () => {
        const newService = {
            id: Date.now().toString(),
            icon: 'Star',
            title: 'New Service',
            description: 'Description of the new service.',
        };

        setFormData((prev) => ({
            ...prev,
            content: {
                ...prev.content,
                services: [...prev.content.services, newService],
            },
        }));
    };

    const handleRemoveService = (index: number) => {
        setFormData((prev) => {
            const newServices = [...prev.content.services];
            newServices.splice(index, 1);

            return {
                ...prev,
                content: {
                    ...prev.content,
                    services: newServices,
                },
            };
        });
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setFormData((prev) => {
                const oldIndex = prev.content.services.findIndex(
                    (service) => service.id === active.id
                );
                const newIndex = prev.content.services.findIndex(
                    (service) => service.id === over.id
                );

                const newServices = [...prev.content.services];
                const [movedService] = newServices.splice(oldIndex, 1);
                newServices.splice(newIndex, 0, movedService);

                return {
                    ...prev,
                    content: {
                        ...prev.content,
                        services: newServices,
                    },
                };
            });
        }
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
                .eq('name', 'services');

            if (error) throw error;

            toast.success('Services section updated successfully');
        } catch (error: any) {
            toast.error(`Error saving section: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Link to="/admin" className="mr-4">
                        <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Services Section
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

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                        {/* Left Column - Services Management */}
                        <div className="space-y-6">
                            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <h2 className="mb-4 text-lg font-medium">
                                    Services
                                </h2>
                                <p className="mb-4 text-sm text-gray-500">
                                    Drag and drop to reorder services. Each
                                    service includes an icon, title, and
                                    description.
                                </p>

                                <div className="mb-4">
                                    <button
                                        type="button"
                                        onClick={handleAddService}
                                        className="flex items-center px-3 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        <span>Add Service</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                        modifiers={[restrictToVerticalAxis]}
                                    >
                                        <SortableContext
                                            items={formData.content.services.map(
                                                (service) => service.id
                                            )}
                                            strategy={
                                                verticalListSortingStrategy
                                            }
                                        >
                                            {formData.content.services.map(
                                                (service, index) => (
                                                    <SortableServiceItem
                                                        key={service.id}
                                                        service={service}
                                                        index={index}
                                                        onRemove={() =>
                                                            handleRemoveService(
                                                                index
                                                            )
                                                        }
                                                        onChange={(
                                                            field,
                                                            value
                                                        ) =>
                                                            handleServiceChange(
                                                                index,
                                                                field,
                                                                value
                                                            )
                                                        }
                                                        disableRemove={
                                                            formData.content
                                                                .services
                                                                .length <= 1
                                                        }
                                                    />
                                                )
                                            )}
                                        </SortableContext>
                                    </DndContext>
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
                                                placeholder="e.g. OUR SERVICES"
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Appears above the main title
                                                (usually in uppercase)
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
                                                placeholder="e.g. What We Offer"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                The main heading for this
                                                section
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            Section Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.content.description}
                                            onChange={(e) =>
                                                handleContentChange(
                                                    'description',
                                                    e.target.value
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            rows={3}
                                            placeholder="Enter a description for your services section..."
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            A brief introduction to your
                                            services that appears below the
                                            title
                                        </p>
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
                                                            is_active:
                                                                e.target
                                                                    .checked,
                                                        })
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </div>
                                        </label>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        When disabled, this section will not be
                                        shown on the landing page
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <h2 className="mb-4 text-lg font-medium">
                                    Call to Action Settings
                                </h2>

                                <div className="space-y-4">
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
                                            placeholder="e.g. Request Consultation"
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
                                            placeholder="e.g. #contact or https://example.com/contact"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Use # for page sections (e.g.
                                            #contact) or full URLs
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            Note Text (Optional)
                                        </label>
                                        <textarea
                                            value={formData.content.note}
                                            onChange={(e) =>
                                                handleContentChange(
                                                    'note',
                                                    e.target.value
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            rows={2}
                                            placeholder="Leave empty to hide the note"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            This text appears above the CTA
                                            button
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <h2 className="mb-4 text-lg font-medium">
                                    Tips & Best Practices
                                </h2>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-5 h-5 text-primary">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <p className="ml-2">
                                            Keep service descriptions concise
                                            and focused on benefits
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-5 h-5 text-primary">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <p className="ml-2">
                                            Use icons that visually represent
                                            each service
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-5 h-5 text-primary">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <p className="ml-2">
                                            Aim for 4-8 services for optimal
                                            display on most screens
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-5 h-5 text-primary">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <p className="ml-2">
                                            Use a clear call-to-action to guide
                                            visitors to the next step
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Full-width Preview Section */}
                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h2 className="mb-4 text-lg font-medium">Preview</h2>
                        <div className="p-6 rounded-md bg-gray-50">
                            {formData.subtitle && (
                                <p className="mb-1 text-sm font-medium tracking-wider text-center uppercase text-primary">
                                    {formData.subtitle}
                                </p>
                            )}
                            <h3 className="mb-4 text-2xl font-semibold text-center">
                                {formData.title}
                            </h3>
                            {formData.content.description && (
                                <p className="max-w-2xl mx-auto mb-8 text-center text-gray-600">
                                    {formData.content.description}
                                </p>
                            )}

                            <div className="grid max-w-5xl grid-cols-1 gap-6 mx-auto mb-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {formData.content.services.map(
                                    (service, index) => (
                                        <div
                                            key={index}
                                            className="p-5 bg-white border border-gray-200 rounded-md shadow-sm"
                                        >
                                            <div className="flex items-center mb-3">
                                                <div className="p-2 mr-3 rounded-full bg-primary/10 text-primary">
                                                    {React.createElement(
                                                        iconMap[
                                                            service.icon as keyof typeof iconMap
                                                        ] || iconMap.HelpCircle,
                                                        { size: 20 }
                                                    )}
                                                </div>
                                                <h4 className="font-medium">
                                                    {service.title ||
                                                        'Service Title'}
                                                </h4>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {service.description ||
                                                    'Service description goes here...'}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>

                            {formData.content.note && (
                                <p className="max-w-2xl mx-auto mb-4 text-sm italic text-center text-gray-500">
                                    {formData.content.note}
                                </p>
                            )}

                            <div className="flex justify-center">
                                <button className="px-4 py-2 text-white rounded-md bg-primary">
                                    {formData.content.cta_text}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ServicesSectionEditor;
