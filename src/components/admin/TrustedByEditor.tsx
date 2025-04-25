import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  Save,
  ArrowLeft,
  Upload,
  Plus,
  Trash,
  GripVertical,
  Image,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TrustedByContent = {
  id: string;
  name: string;
  title: string;
  content: {
    description?: string;
    companies: Array<{
      name: string;
      logo: string;
    }>;
  };
  is_active: boolean;
};

type Company = {
  name: string;
  logo: string;
};

// Sortable company component
const SortableCompany = ({
  company,
  index,
  onCompanyChange,
  onRemoveCompany,
  onFileUpload,
  uploading,
  disableRemove,
  id,
}: {
  company: Company;
  index: number;
  onCompanyChange: (index: number, field: string, value: string) => void;
  onRemoveCompany: (index: number) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  uploading: number | null;
  disableRemove: boolean;
  id: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const [showImageUrl, setShowImageUrl] = useState(false);

  const handleImageDataUrl = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    try {
      // Use FileReader to convert image to data URL if upload fails
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target && event.target.result) {
          // If Supabase upload fails, we'll use this as fallback
          const dataUrl = event.target.result as string;
          onFileUpload(e, index);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border border-gray-200 rounded-md hover:border-gray-300 transition-colors ${
        isDragging ? "bg-gray-50" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button
            type="button"
            className="cursor-grab p-1 mr-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <h4 className="font-medium text-gray-700">Company #{index + 1}</h4>
        </div>
        <button
          type="button"
          onClick={() => onRemoveCompany(index)}
          className="text-red-500 hover:text-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disableRemove}
        >
          <Trash size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            value={company.name}
            onChange={(e) => onCompanyChange(index, "name", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., Microsoft, Google, etc."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Company Logo
            </label>
            <button
              type="button"
              onClick={() => setShowImageUrl(!showImageUrl)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showImageUrl ? "Hide URL input" : "Enter URL manually"}
            </button>
          </div>

          {showImageUrl && (
            <div className="mb-2">
              <input
                type="text"
                value={company.logo}
                onChange={(e) => onCompanyChange(index, "logo", e.target.value)}
                placeholder="Enter logo URL"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div
              className={`relative ${
                company.logo
                  ? "w-32 h-16 border border-gray-200 rounded-md overflow-hidden"
                  : "w-32 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center"
              }`}
            >
              {company.logo ? (
                <>
                  <img
                    src={company.logo}
                    alt={company.name || `Company ${index + 1}`}
                    className="w-full h-full object-contain p-2"
                  />
                </>
              ) : (
                <div className="text-gray-400 flex flex-col items-center justify-center">
                  <Image size={20} />
                  <span className="text-xs mt-1">No logo</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="relative">
                <input
                  type="file"
                  id={`logo-upload-${index}`}
                  onChange={handleImageDataUrl}
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading !== null}
                />
                <label
                  htmlFor={`logo-upload-${index}`}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none ${
                    uploading !== null
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  } w-full justify-center`}
                >
                  {uploading === index ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700 mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      {company.logo ? "Replace Logo" : "Upload Logo"}
                    </>
                  )}
                </label>
              </div>

              {company.logo && (
                <button
                  type="button"
                  onClick={() => onCompanyChange(index, "logo", "")}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm flex items-center justify-center w-full"
                >
                  <X size={14} className="mr-1" />
                  Remove Logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrustedByEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [section, setSection] = useState<TrustedByContent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: {
      description: "",
      companies: [{ name: "", logo: "" }],
    },
    is_active: true,
  });

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTrustedBySection();
  }, []);

  const fetchTrustedBySection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .eq("name", "trusted-by")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No data found, create a new section
          await createDefaultSection();
          return;
        }
        throw error;
      }

      setSection(data);
      setFormData({
        title: data.title,
        content: data.content,
        is_active: data.is_active,
      });
    } catch (error: any) {
      toast.error(`Error loading trusted by section: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSection = async () => {
    try {
      const defaultSection = {
        name: "trusted-by",
        title: "Trusted by Leading Companies Worldwide",
        content: {
          description: "",
          companies: [
            {
              name: "Microsoft",
              logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
            },
            {
              name: "Google",
              logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
            },
            {
              name: "Amazon",
              logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
            },
            {
              name: "Meta",
              logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
            },
            {
              name: "IBM",
              logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
            },
          ],
        },
        is_active: true,
      };

      const { data, error } = await supabase
        .from("landing_sections")
        .insert(defaultSection)
        .select()
        .single();

      if (error) throw error;

      setSection(data);
      setFormData({
        title: data.title,
        content: data.content,
        is_active: data.is_active,
      });

      toast.success("Created default trusted by section");
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

  const handleCompanyChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newCompanies = [...prev.content.companies];
      newCompanies[index] = {
        ...newCompanies[index],
        [field]: value,
      };

      return {
        ...prev,
        content: {
          ...prev.content,
          companies: newCompanies,
        },
      };
    });
  };

  const handleAddCompany = () => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        companies: [...prev.content.companies, { name: "", logo: "" }],
      },
    }));
  };

  const handleRemoveCompany = (index: number) => {
    setFormData((prev) => {
      const newCompanies = [...prev.content.companies];
      newCompanies.splice(index, 1);

      return {
        ...prev,
        content: {
          ...prev.content,
          companies: newCompanies,
        },
      };
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    setUploading(index);

    try {
      // Use FileReader to convert image to data URL
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target && event.target.result) {
          // The result is a data URL representing the file
          const dataUrl = event.target.result as string;
          handleCompanyChange(index, "logo", dataUrl);
          toast.success("Logo loaded successfully");
          setUploading(null);
        }
      };

      reader.onerror = () => {
        toast.error("Error reading the image file");
        setUploading(null);
      };

      // Read the file as a data URL
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error(`Error processing image: ${error.message}`);
      setUploading(null);
    } finally {
      // Clear the file input
      e.target.value = "";
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((prev) => {
        // Find the indices of the items
        const oldIndex = parseInt(active.id.toString().split("-")[1]);
        const newIndex = parseInt(over.id.toString().split("-")[1]);

        // Create a new array with the updated order
        const newCompanies = arrayMove(
          prev.content.companies,
          oldIndex,
          newIndex
        );

        return {
          ...prev,
          content: {
            ...prev.content,
            companies: newCompanies,
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
        .from("landing_sections")
        .update({
          title: formData.title,
          content: formData.content,
          is_active: formData.is_active,
        })
        .eq("name", "trusted-by");

      if (error) throw error;

      toast.success("Trusted By section updated successfully");
    } catch (error: any) {
      toast.error(`Error saving section: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/admin" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Trusted By Section
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Logo Management */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">Company Logos</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop to reorder the companies. Click on a logo to edit or
                  replace it.
                </p>

                <div className="mb-4">
                  <button
                    onClick={handleAddCompany}
                    className="flex items-center px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span>Add Company</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.content.companies.length === 0 ? (
                    <div className="text-center p-6 border border-dashed border-gray-300 rounded-md">
                      <p className="text-gray-500">
                        No companies added yet. Click "Add Company" to get started.
                      </p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={formData.content.companies.map(
                          (_, index) => `company-${index}`
                        )}
                        strategy={verticalListSortingStrategy}
                      >
                        {formData.content.companies.map((company, index) => (
                          <SortableCompany
                            key={`company-${index}`}
                            id={`company-${index}`}
                            company={company}
                            index={index}
                            onCompanyChange={handleCompanyChange}
                            onRemoveCompany={handleRemoveCompany}
                            onFileUpload={handleFileUpload}
                            uploading={uploading}
                            disableRemove={formData.content.companies.length <= 1}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Section Settings */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">Section Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Trusted By Leading Companies"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This title will be displayed at the top of the trusted by
                      section
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.content.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          content: {
                            ...formData.content,
                            description: e.target.value,
                          },
                        })
                      }
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Add a brief description to appear below the title"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      A short description to provide context for the company logos
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-gray-700">
                      Section Status
                    </span>
                    <label className="inline-flex items-center cursor-pointer">
                      <span className="mr-3 text-sm text-gray-500">
                        {formData.is_active ? "Active" : "Inactive"}
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
                    When disabled, this section will not be shown on the landing
                    page
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">Tips & Best Practices</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary">
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
                      Use logos with transparent backgrounds for best results
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary">
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
                      Keep logos similar in size for visual consistency
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary">
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
                      Aim for 4-8 logos for optimal display on most screens
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary">
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
                      Use high-quality images (SVG or PNG) for sharp display
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Full-width Preview Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Preview</h2>
            <div className="p-6 bg-gray-50 rounded-md">
              <h3 className="text-center text-xl font-semibold mb-2">
                {formData.title}
              </h3>
              {formData.content.description && (
                <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
                  {formData.content.description}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-center max-w-4xl mx-auto">
                {formData.content.companies.map((company, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center p-3"
                  >
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="h-16 object-contain mb-2"
                      />
                    ) : (
                      <div className="h-16 w-full bg-gray-200 rounded-md flex items-center justify-center mb-2">
                        <span className="text-xs text-gray-500">No logo</span>
                      </div>
                    )}
                    <span className="text-xs text-gray-500 text-center">
                      {company.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrustedByEditor;
