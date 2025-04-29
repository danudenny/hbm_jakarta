import {
    ArrowLeft,
    Check,
    Database,
    FileText,
    Globe,
    Plus,
    RefreshCw,
    Save,
    Search,
    Settings,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { refreshAllSectionTranslations } from '../../lib/contentSync';
import { translateWithDeepSeek } from '../../lib/deepseek';
import { LANGUAGES, reloadTranslations } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import TabComponent from './common/TabComponent';

interface Translation {
    id: string;
    key: string;
    namespace: string;
    language: string;
    value: string;
}

interface TranslationGroup {
    key: string;
    namespace: string;
    translations: Record<string, string>;
}

interface LanguageSetting {
    id: string;
    default_language: string;
    available_languages: string[];
}

interface LandingSection {
    id: string;
    name: string;
    title: string;
    subtitle: string | null;
    content: any;
}

const TranslationsManager: React.FC = () => {
    const [translationGroups, setTranslationGroups] = useState<
        TranslationGroup[]
    >([]);
    const [filteredGroups, setFilteredGroups] = useState<TranslationGroup[]>(
        []
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>(
        {}
    );
    const [selectedNamespace, setSelectedNamespace] = useState('common');
    const [namespaces, setNamespaces] = useState<string[]>(['common']);
    const [newTranslation, setNewTranslation] = useState({
        key: '',
        namespace: 'common',
        translations: {} as Record<string, string>,
    });
    const [languageSettings, setLanguageSettings] = useState<LanguageSetting>({
        id: '',
        default_language: 'en',
        available_languages: ['en', 'id'],
    });
    const [isEditingLanguages, setIsEditingLanguages] = useState(false);
    const [activeTab, setActiveTab] = useState('translations');
    const [landingSections, setLandingSections] = useState<LandingSection[]>(
        []
    );

    // Fetch translations and language settings
    useEffect(() => {
        fetchTranslations();
        fetchLanguageSettings();
        fetchLandingSections();
    }, []);

    // Filter translations when search query or namespace changes
    useEffect(() => {
        if (searchQuery) {
            const filtered = translationGroups.filter(
                (group) =>
                    group.key
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    Object.values(group.translations).some((value) =>
                        value.toLowerCase().includes(searchQuery.toLowerCase())
                    )
            );
            setFilteredGroups(filtered);
        } else {
            const filtered = translationGroups.filter(
                (group) => group.namespace === selectedNamespace
            );
            setFilteredGroups(filtered);
        }
    }, [searchQuery, translationGroups, selectedNamespace]);

    // Fetch translations from Supabase
    const fetchTranslations = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('translations')
                .select('*')
                .order('key', { ascending: true });

            if (error) throw error;

            // Group translations by key and namespace
            const groups: Record<string, TranslationGroup> = {};
            const namespaceSet = new Set<string>();

            data.forEach((translation: Translation) => {
                const groupKey = `${translation.namespace}:${translation.key}`;
                namespaceSet.add(translation.namespace);

                if (!groups[groupKey]) {
                    groups[groupKey] = {
                        key: translation.key,
                        namespace: translation.namespace,
                        translations: {},
                    };
                }

                groups[groupKey].translations[translation.language] =
                    translation.value;
            });

            setNamespaces(Array.from(namespaceSet));
            setTranslationGroups(Object.values(groups));
            setFilteredGroups(
                Object.values(groups).filter(
                    (group) => group.namespace === selectedNamespace
                )
            );
        } catch (error) {
            console.error('Error fetching translations:', error);
            toast.error('Failed to load translations');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch landing sections from Supabase
    const fetchLandingSections = async () => {
        try {
            const { data, error } = await supabase
                .from('landing_sections')
                .select('*');

            if (error) throw error;

            setLandingSections(data);
        } catch (error) {
            console.error('Error fetching landing sections:', error);
            toast.error('Failed to load landing sections');
        }
    };

    // Import content from landing_sections to translations
    const importFromLandingSections = async () => {
        setIsImporting(true);
        try {
            // Use the new refreshAllSectionTranslations function
            const result = await refreshAllSectionTranslations(
                languageSettings.default_language
            );

            if (result.success) {
                toast.success(result.message);
                // Refresh translations to show the newly imported content
                fetchTranslations();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error importing from landing sections:', error);
            toast.error('Failed to import content');
        } finally {
            setIsImporting(false);
        }
    };

    // Fetch language settings from Supabase
    const fetchLanguageSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('language_settings')
                .select('*')
                .single();

            if (error) throw error;

            setLanguageSettings(data);
        } catch (error) {
            console.error('Error fetching language settings:', error);
            toast.error('Failed to load language settings');
        }
    };

    // Save a translation
    const saveTranslation = async (
        group: TranslationGroup,
        language: string
    ) => {
        setIsSaving(true);
        try {
            const value = group.translations[language];

            // Check if translation exists
            const { data, error: fetchError } = await supabase
                .from('translations')
                .select('*')
                .eq('key', group.key)
                .eq('namespace', group.namespace)
                .eq('language', language)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (data) {
                // Update existing translation
                const { error } = await supabase
                    .from('translations')
                    .update({ value })
                    .eq('id', data.id);

                if (error) throw error;
            } else {
                // Insert new translation
                const { error } = await supabase.from('translations').insert({
                    key: group.key,
                    namespace: group.namespace,
                    language,
                    value,
                });

                if (error) throw error;
            }

            toast.success(`Translation saved for ${language}`);

            // Reload translations in i18n
            await reloadTranslations();
        } catch (error) {
            console.error('Error saving translation:', error);
            toast.error('Failed to save translation');
        } finally {
            setIsSaving(false);
        }
    };

    // Delete a translation group
    const deleteTranslationGroup = async (group: TranslationGroup) => {
        try {
            const { error } = await supabase
                .from('translations')
                .delete()
                .match({ key: group.key, namespace: group.namespace });

            if (error) throw error;

            // Update local state
            const updatedGroups = translationGroups.filter(
                (g) => !(g.key === group.key && g.namespace === group.namespace)
            );
            setTranslationGroups(updatedGroups);
            setFilteredGroups(
                updatedGroups.filter((g) => g.namespace === selectedNamespace)
            );

            toast.success('Translation deleted successfully');

            // Reload translations in i18n
            await reloadTranslations();
        } catch (error) {
            console.error('Error deleting translation:', error);
            toast.error('Failed to delete translation');
        }
    };

    // Add a new translation
    const addNewTranslation = async () => {
        try {
            if (!newTranslation.key) {
                toast.error('Translation key is required');
                return;
            }

            // Check if translation key already exists in the selected namespace
            const exists = translationGroups.some(
                (group) =>
                    group.key === newTranslation.key &&
                    group.namespace === newTranslation.namespace
            );

            if (exists) {
                toast.error('Translation key already exists in this namespace');
                return;
            }

            // Prepare translations to insert
            const translationsToInsert = Object.entries(
                newTranslation.translations
            )
                .filter(([_, value]) => value) // Only insert non-empty translations
                .map(([language, value]) => ({
                    key: newTranslation.key,
                    namespace: newTranslation.namespace,
                    language,
                    value,
                }));

            if (translationsToInsert.length === 0) {
                toast.error('At least one translation is required');
                return;
            }

            const { error } = await supabase
                .from('translations')
                .insert(translationsToInsert);

            if (error) throw error;

            // Create a new translation group for the local state
            const newGroup: TranslationGroup = {
                key: newTranslation.key,
                namespace: newTranslation.namespace,
                translations: { ...newTranslation.translations },
            };

            // Update local state
            setTranslationGroups([...translationGroups, newGroup]);
            if (newGroup.namespace === selectedNamespace) {
                setFilteredGroups([...filteredGroups, newGroup]);
            }

            // Reset the new translation form
            setNewTranslation({
                key: '',
                namespace: selectedNamespace,
                translations: {} as Record<string, string>,
            });

            toast.success('New translation added successfully');

            // Reload translations in i18n
            await reloadTranslations();
        } catch (error) {
            console.error('Error adding new translation:', error);
            toast.error('Failed to add new translation');
        }
    };

    // Save language settings
    const saveLanguageSettings = async () => {
        try {
            const { error } = await supabase
                .from('language_settings')
                .update({
                    default_language: languageSettings.default_language,
                    available_languages: languageSettings.available_languages,
                })
                .eq('id', languageSettings.id);

            if (error) throw error;

            setIsEditingLanguages(false);
            toast.success('Language settings saved successfully');

            // Reload translations in i18n
            await reloadTranslations();
        } catch (error) {
            console.error('Error saving language settings:', error);
            toast.error('Failed to save language settings');
        }
    };

    // Import translations from JSON files
    const importFromJsonFiles = async () => {
        try {
            toast.success(
                'This feature is no longer needed as translations are managed directly in the database.'
            );
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred');
        }
    };

    // Translate missing translations
    const translateMissingTranslations = async (group: TranslationGroup) => {
        const sourceLanguage = languageSettings.default_language;
        const sourceText = group.translations[sourceLanguage];

        if (!sourceText) {
            toast.error(`No source text found in ${sourceLanguage}`);
            return;
        }

        // Get languages that need translation
        const languagesToTranslate =
            languageSettings.available_languages.filter(
                (lang) => !group.translations[lang] && lang !== sourceLanguage
            );

        if (languagesToTranslate.length === 0) {
            toast.success('No missing translations to generate');
            return;
        }

        // Create a copy of the current isTranslating state
        const updatedIsTranslating = { ...isTranslating };
        const groupKey = `${group.namespace}:${group.key}`;
        updatedIsTranslating[groupKey] = true;
        setIsTranslating(updatedIsTranslating);

        try {
            // Translate for each missing language
            for (const targetLang of languagesToTranslate) {
                const translatedText = await translateWithDeepSeek(
                    sourceText,
                    sourceLanguage,
                    targetLang
                );

                if (translatedText) {
                    // Update the translation in the database
                    const { error } = await supabase
                        .from('translations')
                        .insert({
                            key: group.key,
                            namespace: group.namespace,
                            language: targetLang,
                            value: translatedText,
                        });

                    if (error) throw error;

                    // Update local state
                    const updatedGroups = translationGroups.map((g) => {
                        if (
                            g.key === group.key &&
                            g.namespace === group.namespace
                        ) {
                            return {
                                ...g,
                                translations: {
                                    ...g.translations,
                                    [targetLang]: translatedText,
                                },
                            };
                        }
                        return g;
                    });

                    setTranslationGroups(updatedGroups);
                    setFilteredGroups(
                        updatedGroups.filter(
                            (g) => g.namespace === selectedNamespace
                        )
                    );
                }
            }

            toast.success('Missing translations generated successfully');

            // Reload translations in i18n
            await reloadTranslations();
        } catch (error) {
            console.error('Error translating:', error);
            toast.error('Failed to generate translations');
        } finally {
            // Update isTranslating state
            const finalIsTranslating = { ...isTranslating };
            finalIsTranslating[groupKey] = false;
            setIsTranslating(finalIsTranslating);
        }
    };

    // Add a new namespace
    const addNamespace = async (namespace: string) => {
        if (!namespace.trim() || namespaces.includes(namespace)) {
            return;
        }

        setNamespaces([...namespaces, namespace]);
        setSelectedNamespace(namespace);
    };

    // Update a translation
    const updateTranslation = async (
        group: TranslationGroup,
        language: string,
        value: string
    ) => {
        const newGroups = [...translationGroups];
        const groupIndex = newGroups.findIndex(
            (g) => g.key === group.key && g.namespace === group.namespace
        );

        if (groupIndex === -1) return;

        newGroups[groupIndex].translations[language] = value;
        setTranslationGroups(newGroups);

        // Update filtered groups if necessary
        if (group.namespace === selectedNamespace) {
            const newFiltered = [...filteredGroups];
            const filteredIndex = newFiltered.findIndex(
                (g) => g.key === group.key && g.namespace === group.namespace
            );
            if (filteredIndex !== -1) {
                newFiltered[filteredIndex].translations[language] = value;
                setFilteredGroups(newFiltered);
            }
        }
    };

    // Generate translation using AI
    const generateTranslation = async (
        group: TranslationGroup,
        targetLanguage: string
    ) => {
        const translationKey = `${group.key}-${targetLanguage}`;

        // Set loading state
        setIsTranslating((prev) => ({ ...prev, [translationKey]: true }));

        try {
            // Find the source text from the default language
            const sourceLanguage = languageSettings.default_language;
            const sourceText = group.translations[sourceLanguage];

            if (!sourceText) {
                toast.error(
                    `No source text found in ${sourceLanguage} language`
                );
                return;
            }

            // Generate translation using DeepSeek AI
            const translatedText = await translateWithDeepSeek(
                sourceText,
                sourceLanguage,
                targetLanguage
            );

            // Update the translation in state
            updateTranslation(group, targetLanguage, translatedText);

            // Save to database
            const { error } = await supabase.from('translations').upsert({
                key: group.key,
                namespace: group.namespace,
                language: targetLanguage,
                value: translatedText,
            });

            if (error) throw error;

            toast.success(`Translation generated for ${targetLanguage}`);

            // Reload translations in i18n
            await reloadTranslations();
        } catch (error) {
            console.error('Error generating translation:', error);
            toast.error('Failed to generate translation');
        } finally {
            // Clear loading state
            setIsTranslating((prev) => ({ ...prev, [translationKey]: false }));
        }
    };

    // Toggle language availability
    const toggleLanguageAvailability = (lang: string) => {
        const newSettings = { ...languageSettings };

        if (newSettings.available_languages.includes(lang)) {
            // Remove language if it's not the default
            if (lang === newSettings.default_language) {
                toast.error("Can't remove the default language");
                return;
            }
            newSettings.available_languages =
                newSettings.available_languages.filter((l) => l !== lang);
        } else {
            // Add language
            newSettings.available_languages = [
                ...newSettings.available_languages,
                lang,
            ];
        }

        setLanguageSettings(newSettings);
    };

    // Set default language
    const setDefaultLanguage = (lang: string) => {
        const newSettings = { ...languageSettings };

        // Ensure the language is available
        if (!newSettings.available_languages.includes(lang)) {
            newSettings.available_languages = [
                ...newSettings.available_languages,
                lang,
            ];
        }

        newSettings.default_language = lang;
        setLanguageSettings(newSettings);
    };

    // Clear i18next cache from localStorage
    const clearTranslationCache = () => {
        try {
            // Clear i18next-related localStorage items
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('i18next_') || key === 'i18nextLng') {
                    localStorage.removeItem(key);
                }
            });

            // Force reload translations
            reloadTranslations();

            toast.success('Translation cache cleared successfully');
        } catch (error) {
            console.error('Error clearing translation cache:', error);
            toast.error('Failed to clear translation cache');
        }
    };

    const tabs = [
        {
            id: 'translations',
            label: 'Translations',
            icon: <FileText size={16} />,
        },
        {
            id: 'languages',
            label: 'Language Settings',
            icon: <Globe size={16} />,
        },
        { id: 'add', label: 'Add Translation', icon: <Plus size={16} /> },
        { id: 'import', label: 'Import Content', icon: <Database size={16} /> },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link
                        to="/admin"
                        className="p-2 mr-4 rounded-full hover:bg-gray-200"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Translations Manager
                    </h1>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={importFromLandingSections}
                        disabled={isImporting}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        {isImporting ? (
                            <>
                                <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                Importing...
                            </>
                        ) : (
                            <>
                                <Database size={16} className="mr-2" />
                                Import Content
                            </>
                        )}
                    </button>
                    <button
                        onClick={importFromJsonFiles}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                    >
                        <RefreshCw size={16} className="mr-2" />
                        Reload Translations
                    </button>
                    <button
                        onClick={clearTranslationCache}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        <X size={16} className="mr-2" />
                        Clear Cache
                    </button>
                    {isEditingLanguages ? (
                        <button
                            onClick={saveLanguageSettings}
                            disabled={isSaving}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    Save Settings
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditingLanguages(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <Settings size={16} className="mr-2" />
                            Language Settings
                        </button>
                    )}
                    {activeTab === 'add' && (
                        <button
                            onClick={addNewTranslation}
                            disabled={isSaving}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus size={16} className="mr-2" />
                                    Add Translation
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-hidden bg-white rounded-lg shadow-md">
                <TabComponent
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    className="px-6 pt-4"
                />

                <div className="p-6">
                    {/* Translations Tab */}
                    {activeTab === 'translations' && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="relative flex-1">
                                    <Search
                                        size={18}
                                        className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search translations..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full py-2 pl-10 pr-4 bg-white border border-gray-300 rounded-md"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex-shrink-0">
                                    <select
                                        value={selectedNamespace}
                                        onChange={(e) => {
                                            setSelectedNamespace(
                                                e.target.value
                                            );
                                            setSearchQuery('');
                                        }}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md md:w-auto"
                                    >
                                        {namespaces.map((namespace) => (
                                            <option
                                                key={namespace}
                                                value={namespace}
                                            >
                                                {namespace}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={() => {
                                        const namespace = prompt(
                                            'Enter new namespace:'
                                        );
                                        if (namespace) addNamespace(namespace);
                                    }}
                                    className="flex-shrink-0 px-4 py-2 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    <Plus size={18} className="inline mr-1" />{' '}
                                    Add Namespace
                                </button>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold">
                                    {searchQuery
                                        ? `Search Results for "${searchQuery}"`
                                        : `Translations in "${selectedNamespace}"`}
                                </h2>

                                {filteredGroups.length === 0 ? (
                                    <div className="py-8 text-center text-gray-500 rounded-lg bg-gray-50">
                                        No translations found
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {filteredGroups.map((group) => (
                                            <div
                                                key={`${group.namespace}:${group.key}`}
                                                className="p-4 transition-colors border border-gray-200 rounded-lg hover:border-gray-300"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-medium">
                                                            {group.key}
                                                        </h3>
                                                        <div className="text-sm text-gray-500">
                                                            Namespace:{' '}
                                                            {group.namespace}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            deleteTranslationGroup(
                                                                group
                                                            )
                                                        }
                                                        className="p-1 text-red-500 rounded-full hover:text-red-700 hover:bg-red-50"
                                                        title="Delete translation"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>

                                                <div className="p-3 space-y-3">
                                                    {languageSettings.available_languages.map(
                                                        (lang) => (
                                                            <div
                                                                key={lang}
                                                                className="flex items-start"
                                                            >
                                                                <div className="flex items-center w-16">
                                                                    <span className="mr-1 text-xl">
                                                                        {
                                                                            LANGUAGES[
                                                                                lang
                                                                            ]
                                                                                ?.flag
                                                                        }
                                                                    </span>
                                                                    <span className="text-sm text-gray-600">
                                                                        {lang}
                                                                    </span>
                                                                </div>
                                                                <div className="relative flex-1">
                                                                    <textarea
                                                                        value={
                                                                            group
                                                                                .translations[
                                                                                lang
                                                                            ] ||
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateTranslation(
                                                                                group,
                                                                                lang,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="w-full p-2 border rounded min-h-[60px]"
                                                                        placeholder={`Translation for ${lang}`}
                                                                    />
                                                                    <div className="absolute flex space-x-1 right-2 top-2">
                                                                        {isTranslating[
                                                                            `${group.key}-${lang}`
                                                                        ] ? (
                                                                            <div className="w-4 h-4 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
                                                                        ) : !group
                                                                              .translations[
                                                                              lang
                                                                          ] &&
                                                                          group
                                                                              .translations[
                                                                              languageSettings
                                                                                  .default_language
                                                                          ] ? (
                                                                            <button
                                                                                onClick={() =>
                                                                                    generateTranslation(
                                                                                        group,
                                                                                        lang
                                                                                    )
                                                                                }
                                                                                className="p-1 text-blue-600 rounded hover:bg-blue-50"
                                                                                title="Generate translation"
                                                                            >
                                                                                <Sparkles
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() =>
                                                                                    saveTranslation(
                                                                                        group,
                                                                                        lang
                                                                                    )
                                                                                }
                                                                                className="p-1 text-green-600 rounded hover:bg-green-50"
                                                                                title="Save translation"
                                                                            >
                                                                                <Save
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                    <div className="flex justify-end mt-2">
                                                        <button
                                                            onClick={() =>
                                                                translateMissingTranslations(
                                                                    group
                                                                )
                                                            }
                                                            className="flex items-center px-3 py-1 text-sm text-white bg-blue-500 rounded-md"
                                                        >
                                                            <Sparkles
                                                                size={14}
                                                                className="mr-1"
                                                            />
                                                            Translate Missing
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Language Settings Tab */}
                    {activeTab === 'languages' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">
                                    Language Settings
                                </h2>
                                {!isEditingLanguages ? (
                                    <button
                                        onClick={() =>
                                            setIsEditingLanguages(true)
                                        }
                                        className="px-4 py-2 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        <Settings
                                            size={18}
                                            className="inline mr-1"
                                        />{' '}
                                        Edit Languages
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            fetchLanguageSettings();
                                            setIsEditingLanguages(false);
                                        }}
                                        className="px-4 py-2 transition-colors bg-gray-300 rounded-md hover:bg-gray-400"
                                    >
                                        <X size={18} className="inline mr-1" />{' '}
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {isEditingLanguages ? (
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                    {Object.entries(LANGUAGES).map(
                                        ([code, details]) => (
                                            <div
                                                key={code}
                                                className={`p-3 rounded-lg border ${
                                                    languageSettings.available_languages.includes(
                                                        code
                                                    )
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-lg">
                                                        {details.flag}
                                                    </span>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                toggleLanguageAvailability(
                                                                    code
                                                                )
                                                            }
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                                languageSettings.available_languages.includes(
                                                                    code
                                                                )
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-gray-200'
                                                            }`}
                                                            title={
                                                                languageSettings.available_languages.includes(
                                                                    code
                                                                )
                                                                    ? 'Disable'
                                                                    : 'Enable'
                                                            }
                                                        >
                                                            {languageSettings.available_languages.includes(
                                                                code
                                                            ) ? (
                                                                <Check
                                                                    size={14}
                                                                />
                                                            ) : (
                                                                <Plus
                                                                    size={14}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="font-medium">
                                                    {details.nativeName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {code}
                                                </div>
                                                {languageSettings.available_languages.includes(
                                                    code
                                                ) && (
                                                    <div className="mt-2">
                                                        <label className="flex items-center space-x-2 text-sm">
                                                            <input
                                                                type="radio"
                                                                checked={
                                                                    languageSettings.default_language ===
                                                                    code
                                                                }
                                                                onChange={() =>
                                                                    setDefaultLanguage(
                                                                        code
                                                                    )
                                                                }
                                                                className="form-radio text-primary"
                                                            />
                                                            <span>Default</span>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 rounded-lg bg-gray-50">
                                    <div className="mb-4">
                                        <strong className="text-gray-700">
                                            Default Language:
                                        </strong>{' '}
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary">
                                            {
                                                LANGUAGES[
                                                    languageSettings.default_language as keyof typeof LANGUAGES
                                                ]?.flag
                                            }{' '}
                                            {
                                                LANGUAGES[
                                                    languageSettings.default_language as keyof typeof LANGUAGES
                                                ]?.nativeName
                                            }
                                        </span>
                                    </div>
                                    <div>
                                        <strong className="text-gray-700">
                                            Available Languages:
                                        </strong>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {languageSettings.available_languages.map(
                                                (lang) => (
                                                    <div
                                                        key={lang}
                                                        className="flex items-center px-3 py-1 bg-gray-100 rounded-full"
                                                    >
                                                        <span className="mr-1">
                                                            {
                                                                LANGUAGES[
                                                                    lang as keyof typeof LANGUAGES
                                                                ]?.flag
                                                            }
                                                        </span>
                                                        <span>
                                                            {
                                                                LANGUAGES[
                                                                    lang as keyof typeof LANGUAGES
                                                                ]?.nativeName
                                                            }
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add Translation Tab */}
                    {activeTab === 'add' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        Translation Key
                                    </label>
                                    <input
                                        type="text"
                                        value={newTranslation.key}
                                        onChange={(e) =>
                                            setNewTranslation({
                                                ...newTranslation,
                                                key: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., welcome_message"
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        Namespace
                                    </label>
                                    <select
                                        value={newTranslation.namespace}
                                        onChange={(e) =>
                                            setNewTranslation({
                                                ...newTranslation,
                                                namespace: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md"
                                    >
                                        {namespaces.map((namespace) => (
                                            <option
                                                key={namespace}
                                                value={namespace}
                                            >
                                                {namespace}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-lg font-medium">
                                    Translations
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {languageSettings.available_languages.map(
                                        (lang) => (
                                            <div
                                                key={lang}
                                                className="p-4 border border-gray-200 rounded-lg"
                                            >
                                                <label className="block mb-1 text-sm font-medium">
                                                    <span className="mr-1">
                                                        {
                                                            LANGUAGES[
                                                                lang as keyof typeof LANGUAGES
                                                            ]?.flag
                                                        }
                                                    </span>
                                                    {
                                                        LANGUAGES[
                                                            lang as keyof typeof LANGUAGES
                                                        ]?.nativeName
                                                    }
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        newTranslation
                                                            .translations[
                                                            lang
                                                        ] || ''
                                                    }
                                                    onChange={(e) =>
                                                        setNewTranslation({
                                                            ...newTranslation,
                                                            translations: {
                                                                ...newTranslation.translations,
                                                                [lang]: e.target
                                                                    .value,
                                                            },
                                                        })
                                                    }
                                                    placeholder={`Translation for ${lang}`}
                                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md"
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Import Content Tab */}
                    {activeTab === 'import' && (
                        <div className="space-y-6">
                            <div className="p-6 rounded-lg bg-gray-50">
                                <h2 className="mb-4 text-xl font-semibold">
                                    Import Content from Landing Sections
                                </h2>
                                <p className="mb-4 text-gray-600">
                                    This will import text content from the
                                    landing_sections table into the translations
                                    system. Only content in the default language
                                    (
                                    {
                                        LANGUAGES[
                                            languageSettings.default_language as keyof typeof LANGUAGES
                                        ]?.nativeName
                                    }
                                    ) will be imported.
                                </p>

                                <div className="flex items-center mb-6 space-x-2">
                                    <button
                                        onClick={fetchLandingSections}
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        <RefreshCw size={16} className="mr-2" />
                                        Refresh Content
                                    </button>
                                    <span className="text-sm text-gray-500">
                                        {landingSections.length} sections
                                        available
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">
                                        Available Sections
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {landingSections.map((section) => (
                                            <div
                                                key={section.id}
                                                className="p-4 border border-gray-200 rounded-lg"
                                            >
                                                <h4 className="font-medium">
                                                    {section.name}
                                                </h4>
                                                <div className="mt-1 text-sm text-gray-500">
                                                    <div>
                                                        <strong>Title:</strong>{' '}
                                                        {section.title}
                                                    </div>
                                                    {section.subtitle && (
                                                        <div>
                                                            <strong>
                                                                Subtitle:
                                                            </strong>{' '}
                                                            {section.subtitle}
                                                        </div>
                                                    )}
                                                    <div className="mt-2 text-xs text-gray-400">
                                                        Content fields:{' '}
                                                        {Object.keys(
                                                            section.content ||
                                                                {}
                                                        ).join(', ')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TranslationsManager;
