import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Plus, Trash, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

type FAQSectionData = {
  title: string;
  subtitle: string;
  content: {
    description: string;
    faqs: FAQItem[];
    cta_text: string;
    cta_description: string;
    cta_button_text: string;
    cta_button_link: string;
  };
  is_active: boolean;
};

const SortableFAQItem = ({ 
  faq, 
  onUpdate, 
  onDelete 
}: { 
  faq: FAQItem; 
  onUpdate: (id: string, field: string, value: string) => void; 
  onDelete: (id: string) => void; 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: faq.id });

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
          <GripVertical size={20} className="text-gray-500" />
        </div>
        <button 
          onClick={() => onDelete(faq.id)} 
          className="text-red-500 hover:text-red-700"
        >
          <Trash size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
          <input
            type="text"
            value={faq.question}
            onChange={(e) => onUpdate(faq.id, 'question', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter FAQ question"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
          <textarea
            value={faq.answer}
            onChange={(e) => onUpdate(faq.id, 'answer', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Enter detailed answer"
          />
        </div>
      </div>
    </div>
  );
};

const FAQSectionEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FAQSectionData>({
    title: '',
    subtitle: '',
    content: {
      description: '',
      faqs: [],
      cta_text: '',
      cta_description: '',
      cta_button_text: '',
      cta_button_link: ''
    },
    is_active: true
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchFAQSection();
  }, []);

  const fetchFAQSection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('landing_sections')
        .select('*')
        .eq('name', 'faq')
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
          description: data.content?.description || '',
          faqs: data.content?.faqs || [],
          cta_text: data.content?.cta_text || '',
          cta_description: data.content?.cta_description || '',
          cta_button_text: data.content?.cta_button_text || '',
          cta_button_link: data.content?.cta_button_link || ''
        },
        is_active: data.is_active
      });
    } catch (error: any) {
      toast.error(`Error loading FAQ section: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSection = async () => {
    try {
      const defaultFAQs = [
        {
          id: '1',
          question: "What documents are required for RPTKA application?",
          answer: "RPTKA applications typically require company legal documents, organizational structure, job descriptions for the foreign worker position, qualifications justification, and a foreign manpower utilization plan. Our consultants will provide a comprehensive checklist tailored to your specific situation."
        },
        {
          id: '2',
          question: "How long does it take to obtain a work visa for Indonesia?",
          answer: "The processing time for work visas varies based on nationality, position, and current regulatory conditions. Generally, it takes between 2-8 weeks from initial application to visa issuance. Our expedited services can often reduce these timelines."
        },
        {
          id: '3',
          question: "Can family members accompany a foreign worker to Indonesia?",
          answer: "Yes, immediate family members (spouse and dependent children) can accompany foreign workers through dependent visas. We provide complete assistance for family applications alongside the primary work permit processing."
        },
        {
          id: '4',
          question: "What is the difference between KITAS and KITAP?",
          answer: "KITAS (Kartu Izin Tinggal Terbatas) is a temporary stay permit valid for up to 2 years with possible extensions. KITAP (Kartu Izin Tinggal Tetap) is a permanent stay permit available after holding KITAS for several consecutive years, typically 4-5 years depending on circumstances."
        },
        {
          id: '5',
          question: "Are there any nationality restrictions for work permits in Indonesia?",
          answer: "Indonesia does not explicitly restrict work permits based on nationality, but certain positions and industries have specific requirements. Some positions may be reserved for Indonesian nationals according to the government's Negative Investment List (DNI)."
        },
        {
          id: '6',
          question: "What happens if my work permit expires while I'm still in Indonesia?",
          answer: "Overstaying a work permit can result in significant fines, deportation, and potential difficulty obtaining future permits. We provide timely reminders and renewal services to ensure continuous legal residence and work authorization."
        }
      ];

      const defaultSection = {
        name: 'faq',
        title: 'Common Questions About Work Permits & Visas',
        subtitle: 'FREQUENTLY ASKED QUESTIONS',
        content: {
          description: 'Find answers to frequently asked questions about work permits, visas, and immigration procedures for foreign workers in Indonesia.',
          faqs: defaultFAQs,
          cta_text: "Don't see your question here?",
          cta_description: "Contact our team for personalized assistance.",
          cta_button_text: "Ask Your Question",
          cta_button_link: "#contact"
        },
        is_active: true
      };

      const { data, error } = await supabase
        .from('landing_sections')
        .insert(defaultSection)
        .select()
        .single();

      if (error) throw error;
      
      setFormData({
        title: data.title,
        subtitle: data.subtitle,
        content: {
          description: data.content.description,
          faqs: data.content.faqs,
          cta_text: data.content.cta_text,
          cta_description: data.content.cta_description,
          cta_button_text: data.content.cta_button_text,
          cta_button_link: data.content.cta_button_link
        },
        is_active: data.is_active
      });
      
      toast.success('Created default FAQ section');
    } catch (error: any) {
      toast.error(`Error creating default section: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleContentChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [field]: value
      }
    });
  };

  const handleFAQUpdate = (id: string, field: string, value: string) => {
    const updatedFAQs = formData.content.faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    );
    
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        faqs: updatedFAQs
      }
    });
  };

  const handleAddFAQ = () => {
    const newFAQ: FAQItem = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        faqs: [...formData.content.faqs, newFAQ]
      }
    });
  };

  const handleDeleteFAQ = (id: string) => {
    const updatedFAQs = formData.content.faqs.filter(
      faq => faq.id !== id
    );
    
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        faqs: updatedFAQs
      }
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = formData.content.faqs.findIndex(f => f.id === active.id);
      const newIndex = formData.content.faqs.findIndex(f => f.id === over.id);
      
      const newFAQs = [...formData.content.faqs];
      const [movedItem] = newFAQs.splice(oldIndex, 1);
      newFAQs.splice(newIndex, 0, movedItem);
      
      setFormData({
        ...formData,
        content: {
          ...formData.content,
          faqs: newFAQs
        }
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
          content: {
            description: formData.content.description,
            faqs: formData.content.faqs,
            cta_text: formData.content.cta_text,
            cta_description: formData.content.cta_description,
            cta_button_text: formData.content.cta_button_text,
            cta_button_link: formData.content.cta_button_link
          },
          is_active: formData.is_active
        })
        .eq('name', 'faq');
      
      if (error) throw error;
      
      toast.success('FAQ section updated successfully');
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
          <h1 className="text-2xl font-bold text-gray-900">Edit FAQ Section</h1>
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
        {/* Left Column - FAQ Items Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">FAQ Items</h2>
              <button
                type="button"
                onClick={handleAddFAQ}
                className="flex items-center px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add FAQ</span>
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop to reorder FAQ items. Each item includes a question and answer.
            </p>
            
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext 
                items={formData.content.faqs.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {formData.content.faqs.map((faq) => (
                    <SortableFAQItem
                      key={faq.id}
                      faq={faq}
                      onUpdate={handleFAQUpdate}
                      onDelete={handleDeleteFAQ}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            {formData.content.faqs.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No FAQs added yet. Click the button above to add one.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Section Settings & CTA */}
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
                    placeholder="e.g. FREQUENTLY ASKED QUESTIONS"
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
                    placeholder="e.g. Common Questions"
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
                  value={formData.content.description}
                  onChange={(e) => handleContentChange('description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter a brief description for your FAQ section..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  A brief introduction that appears below the title
                </p>
              </div>
              
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-700">Section Status</span>
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-3 text-sm text-gray-500">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                When disabled, this section will not be shown on the landing page
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Call-to-Action Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Heading</label>
                <input
                  type="text"
                  name="cta_text"
                  value={formData.content.cta_text}
                  onChange={(e) => handleContentChange('cta_text', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g. Don't see your question here?"
                />
                <p className="mt-1 text-xs text-gray-500">
                  The main heading for the call-to-action area
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Description</label>
                <input
                  type="text"
                  name="cta_description"
                  value={formData.content.cta_description}
                  onChange={(e) => handleContentChange('cta_description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g. Contact our team for personalized assistance."
                />
                <p className="mt-1 text-xs text-gray-500">
                  A brief description that appears below the CTA heading
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    name="cta_button_text"
                    value={formData.content.cta_button_text}
                    onChange={(e) => handleContentChange('cta_button_text', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. Ask Your Question"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Text displayed on the call-to-action button
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    name="cta_button_link"
                    value={formData.content.cta_button_link}
                    onChange={(e) => handleContentChange('cta_button_link', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. #contact"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use # for page sections (e.g. #contact) or full URLs
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Tips & Best Practices</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-2">Keep questions concise and focused on one topic</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-2">Use clear, jargon-free language in your answers</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-2">Address common customer concerns and objections</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-2">Organize FAQs from most to least common questions</p>
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
              {formData.content.description && (
                <p className="text-gray-600 max-w-3xl mx-auto">
                  {formData.content.description}
                </p>
              )}
            </div>
            
            {formData.content.faqs.length > 0 ? (
              <div className="max-w-3xl mx-auto divide-y divide-gray-200">
                {formData.content.faqs.map((faq, index) => (
                  <div key={index} className="py-6">
                    <details className="group">
                      <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                        <span className="text-lg font-medium text-gray-900">{faq.question || 'Question goes here'}</span>
                        <span className="transition group-open:rotate-180">
                          <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                            <path d="M6 9l6 6 6-6"></path>
                          </svg>
                        </span>
                      </summary>
                      <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                        {faq.answer || 'Answer goes here'}
                      </p>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Add FAQ items to see the preview</p>
              </div>
            )}
            
            {(formData.content.cta_text || formData.content.cta_description) && (
              <div className="mt-12 text-center bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-xl font-semibold mb-2">{formData.content.cta_text || "Don't see your question here?"}</h4>
                <p className="text-gray-600 mb-6">{formData.content.cta_description || "Contact our team for personalized assistance."}</p>
                {formData.content.cta_button_text && (
                  <button className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                    {formData.content.cta_button_text}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSectionEditor;
