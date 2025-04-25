import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { LANGUAGES } from "../../lib/i18n";
import {
  Plus,
  Save,
  Trash2,
  Search,
  X,
  Globe,
  Check,
  ArrowLeft,
  FileText,
  Settings,
  Database,
  RefreshCw,
  Sparkles,
  FileSymlink,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import TabComponent from "./common/TabComponent";
import { translateWithDeepSeek } from "../../lib/deepseek";
import {
  syncSectionToTranslations,
  refreshAllSectionTranslations,
} from "../../lib/contentSync";

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
  const [filteredGroups, setFilteredGroups] = useState<TranslationGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedNamespace, setSelectedNamespace] = useState("common");
  const [namespaces, setNamespaces] = useState<string[]>(["common"]);
  const [newTranslation, setNewTranslation] = useState({
    key: "",
    namespace: "common",
    translations: {} as Record<string, string>,
  });
  const [languageSettings, setLanguageSettings] = useState<LanguageSetting>({
    id: "",
    default_language: "en",
    available_languages: ["en", "id"],
  });
  const [isEditingLanguages, setIsEditingLanguages] = useState(false);
  const [activeTab, setActiveTab] = useState("translations");
  const [landingSections, setLandingSections] = useState<LandingSection[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

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
          group.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        .from("translations")
        .select("*")
        .order("key", { ascending: true });

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

        groups[groupKey].translations[translation.language] = translation.value;
      });

      setNamespaces(Array.from(namespaceSet));
      setTranslationGroups(Object.values(groups));
      setFilteredGroups(
        Object.values(groups).filter(
          (group) => group.namespace === selectedNamespace
        )
      );
    } catch (error) {
      console.error("Error fetching translations:", error);
      toast.error("Failed to load translations");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch landing sections from Supabase
  const fetchLandingSections = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_sections")
        .select("*");

      if (error) throw error;

      setLandingSections(data);
    } catch (error) {
      console.error("Error fetching landing sections:", error);
      toast.error("Failed to load landing sections");
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
      console.error("Error importing from landing sections:", error);
      toast.error("Failed to import content");
    } finally {
      setIsImporting(false);
    }
  };

  // Fetch language settings from Supabase
  const fetchLanguageSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("language_settings")
        .select("*")
        .single();

      if (error) throw error;

      setLanguageSettings(data);
    } catch (error) {
      console.error("Error fetching language settings:", error);
      toast.error("Failed to load language settings");
    }
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
  };

  // Save a translation to Supabase
  const saveTranslation = async (group: TranslationGroup, language: string) => {
    setIsSaving(true);
    try {
      const value = group.translations[language];

      // Check if translation exists
      const { data, error: fetchError } = await supabase
        .from("translations")
        .select("id")
        .eq("key", group.key)
        .eq("namespace", group.namespace)
        .eq("language", language)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        // Update existing translation
        const { error } = await supabase
          .from("translations")
          .update({ value })
          .eq("id", data.id);

        if (error) throw error;
      } else {
        // Insert new translation
        const { error } = await supabase.from("translations").insert({
          key: group.key,
          namespace: group.namespace,
          language,
          value,
        });

        if (error) throw error;
      }

      toast.success(`Translation saved for ${language}`);
    } catch (error) {
      console.error("Error saving translation:", error);
      toast.error("Failed to save translation");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a translation group
  const deleteTranslationGroup = async (group: TranslationGroup) => {
    if (
      !confirm(
        `Are you sure you want to delete the key "${group.key}" in namespace "${group.namespace}"?`
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("translations")
        .delete()
        .eq("key", group.key)
        .eq("namespace", group.namespace);

      if (error) throw error;

      setTranslationGroups(
        translationGroups.filter(
          (g) => !(g.key === group.key && g.namespace === group.namespace)
        )
      );

      toast.success("Translation deleted");
    } catch (error) {
      console.error("Error deleting translation:", error);
      toast.error("Failed to delete translation");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new translation
  const addNewTranslation = async () => {
    if (!newTranslation.key.trim()) {
      toast.error("Translation key is required");
      return;
    }

    // Check if any translations are provided
    const hasTranslations = Object.keys(newTranslation.translations).length > 0;
    if (!hasTranslations) {
      toast.error("At least one translation is required");
      return;
    }

    setIsSaving(true);
    try {
      // Check if key already exists in the selected namespace
      const existingGroup = translationGroups.find(
        (g) =>
          g.key === newTranslation.key &&
          g.namespace === newTranslation.namespace
      );

      if (existingGroup) {
        toast.error("This key already exists in the selected namespace");
        setIsSaving(false);
        return;
      }

      // Insert translations
      const inserts = Object.entries(newTranslation.translations).map(
        ([language, value]) => ({
          key: newTranslation.key,
          namespace: newTranslation.namespace,
          language,
          value,
        })
      );

      const { error } = await supabase.from("translations").insert(inserts);

      if (error) throw error;

      // Add new translation group to state
      const newGroup: TranslationGroup = {
        key: newTranslation.key,
        namespace: newTranslation.namespace,
        translations: { ...newTranslation.translations },
      };

      setTranslationGroups([...translationGroups, newGroup]);

      // Reset form
      setNewTranslation({
        key: "",
        namespace: newTranslation.namespace,
        translations: {},
      });

      toast.success("New translation added");
    } catch (error) {
      console.error("Error adding translation:", error);
      toast.error("Failed to add translation");
    } finally {
      setIsSaving(false);
    }
  };

  // Update language settings
  const updateLanguageSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("language_settings")
        .update({
          default_language: languageSettings.default_language,
          available_languages: languageSettings.available_languages,
        })
        .eq("id", languageSettings.id);

      if (error) throw error;

      setIsEditingLanguages(false);
      toast.success("Language settings updated");
    } catch (error) {
      console.error("Error updating language settings:", error);
      toast.error("Failed to update language settings");
    } finally {
      setIsSaving(false);
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
      newSettings.available_languages = newSettings.available_languages.filter(
        (l) => l !== lang
      );
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

  // Add a new namespace
  const addNamespace = async (namespace: string) => {
    if (!namespace.trim() || namespaces.includes(namespace)) {
      return;
    }

    setNamespaces([...namespaces, namespace]);
    setSelectedNamespace(namespace);
  };

  /**
   * Generate a translation using AI
   */
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
        toast.error(`No source text found in ${sourceLanguage} language`);
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

      toast.success(`Translation generated for ${targetLanguage}`);
    } catch (error) {
      console.error("Error generating translation:", error);
      toast.error("Failed to generate translation");
    } finally {
      // Clear loading state
      setIsTranslating((prev) => ({ ...prev, [translationKey]: false }));
    }
  };

  // Handle global sync
  const handleGlobalSync = async () => {
    setIsSyncing(true);
    try {
      const result = await refreshAllSectionTranslations(
        languageSettings.default_language
      );

      if (result.success) {
        toast.success(result.message);
        // Refresh translations to show the newly synced content
        fetchTranslations();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error syncing content:", error);
      toast.error("Failed to sync content");
    } finally {
      setIsSyncing(false);
    }
  };

  const tabs = [
    { id: "translations", label: "Translations", icon: <FileText size={16} /> },
    { id: "languages", label: "Language Settings", icon: <Globe size={16} /> },
    { id: "add", label: "Add Translation", icon: <Plus size={16} /> },
    { id: "import", label: "Import Content", icon: <Database size={16} /> },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/admin" className="mr-4 p-2 rounded-full hover:bg-gray-200">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Translations Manager
          </h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleGlobalSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
            {isSyncing ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <FileSymlink size={16} className="mr-2" />
                Sync All Content
              </>
            )}
          </button>
          {activeTab === "languages" && isEditingLanguages && (
            <button
              onClick={updateLanguageSettings}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Language Settings
                </>
              )}
            </button>
          )}
          {activeTab === "add" && (
            <button
              onClick={addNewTranslation}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
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
          {activeTab === "import" && (
            <button
              onClick={importFromLandingSections}
              disabled={isImporting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Database size={16} className="mr-2" />
                  Import Content
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <TabComponent
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="px-6 pt-4"
        />

        <div className="p-6">
          {/* Translations Tab */}
          {activeTab === "translations" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search translations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <select
                    value={selectedNamespace}
                    onChange={(e) => {
                      setSelectedNamespace(e.target.value);
                      setSearchQuery("");
                    }}
                    className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    {namespaces.map((namespace) => (
                      <option key={namespace} value={namespace}>
                        {namespace}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    const namespace = prompt("Enter new namespace:");
                    if (namespace) addNamespace(namespace);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-md flex-shrink-0 hover:bg-gray-300 transition-colors"
                >
                  <Plus size={18} className="inline mr-1" /> Add Namespace
                </button>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : `Translations in "${selectedNamespace}"`}
                </h2>

                {filteredGroups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No translations found
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredGroups.map((group) => (
                      <div
                        key={`${group.namespace}:${group.key}`}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium">{group.key}</h3>
                            <div className="text-sm text-gray-500">
                              Namespace: {group.namespace}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteTranslationGroup(group)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                            title="Delete translation"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {languageSettings.available_languages.map((lang) => {
                            const hasTranslation =
                              group.translations[lang] !== undefined;
                            const translationKey = `${group.key}-${lang}`;
                            const isLoading =
                              isTranslating[translationKey] || false;

                            return (
                              <div
                                key={lang}
                                className="flex items-start space-x-2"
                              >
                                <div className="flex-1">
                                  <label className="block text-sm font-medium mb-1">
                                    <span className="mr-1">
                                      {
                                        LANGUAGES[
                                          lang as keyof typeof LANGUAGES
                                        ]?.flag
                                      }
                                    </span>
                                    {
                                      LANGUAGES[lang as keyof typeof LANGUAGES]
                                        ?.nativeName
                                    }
                                  </label>
                                  <div className="flex">
                                    <input
                                      type="text"
                                      value={group.translations[lang] || ""}
                                      onChange={(e) =>
                                        updateTranslation(
                                          group,
                                          lang,
                                          e.target.value
                                        )
                                      }
                                      placeholder={
                                        hasTranslation ? "" : "No translation"
                                      }
                                      className={`flex-1 px-4 py-2 border rounded-l-md bg-white ${
                                        hasTranslation
                                          ? "border-gray-300"
                                          : "border-yellow-300 bg-yellow-50"
                                      }`}
                                    />
                                    <button
                                      onClick={() =>
                                        generateTranslation(group, lang)
                                      }
                                      disabled={
                                        isLoading ||
                                        lang ===
                                          languageSettings.default_language
                                      }
                                      className={`px-3 py-2 border-t border-b border-l border-r border-gray-300 bg-white text-gray-600 hover:bg-gray-50 ${
                                        lang ===
                                        languageSettings.default_language
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}
                                    >
                                      {isLoading ? (
                                        <RefreshCw
                                          size={16}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Sparkles size={16} />
                                      )}
                                    </button>
                                    <button
                                      onClick={() =>
                                        saveTranslation(group, lang)
                                      }
                                      disabled={isSaving}
                                      className="px-3 py-2 border border-gray-300 rounded-r-md bg-white text-gray-600 hover:bg-gray-50"
                                    >
                                      {isSaving ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                      ) : (
                                        <Save size={18} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Language Settings Tab */}
          {activeTab === "languages" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Language Settings</h2>
                {!isEditingLanguages ? (
                  <button
                    onClick={() => setIsEditingLanguages(true)}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    <Settings size={18} className="inline mr-1" /> Edit
                    Languages
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      fetchLanguageSettings();
                      setIsEditingLanguages(false);
                    }}
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    <X size={18} className="inline mr-1" /> Cancel
                  </button>
                )}
              </div>

              {isEditingLanguages ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(LANGUAGES).map(([code, details]) => (
                    <div
                      key={code}
                      className={`p-3 rounded-lg border ${
                        languageSettings.available_languages.includes(code)
                          ? "border-primary bg-primary/10"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg">{details.flag}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleLanguageAvailability(code)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              languageSettings.available_languages.includes(
                                code
                              )
                                ? "bg-primary text-white"
                                : "bg-gray-200"
                            }`}
                            title={
                              languageSettings.available_languages.includes(
                                code
                              )
                                ? "Disable"
                                : "Enable"
                            }
                          >
                            {languageSettings.available_languages.includes(
                              code
                            ) ? (
                              <Check size={14} />
                            ) : (
                              <Plus size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="font-medium">{details.nativeName}</div>
                      <div className="text-sm text-gray-500">{code}</div>
                      {languageSettings.available_languages.includes(code) && (
                        <div className="mt-2">
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="radio"
                              checked={
                                languageSettings.default_language === code
                              }
                              onChange={() => setDefaultLanguage(code)}
                              className="form-radio text-primary"
                            />
                            <span>Default</span>
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="mb-4">
                    <strong className="text-gray-700">Default Language:</strong>{" "}
                    <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full">
                      {
                        LANGUAGES[
                          languageSettings.default_language as keyof typeof LANGUAGES
                        ]?.flag
                      }{" "}
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
                      {languageSettings.available_languages.map((lang) => (
                        <div
                          key={lang}
                          className="px-3 py-1 bg-gray-100 rounded-full flex items-center"
                        >
                          <span className="mr-1">
                            {LANGUAGES[lang as keyof typeof LANGUAGES]?.flag}
                          </span>
                          <span>
                            {
                              LANGUAGES[lang as keyof typeof LANGUAGES]
                                ?.nativeName
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Translation Tab */}
          {activeTab === "add" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    {namespaces.map((namespace) => (
                      <option key={namespace} value={namespace}>
                        {namespace}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Translations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {languageSettings.available_languages.map((lang) => (
                    <div
                      key={lang}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <label className="block text-sm font-medium mb-1">
                        <span className="mr-1">
                          {LANGUAGES[lang as keyof typeof LANGUAGES]?.flag}
                        </span>
                        {LANGUAGES[lang as keyof typeof LANGUAGES]?.nativeName}
                      </label>
                      <input
                        type="text"
                        value={newTranslation.translations[lang] || ""}
                        onChange={(e) =>
                          setNewTranslation({
                            ...newTranslation,
                            translations: {
                              ...newTranslation.translations,
                              [lang]: e.target.value,
                            },
                          })
                        }
                        placeholder={`Translation for ${lang}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Import Content Tab */}
          {activeTab === "import" && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Import Content from Landing Sections
                </h2>
                <p className="mb-4 text-gray-600">
                  This will import text content from the landing_sections table
                  into the translations system. Only content in the default
                  language (
                  {
                    LANGUAGES[
                      languageSettings.default_language as keyof typeof LANGUAGES
                    ]?.nativeName
                  }
                  ) will be imported.
                </p>

                <div className="flex items-center space-x-2 mb-6">
                  <button
                    onClick={fetchLandingSections}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh Content
                  </button>
                  <span className="text-sm text-gray-500">
                    {landingSections.length} sections available
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Available Sections</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {landingSections.map((section) => (
                      <div
                        key={section.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <h4 className="font-medium">{section.name}</h4>
                        <div className="text-sm text-gray-500 mt-1">
                          <div>
                            <strong>Title:</strong> {section.title}
                          </div>
                          {section.subtitle && (
                            <div>
                              <strong>Subtitle:</strong> {section.subtitle}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-400">
                            Content fields:{" "}
                            {Object.keys(section.content || {}).join(", ")}
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
