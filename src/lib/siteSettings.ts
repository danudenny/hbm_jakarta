import { supabase } from './supabase';

export interface SiteSettings {
    id?: string;
    company_name: string;
    company_logo?: string;
    company_email?: string;
    company_phone?: string;
    company_address?: string;
    smtp_host?: string;
    smtp_port?: number;
    smtp_user?: string;
    smtp_password?: string;
    smtp_from_email?: string;
    smtp_from_name?: string;
    primary_color: string;
    accent_color: string;
}

/**
 * Fetches the site settings from the database
 * @returns The site settings object or null if not found
 */
export const fetchSiteSettings = async (): Promise<SiteSettings | null> => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching site settings:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return null;
    }
};

/**
 * Updates the site settings in the database
 * @param settings The site settings to update
 * @returns True if successful, false otherwise
 */
export const updateSiteSettings = async (
    settings: SiteSettings
): Promise<boolean> => {
    try {
        // Remove any undefined or null values from settings
        const cleanSettings = Object.fromEntries(
            Object.entries(settings).filter(
                ([_, v]) => v !== null && v !== undefined
            )
        ) as SiteSettings;

        // First, check if we need to update or insert
        const { data: existingSettings, error: fetchError } = await supabase
            .from('site_settings')
            .select('*') // Get all fields to see what we're working with
            .limit(1)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching existing settings:', fetchError);
            return false;
        }

        let result;

        if (existingSettings?.id) {
            // Update existing record
            result = await supabase
                .from('site_settings')
                .update(cleanSettings)
                .eq('id', existingSettings.id)
                .select();
        } else {
            // Insert new record
            result = await supabase
                .from('site_settings')
                .insert([cleanSettings])
                .select();
        }

        if (result.error) {
            console.error('Error updating site settings:', result.error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error updating site settings:', error);
        return false;
    }
};

/**
 * Handles a logo file and returns a data URL
 * @param file The logo file to process
 * @returns The data URL of the file or undefined if there was an error
 */
export const uploadLogo = async (file: File): Promise<string | undefined> => {
    try {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    // Return the data URL representing the file
                    resolve(event.target.result as string);
                } else {
                    reject(new Error('Failed to read file'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading the image file'));
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        });
    } catch (error: any) {
        console.error(`Error processing logo: ${error.message}`);
        return undefined;
    }
};
