import toast from 'react-hot-toast';
import { supabase } from './supabase';

interface LandingSection {
    id: string;
    name: string;
    title: string;
    subtitle: string | null;
    content: any;
    is_active: boolean;
}

/**
 * Synchronizes content from landing_sections to translations table
 * This ensures that when content is updated in the admin panel,
 * it's also updated in the translations system
 */
export const syncSectionToTranslations = async (
    section: LandingSection,
    language: string = 'en'
) => {
    try {
        const sectionNamespace = `section.${section.name}`;
        const translationsToSync: any[] = [];

        // Add title
        if (section.title) {
            translationsToSync.push({
                key: 'title',
                namespace: sectionNamespace,
                language,
                value: section.title,
            });
        }

        // Add subtitle
        if (section.subtitle) {
            translationsToSync.push({
                key: 'subtitle',
                namespace: sectionNamespace,
                language,
                value: section.subtitle,
            });
        }

        // Add content fields
        if (section.content) {
            // Handle different content structures for different sections
            if (section.name === 'hero') {
                if (section.content.description) {
                    translationsToSync.push({
                        key: 'description',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.description,
                    });
                }

                if (section.content.cta_text) {
                    translationsToSync.push({
                        key: 'cta_text',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.cta_text,
                    });
                }

                // Add title parts for colored styling
                if (section.title) {
                    const titleWords = section.title.split(' ');
                    const mainPart = titleWords.slice(0, -1).join(' ');
                    const accentPart = titleWords.slice(-1)[0];

                    translationsToSync.push({
                        key: 'title_first_line',
                        namespace: sectionNamespace,
                        language,
                        value: mainPart,
                    });

                    translationsToSync.push({
                        key: 'title_colored_part',
                        namespace: sectionNamespace,
                        language,
                        value: accentPart,
                    });
                }

                // Handle Hero features
                if (
                    section.content.features &&
                    Array.isArray(section.content.features)
                ) {
                    section.content.features.forEach(
                        (feature: any, index: number) => {
                            if (feature.title) {
                                translationsToSync.push({
                                    key: `feature_${index + 1}_title`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: feature.title,
                                });
                            }
                            if (feature.description) {
                                translationsToSync.push({
                                    key: `feature_${index + 1}_description`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: feature.description,
                                });
                            }
                        }
                    );
                }

                // Handle Hero stats
                if (
                    section.content.stats &&
                    Array.isArray(section.content.stats)
                ) {
                    section.content.stats.forEach(
                        (stat: any, index: number) => {
                            if (stat.label) {
                                translationsToSync.push({
                                    key: `stat_${index + 1}_label`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: stat.label,
                                });
                            }
                        }
                    );
                }
            } else if (section.name === 'trusted_by') {
                // Handle Trusted By section
                if (section.content.description) {
                    translationsToSync.push({
                        key: 'description',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.description,
                    });
                }

                // Handle companies
                if (
                    section.content.companies &&
                    Array.isArray(section.content.companies)
                ) {
                    section.content.companies.forEach(
                        (company: any, index: number) => {
                            if (company.name) {
                                translationsToSync.push({
                                    key: `company_${index + 1}_name`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: company.name,
                                });
                            }
                        }
                    );
                }
            } else if (section.name === 'services') {
                // Handle Services section
                if (section.content.description) {
                    translationsToSync.push({
                        key: 'description',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.description,
                    });
                }

                if (section.content.cta_text) {
                    translationsToSync.push({
                        key: 'cta_text',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.cta_text,
                    });
                }

                if (section.content.note) {
                    translationsToSync.push({
                        key: 'note',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.note,
                    });
                }

                // Handle service cards
                if (
                    section.content.services &&
                    Array.isArray(section.content.services)
                ) {
                    section.content.services.forEach(
                        (service: any, index: number) => {
                            if (service.title) {
                                translationsToSync.push({
                                    key: `service_${index + 1}_title`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: service.title,
                                });
                            }
                            if (service.description) {
                                translationsToSync.push({
                                    key: `service_${index + 1}_description`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: service.description,
                                });
                            }
                        }
                    );
                }
            } else if (section.name === 'process') {
                // Handle Process section
                if (section.content.description) {
                    translationsToSync.push({
                        key: 'description',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.description,
                    });
                }

                // Handle process steps
                if (
                    section.content.steps &&
                    Array.isArray(section.content.steps)
                ) {
                    section.content.steps.forEach(
                        (step: any, index: number) => {
                            if (step.title) {
                                translationsToSync.push({
                                    key: `step_${index + 1}_title`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: step.title,
                                });
                            }
                            if (step.description) {
                                translationsToSync.push({
                                    key: `step_${index + 1}_description`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: step.description,
                                });
                            }
                        }
                    );
                }
            } else if (section.name === 'about') {
                // Handle About section
                if (section.content.description1) {
                    translationsToSync.push({
                        key: 'description1',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.description1,
                    });
                }

                if (section.content.description2) {
                    translationsToSync.push({
                        key: 'description2',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.description2,
                    });
                }

                if (section.content.experience_label) {
                    translationsToSync.push({
                        key: 'experience_label',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.experience_label,
                    });
                }

                if (section.content.cta_text) {
                    translationsToSync.push({
                        key: 'cta_text',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.cta_text,
                    });
                }
            } else if (section.name === 'testimonials') {
                // Handle Testimonials section
                if (section.content.description) {
                    translationsToSync.push({
                        key: 'description',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.description,
                    });
                }

                // Handle testimonials
                if (
                    section.content.testimonials &&
                    Array.isArray(section.content.testimonials)
                ) {
                    section.content.testimonials.forEach(
                        (testimonial: any, index: number) => {
                            if (testimonial.name) {
                                translationsToSync.push({
                                    key: `testimonial_${index + 1}_name`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: testimonial.name,
                                });
                            }
                            if (testimonial.position) {
                                translationsToSync.push({
                                    key: `testimonial_${index + 1}_position`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: testimonial.position,
                                });
                            }
                            if (testimonial.company) {
                                translationsToSync.push({
                                    key: `testimonial_${index + 1}_company`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: testimonial.company,
                                });
                            }
                            if (testimonial.comment) {
                                translationsToSync.push({
                                    key: `testimonial_${index + 1}_comment`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: testimonial.comment,
                                });
                            }
                        }
                    );
                }
            } else if (section.name === 'faq') {
                // Handle FAQ section
                if (section.content.description) {
                    translationsToSync.push({
                        key: 'description',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.description,
                    });
                }

                if (section.content.cta_text) {
                    translationsToSync.push({
                        key: 'cta_text',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.cta_text,
                    });
                }

                if (section.content.cta_description) {
                    translationsToSync.push({
                        key: 'cta_description',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.cta_description,
                    });
                }

                if (section.content.cta_button_text) {
                    translationsToSync.push({
                        key: 'cta_button_text',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.cta_button_text,
                    });
                }

                // Handle FAQs
                if (
                    section.content.faqs &&
                    Array.isArray(section.content.faqs)
                ) {
                    section.content.faqs.forEach((faq: any, index: number) => {
                        if (faq.question) {
                            translationsToSync.push({
                                key: `faq_${index + 1}_question`,
                                namespace: sectionNamespace,
                                language,
                                value: faq.question,
                            });
                        }
                        if (faq.answer) {
                            translationsToSync.push({
                                key: `faq_${index + 1}_answer`,
                                namespace: sectionNamespace,
                                language,
                                value: faq.answer,
                            });
                        }
                    });
                }
            } else if (section.name === 'contact') {
                // Handle Contact section
                if (section.content.description) {
                    translationsToSync.push({
                        key: 'description',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.description,
                    });
                }

                // Handle contact form fields
                if (section.content.form_title) {
                    translationsToSync.push({
                        key: 'form_title',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.form_title,
                    });
                }

                if (section.content.success_message) {
                    translationsToSync.push({
                        key: 'success_message',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.success_message,
                    });
                }

                if (section.content.error_message) {
                    translationsToSync.push({
                        key: 'error_message',
                        namespace: sectionNamespace,
                        language,
                        value: section.content.error_message,
                    });
                }

                // Handle contact info
                if (section.content.contact_info) {
                    const info = section.content.contact_info;

                    // Handle address items
                    if (info.address && Array.isArray(info.address)) {
                        info.address.forEach((item: string, index: number) => {
                            translationsToSync.push({
                                key: `address_${index + 1}`,
                                namespace: sectionNamespace,
                                language,
                                value: item,
                            });
                        });
                    }

                    // Handle phone numbers
                    if (info.phone && Array.isArray(info.phone)) {
                        info.phone.forEach((item: string, index: number) => {
                            translationsToSync.push({
                                key: `phone_${index + 1}`,
                                namespace: sectionNamespace,
                                language,
                                value: item,
                            });
                        });
                    }

                    // Handle email addresses
                    if (info.email && Array.isArray(info.email)) {
                        info.email.forEach((item: string, index: number) => {
                            translationsToSync.push({
                                key: `email_${index + 1}`,
                                namespace: sectionNamespace,
                                language,
                                value: item,
                            });
                        });
                    }

                    // Handle business hours
                    if (
                        info.business_hours &&
                        Array.isArray(info.business_hours)
                    ) {
                        info.business_hours.forEach(
                            (item: string, index: number) => {
                                translationsToSync.push({
                                    key: `business_hours_${index + 1}`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: item,
                                });
                            }
                        );
                    }
                }

                // Handle map locations
                if (
                    section.content.locations &&
                    Array.isArray(section.content.locations)
                ) {
                    section.content.locations.forEach(
                        (location: any, index: number) => {
                            if (location.name) {
                                translationsToSync.push({
                                    key: `location_${index + 1}_name`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: location.name,
                                });
                            }
                            if (location.address) {
                                translationsToSync.push({
                                    key: `location_${index + 1}_address`,
                                    namespace: sectionNamespace,
                                    language,
                                    value: location.address,
                                });
                            }
                        }
                    );
                }
            } else {
                // For sections not handled specifically, add all string content fields as separate translations
                Object.entries(section.content).forEach(([key, value]) => {
                    // Skip arrays and objects, only sync string values
                    if (typeof value === 'string') {
                        translationsToSync.push({
                            key,
                            namespace: sectionNamespace,
                            language,
                            value,
                        });
                    }
                });
            }
        }

        // For each translation to sync, check if it exists and update or insert
        for (const translation of translationsToSync) {
            const { data: existingTranslation } = await supabase
                .from('translations')
                .select('id')
                .eq('key', translation.key)
                .eq('namespace', translation.namespace)
                .eq('language', translation.language)
                .maybeSingle();

            if (existingTranslation) {
                // Update existing translation
                await supabase
                    .from('translations')
                    .update({ value: translation.value })
                    .eq('id', existingTranslation.id);
            } else {
                // Insert new translation
                await supabase.from('translations').insert(translation);
            }
        }

        return {
            success: true,
            message: `Successfully synced ${translationsToSync.length} translations for ${section.name}`,
        };
    } catch (error) {
        console.error('Error syncing section to translations:', error);
        return {
            success: false,
            message: 'Failed to sync section to translations',
        };
    }
};

/**
 * Updates a landing section and automatically syncs the changes to translations
 */
export const updateLandingSection = async (
    sectionId: string,
    updates: Partial<LandingSection>,
    language: string = 'en'
) => {
    try {
        // Update the landing section
        const { data, error } = await supabase
            .from('landing_sections')
            .update(updates)
            .eq('id', sectionId)
            .select()
            .single();

        if (error) throw error;

        // Sync the updated section to translations
        const syncResult = await syncSectionToTranslations(data, language);

        if (!syncResult.success) {
            // If sync failed, show a warning but don't fail the whole operation
            console.warn(
                'Section updated but sync to translations failed:',
                syncResult.message
            );
            toast.error('Content updated but translations may be out of sync');
        }

        return {
            success: true,
            data,
            message: 'Section updated and translations synced',
        };
    } catch (error) {
        console.error('Error updating landing section:', error);
        return {
            success: false,
            message: 'Failed to update section',
        };
    }
};

/**
 * Refreshes translations from landing sections
 * This can be used to force a full sync of all sections
 */
export const refreshAllSectionTranslations = async (
    language: string = 'en'
) => {
    try {
        // Get all landing sections
        const { data: sections, error } = await supabase
            .from('landing_sections')
            .select('*');

        if (error) throw error;

        // Sync each section to translations
        let successCount = 0;
        let failCount = 0;

        for (const section of sections) {
            const result = await syncSectionToTranslations(section, language);
            if (result.success) {
                successCount++;
            } else {
                failCount++;
            }
        }

        // Clear i18next cache in localStorage
        // This ensures the frontend will reload translations instead of using cached versions
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('i18next_') || key === 'i18nextLng') {
                localStorage.removeItem(key);
            }
        });

        return {
            success: true,
            message: `Synced ${successCount} sections, failed ${failCount} sections`,
        };
    } catch (error) {
        console.error('Error refreshing section translations:', error);
        return {
            success: false,
            message: 'Failed to refresh section translations',
        };
    }
};
