import { Loader2, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../components/ui/Tabs';
import { supabase } from '../../lib/supabase';
import ContactInfoTab from './contact/ContactInfoTab';
import GeneralTab from './contact/GeneralTab';
import MapLocationsTab from './contact/MapLocationsTab';

type SocialLink = {
    id: string;
    platform: string;
    url: string;
    iconName: string;
};

type MapLocation = {
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
};

type ContactSectionEditorProps = null;

const ContactSectionEditor: React.FC<ContactSectionEditorProps> = () => {
    // General section fields
    const [title, setTitle] = useState('Get in Touch');
    const [subtitle, setSubtitle] = useState('CONTACT');
    const [description, setDescription] = useState(
        'Have questions about our services? Contact us and we will get back to you as soon as possible.'
    );
    const [isActive, setIsActive] = useState(true);

    // Contact form settings
    const [formTitle, setFormTitle] = useState('Send Us a Message');

    // Contact info arrays
    const [contactInfo, setContactInfo] = useState({
        address: [''],
        phone: [''],
        email: [''],
        business_hours: [''],
    });

    // Map locations
    const [mapLocations, setMapLocations] = useState<MapLocation[]>([
        {
            id: 1,
            name: 'Jakarta Office',
            address:
                'Jl. Sudirman Kav. 52-53, Jakarta Selatan, 12190, Indonesia',
            lat: -6.3003633,
            lng: 106.7949649,
        },
        {
            id: 2,
            name: 'Medan Office',
            address: 'Jl. Gatot Subroto No. 123, Medan, Indonesia',
            lat: 3.5218576,
            lng: 98.6235427,
        },
    ]);

    // Editor state
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        fetchContactData();
    }, []);

    const fetchContactData = async () => {
        try {
            const { data, error } = await supabase
                .from('landing_sections')
                .select('*')
                .eq('name', 'contact')
                .single();

            if (error) throw error;

            if (data) {
                // Set general section data
                setTitle(data.title || title);
                setSubtitle(data.subtitle || subtitle);
                setDescription(data.content?.description || description);
                setIsActive(data.is_active);

                // Set contact info arrays with default empty values if not present
                if (data.content?.contact_info) {
                    const contactInfoData = data.content.contact_info;
                    setContactInfo({
                        address: Array.isArray(contactInfoData.address)
                            ? contactInfoData.address
                            : [contactInfoData.address || ''],
                        phone: Array.isArray(contactInfoData.phone)
                            ? contactInfoData.phone
                            : [contactInfoData.phone || ''],
                        email: Array.isArray(contactInfoData.email)
                            ? contactInfoData.email
                            : [contactInfoData.email || ''],
                        business_hours: Array.isArray(
                            contactInfoData.business_hours
                        )
                            ? contactInfoData.business_hours
                            : [
                                  contactInfoData.business_hours?.weekdays ||
                                      '',
                                  contactInfoData.business_hours?.weekends ||
                                      '',
                              ].filter(Boolean),
                    });
                }

                // Set map locations if available
                if (
                    data.content?.map_locations &&
                    Array.isArray(data.content.map_locations)
                ) {
                    setMapLocations(data.content.map_locations);
                }

                // Set form settings
                if (data.content?.form) {
                    setFormTitle(data.content.form.title || formTitle);
                }
            }
        } catch (error) {
            console.error('Error fetching contact section data:', error);
        }
    };

    const handleContactArrayChange = (
        field: string,
        index: number,
        value: string
    ) => {
        setContactInfo((prev) => ({
            ...prev,
            [field]: prev[field].map((item: string, i: number) =>
                i === index ? value : item
            ),
        }));
    };

    const handleAddContactArrayItem = (field: string) => {
        setContactInfo((prev) => ({
            ...prev,
            [field]: [...prev[field], ''],
        }));
    };

    const handleRemoveContactArrayItem = (field: string, index: number) => {
        setContactInfo((prev) => ({
            ...prev,
            [field]: prev[field].filter((_: string, i: number) => i !== index),
        }));
    };

    // Map location handlers
    const handleAddLocation = (location: MapLocation) => {
        setMapLocations((prev) => [...prev, location]);
    };

    const handleUpdateLocation = (updatedLocation: MapLocation) => {
        setMapLocations((prev) =>
            prev.map((location) =>
                location.id === updatedLocation.id ? updatedLocation : location
            )
        );
    };

    const handleRemoveLocation = (id: number) => {
        setMapLocations((prev) =>
            prev.filter((location) => location.id !== id)
        );
    };

    const saveContactSection = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        setSaveError(null);

        try {
            // Format the contact data into the structure expected by the database
            const contactData = {
                name: 'contact',
                title,
                subtitle,
                content: {
                    description,
                    contact_info: {
                        address: contactInfo.address,
                        phone: contactInfo.phone,
                        email: contactInfo.email,
                        business_hours: contactInfo.business_hours,
                    },
                    map_locations: mapLocations,
                    form: {
                        title: formTitle,
                    },
                },
                is_active: isActive,
            };

            const { error } = await supabase
                .from('landing_sections')
                .upsert(contactData, { onConflict: 'name' });

            if (error) throw error;

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving contact section:', error);
            setSaveError((error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">
                    Contact Section Settings
                </h2>
                <button
                    onClick={saveContactSection}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
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

            {saveSuccess && (
                <div className="p-3 m-4 text-green-800 rounded-md bg-green-50">
                    Contact section saved successfully!
                </div>
            )}

            {saveError && (
                <div className="p-3 m-4 text-red-800 rounded-md bg-red-50">
                    Error: {saveError}
                </div>
            )}

            <Tabs defaultValue="general" className="p-4">
                <TabsList className="mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="contact-info">Contact Info</TabsTrigger>
                    <TabsTrigger value="map-locations">
                        Map Locations
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <GeneralTab
                        title={title}
                        subtitle={subtitle}
                        description={description}
                        isActive={isActive}
                        onTitleChange={setTitle}
                        onSubtitleChange={setSubtitle}
                        onDescriptionChange={setDescription}
                        onActiveChange={setIsActive}
                    />
                </TabsContent>

                <TabsContent value="contact-info">
                    <ContactInfoTab
                        contactInfo={contactInfo}
                        onContactArrayChange={handleContactArrayChange}
                        onAddContactArrayItem={handleAddContactArrayItem}
                        onRemoveContactArrayItem={handleRemoveContactArrayItem}
                    />
                </TabsContent>

                <TabsContent value="map-locations">
                    <MapLocationsTab
                        locations={mapLocations}
                        onAddLocation={handleAddLocation}
                        onUpdateLocation={handleUpdateLocation}
                        onRemoveLocation={handleRemoveLocation}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ContactSectionEditor;
