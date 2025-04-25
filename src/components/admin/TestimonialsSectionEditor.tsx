import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { Save, ArrowLeft, Plus, Trash, Upload, Star } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

type Testimonial = {
  id: string;
  name: string;
  position: string;
  company: string;
  comment: string;
  rating: number;
  image: string;
};

type TestimonialsSectionData = {
  title: string;
  subtitle: string;
  description: string;
  content: {
    testimonials: Testimonial[];
  };
  is_active: boolean;
};

const SortableTestimonial = ({
  testimonial,
  onUpdate,
  onDelete,
  onImageUpload,
}: {
  testimonial: Testimonial;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
  onImageUpload: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: testimonial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-4"
    >
      <div className="flex justify-between items-center mb-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move p-2 hover:bg-gray-100 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-500"
          >
            <circle cx="8" cy="6" r="1" />
            <circle cx="8" cy="12" r="1" />
            <circle cx="8" cy="18" r="1" />
            <circle cx="16" cy="6" r="1" />
            <circle cx="16" cy="12" r="1" />
            <circle cx="16" cy="18" r="1" />
          </svg>
        </div>
        <button
          onClick={() => onDelete(testimonial.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={testimonial.name}
              onChange={(e) => onUpdate(testimonial.id, "name", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="text"
              value={testimonial.position}
              onChange={(e) =>
                onUpdate(testimonial.id, "position", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={testimonial.company}
              onChange={(e) =>
                onUpdate(testimonial.id, "company", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating (1-5)
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => onUpdate(testimonial.id, "rating", rating)}
                  className="focus:outline-none"
                >
                  <Star
                    size={24}
                    className={
                      rating <= testimonial.rating
                        ? "text-accent fill-accent"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Testimonial
            </label>
            <textarea
              value={testimonial.comment}
              onChange={(e) =>
                onUpdate(testimonial.id, "comment", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={4}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={testimonial.image}
                onChange={(e) =>
                  onUpdate(testimonial.id, "image", e.target.value)
                }
                placeholder="Enter image URL or upload"
                className="flex-1 p-2 border border-gray-300 rounded-md"
              />
              <div className="relative">
                <input
                  type="file"
                  id={`testimonial-image-${testimonial.id}`}
                  onChange={(e) => onImageUpload(testimonial.id, e)}
                  accept="image/*"
                  className="sr-only"
                />
                <label
                  htmlFor={`testimonial-image-${testimonial.id}`}
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <Upload size={16} className="mr-2" />
                  Upload
                </label>
              </div>
            </div>
            {testimonial.image && (
              <div className="mt-2 relative">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 object-cover rounded-full border-2 border-primary/20"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSectionEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<TestimonialsSectionData>({
    title: "",
    subtitle: "",
    description: "",
    content: {
      testimonials: [],
    },
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTestimonialsSection();
  }, []);

  const fetchTestimonialsSection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .eq("name", "testimonials")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No data found, create a new section
          await createDefaultSection();
          return;
        }
        throw error;
      }

      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        description: data.content.description || "",
        content: {
          testimonials: data.content.testimonials || [],
        },
        is_active: data.is_active,
      });
    } catch (error: any) {
      toast.error(`Error loading testimonials section: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSection = async () => {
    try {
      const defaultTestimonials = [
        {
          id: "1",
          name: "Michael Chen",
          position: "Operations Director",
          company: "Pacific Trading Co.",
          comment:
            "Working with HBM Jakarta made my relocation to Indonesia incredibly smooth. Their expertise with KITAS and work permits saved me weeks of stress and paperwork.",
          rating: 5,
          image:
            "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
        },
        {
          id: "2",
          name: "Sarah Johnson",
          position: "HR Manager",
          company: "Global Tech Solutions",
          comment:
            "As an HR manager responsible for multiple expatriate employees, I can't recommend their services enough. Their attention to detail and regular updates kept us informed throughout the entire process.",
          rating: 5,
          image:
            "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
        },
        {
          id: "3",
          name: "Robert Tanaka",
          position: "Chief Engineer",
          company: "East-West Construction",
          comment:
            "When our project timeline was at risk due to visa delays, their team expedited the process and delivered results when we needed them most. Truly exceptional service.",
          rating: 4,
          image:
            "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
        },
      ];

      const defaultSection = {
        name: "testimonials",
        title: "What Our Clients Say",
        subtitle: "TESTIMONIALS",
        content: {
          description:
            "We take pride in our high client satisfaction rate and the positive feedback we receive from individuals and companies we've assisted with their visa and permit needs.",
          testimonials: defaultTestimonials,
        },
        is_active: true,
      };

      const { data, error } = await supabase
        .from("landing_sections")
        .insert(defaultSection)
        .select()
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        subtitle: data.subtitle,
        description: data.content.description,
        content: {
          testimonials: data.content.testimonials,
        },
        is_active: data.is_active,
      });

      toast.success("Created default testimonials section");
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

  const handleTestimonialUpdate = (
    id: string,
    field: string,
    value: string | number
  ) => {
    const updatedTestimonials = formData.content.testimonials.map(
      (testimonial) =>
        testimonial.id === id ? { ...testimonial, [field]: value } : testimonial
    );

    setFormData({
      ...formData,
      content: {
        ...formData.content,
        testimonials: updatedTestimonials,
      },
    });
  };

  const handleAddTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: "",
      position: "",
      company: "",
      comment: "",
      rating: 5,
      image: "",
    };

    setFormData({
      ...formData,
      content: {
        ...formData.content,
        testimonials: [...formData.content.testimonials, newTestimonial],
      },
    });
  };

  const handleDeleteTestimonial = (id: string) => {
    const updatedTestimonials = formData.content.testimonials.filter(
      (testimonial) => testimonial.id !== id
    );

    setFormData({
      ...formData,
      content: {
        ...formData.content,
        testimonials: updatedTestimonials,
      },
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = formData.content.testimonials.findIndex(
        (t) => t.id === active.id
      );
      const newIndex = formData.content.testimonials.findIndex(
        (t) => t.id === over.id
      );

      const newTestimonials = [...formData.content.testimonials];
      const [movedItem] = newTestimonials.splice(oldIndex, 1);
      newTestimonials.splice(newIndex, 0, movedItem);

      setFormData({
        ...formData,
        content: {
          ...formData.content,
          testimonials: newTestimonials,
        },
      });
    }
  };

  const handleImageUpload = async (
    testimonialId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload a JPG, PNG, GIF, or WebP image"
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

          // Update testimonial with the data URL
          handleTestimonialUpdate(testimonialId, "image", dataUrl);
          toast.success("Image uploaded successfully");
          setUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Error reading file");
        setUploading(false);
      };

      // Read the file as a data URL
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error(`Error uploading image: ${error.message}`);
      setUploading(false);
    } finally {
      // Clear the file input
      e.target.value = "";
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
          subtitle: formData.subtitle,
          content: {
            description: formData.description,
            testimonials: formData.content.testimonials,
          },
          is_active: formData.is_active,
        })
        .eq("name", "testimonials");

      if (error) throw error;

      toast.success("Testimonials section updated successfully");
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
            Edit Testimonials Section
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Testimonials Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Testimonials</h2>
              <button
                type="button"
                onClick={handleAddTestimonial}
                className="flex items-center px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Testimonial</span>
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Drag and drop to reorder testimonials. Each testimonial includes a
              photo, name, position, and comment.
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext
                items={formData.content.testimonials.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {formData.content.testimonials.map((testimonial) => (
                    <SortableTestimonial
                      key={testimonial.id}
                      testimonial={testimonial}
                      onUpdate={handleTestimonialUpdate}
                      onDelete={handleDeleteTestimonial}
                      onImageUpload={handleImageUpload}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {formData.content.testimonials.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">
                  No testimonials added yet. Click the button above to add one.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Section Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Section Settings</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="e.g. TESTIMONIALS"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Appears above the main title (usually in uppercase)
                  </p>
                </div>

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
                    placeholder="e.g. What Our Clients Say"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The main heading for this section
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter a brief description for your testimonials section..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  A brief introduction that appears below the title
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
                  Use high-quality profile photos for testimonials
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
                  Keep testimonial comments concise and impactful
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
                  Include the person's position and company for credibility
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
                  Use star ratings to highlight client satisfaction
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
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              {formData.subtitle && (
                <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">
                  {formData.subtitle}
                </p>
              )}
              <h3 className="text-3xl font-semibold mb-2">{formData.title}</h3>
              {formData.description && (
                <p className="text-gray-600 max-w-3xl mx-auto">
                  {formData.description}
                </p>
              )}
            </div>

            {formData.content.testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {formData.content.testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col"
                  >
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 mr-4">
                        {testimonial.image ? (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {testimonial.name || "Client Name"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {testimonial.position && testimonial.company
                            ? `${testimonial.position}, ${testimonial.company}`
                            : testimonial.position ||
                              testimonial.company ||
                              "Position, Company"}
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-600 italic flex-grow">
                      "
                      {testimonial.comment ||
                        "This client testimonial will appear here. Add a compelling quote that highlights your service quality and client satisfaction."}
                      "
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Add testimonials to see the preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSectionEditor;
