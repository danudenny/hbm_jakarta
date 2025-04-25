import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Plus, Trash, Grip, CheckCircle2, FileText, UserCheck, Briefcase, Clock4 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// Create a list of available icons from lucide-react
const availableIcons = [
  'FileText', 'UserCheck', 'Briefcase', 'Clock4', 'CheckCircle2',
  'ClipboardCheck', 'FileCheck', 'Users', 'Calendar', 'Mail',
  'Phone', 'Shield', 'Star', 'Award', 'Flag'
];

// Map of icon names to components
const iconMap = {
  FileText,
  UserCheck,
  Briefcase,
  Clock4,
  CheckCircle2,
  // Add more icons as needed
};

type ProcessStep = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

// Sortable process step component
const SortableProcessStep = ({ 
  step, 
  index, 
  onRemove, 
  onChange,
  disableRemove
}: { 
  step: ProcessStep; 
  index: number; 
  onRemove: () => void; 
  onChange: (field: string, value: string) => void;
  disableRemove: boolean;
}) => {
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: step.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  // Get the icon component from our map, or default to FileText
  const IconComponent = iconMap[step.icon as keyof typeof iconMap] || FileText;
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="p-4 border border-gray-200 rounded-md mb-4 bg-white"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab p-2 mr-2 text-gray-500 hover:text-gray-700"
          >
            <Grip size={16} />
          </div>
          <h4 className="font-medium">Step #{index + 1}</h4>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 p-1"
            disabled={disableRemove}
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              {React.createElement(IconComponent, { size: 24 })}
            </div>
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              {showIconPicker ? 'Close Icon Picker' : 'Select Icon'}
            </button>
          </div>
          
          {showIconPicker && (
            <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50">
              <div className="text-sm font-medium mb-2">Select an icon:</div>
              <div className="grid grid-cols-6 gap-2">
                {availableIcons.map((iconName) => {
                  const StepIcon = iconMap[iconName as keyof typeof iconMap];
                  if (!StepIcon) return null;
                  
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        onChange('icon', iconName);
                        setShowIconPicker(false);
                      }}
                      className={`p-2 rounded-md hover:bg-primary/10 ${
                        step.icon === iconName ? 'bg-primary/20 text-primary' : 'text-gray-700'
                      }`}
                    >
                      {React.createElement(StepIcon, { size: 20 })}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={step.title}
            onChange={(e) => onChange('title', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={step.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

const ProcessSectionEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: {
      description: '',
      steps: [] as ProcessStep[]
    },
    is_active: true
  });

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProcessSection();
  }, []);

  const fetchProcessSection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('landing_sections')
        .select('*')
        .eq('name', 'process')
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
          steps: data.content.steps || []
        },
        is_active: data.is_active
      });
    } catch (error: any) {
      toast.error(`Error loading process section: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSection = async () => {
    try {
      const defaultSteps = [
        {
          id: '1',
          icon: 'FileText',
          title: "Document Preparation",
          description: "We help you prepare all necessary documents and forms required for your application."
        },
        {
          id: '2',
          icon: 'UserCheck',
          title: "Initial Review",
          description: "Our experts review your documentation to ensure everything meets requirements."
        },
        {
          id: '3',
          icon: 'Briefcase',
          title: "Application Submission",
          description: "We submit your application and handle all communication with authorities."
        },
        {
          id: '4',
          icon: 'Clock4',
          title: "Processing & Monitoring",
          description: "We actively monitor your application progress and handle any requests."
        },
        {
          id: '5',
          icon: 'CheckCircle2',
          title: "Approval & Collection",
          description: "Once approved, we collect your documents and guide you through final steps."
        }
      ];

      const defaultSection = {
        name: 'process',
        title: 'How We Work',
        subtitle: 'OUR PROCESS',
        content: {
          description: 'Our streamlined process ensures efficient handling of your visa and permit requirements',
          steps: defaultSteps
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
        subtitle: data.subtitle || '',
        content: data.content,
        is_active: data.is_active
      });
      
      toast.success('Created default process section');
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

  const handleStepChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newSteps = [...prev.content.steps];
      newSteps[index] = {
        ...newSteps[index],
        [field]: value
      };
      
      return {
        ...prev,
        content: {
          ...prev.content,
          steps: newSteps
        }
      };
    });
  };
  
  const handleAddStep = () => {
    const newStep = {
      id: Date.now().toString(),
      icon: 'FileText',
      title: 'New Step',
      description: 'Description of the new step.'
    };
    
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        steps: [...prev.content.steps, newStep]
      }
    }));
  };
  
  const handleRemoveStep = (index: number) => {
    setFormData((prev) => {
      const newSteps = [...prev.content.steps];
      newSteps.splice(index, 1);
      
      return {
        ...prev,
        content: {
          ...prev.content,
          steps: newSteps
        }
      };
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.content.steps.findIndex(step => step.id === active.id);
        const newIndex = prev.content.steps.findIndex(step => step.id === over.id);
        
        const newSteps = [...prev.content.steps];
        const [movedStep] = newSteps.splice(oldIndex, 1);
        newSteps.splice(newIndex, 0, movedStep);
        
        return {
          ...prev,
          content: {
            ...prev.content,
            steps: newSteps
          }
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
          is_active: formData.is_active
        })
        .eq('name', 'process');
      
      if (error) throw error;
      
      toast.success('Process section updated successfully');
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Process Section</h1>
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
        {/* Left Column - Process Steps Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Process Steps</h2>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop to reorder steps. Each step includes an icon, title, and description.
            </p>
            
            <div className="mb-4">
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Step</span>
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
                  items={formData.content.steps.map(step => step.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {formData.content.steps.map((step, index) => (
                    <SortableProcessStep
                      key={step.id}
                      step={step}
                      index={index}
                      onRemove={() => handleRemoveStep(index)}
                      onChange={(field, value) => handleStepChange(index, field, value)}
                      disableRemove={formData.content.steps.length <= 1}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
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
                    placeholder="e.g. OUR PROCESS"
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
                    placeholder="e.g. How We Work"
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
                  onChange={(e) => setFormData({
                    ...formData,
                    content: {
                      ...formData.content,
                      description: e.target.value
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter a description for your process section..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  A brief introduction to your process that appears below the title
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
            <h2 className="text-lg font-medium mb-4">Tips & Best Practices</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-2">Keep step descriptions concise and action-oriented</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-2">Use icons that visually represent each step in the process</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-2">Aim for 3-6 steps for optimal clarity and user engagement</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-2">Use clear, numbered steps to guide visitors through your process</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Full-width Preview Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Preview</h2>
        <div className="p-6 bg-gray-50 rounded-md">
          {formData.subtitle && (
            <p className="text-center text-sm font-medium text-primary uppercase tracking-wider mb-1">
              {formData.subtitle}
            </p>
          )}
          <h3 className="text-center text-2xl font-semibold mb-4">{formData.title}</h3>
          {formData.content.description && (
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              {formData.content.description}
            </p>
          )}
          
          <div className="relative max-w-5xl mx-auto">
            {/* Process Steps with connecting line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2 hidden md:block"></div>
            
            <div className="space-y-12 md:space-y-0">
              {formData.content.steps.map((step, index) => (
                <div key={index} className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} mb-12`}>
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} mb-4 md:mb-0`}>
                    <div className={`flex items-center ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  
                  <div className="relative flex items-center justify-center z-10">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
                      <div className="absolute -inset-2 rounded-full border-2 border-primary/20"></div>
                      <div className="absolute -inset-1 rounded-full bg-white"></div>
                      <div className="relative">
                        {React.createElement(iconMap[step.icon as keyof typeof iconMap] || iconMap.CheckCircle2, { size: 24 })}
                      </div>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pl-12 md:text-left' : 'md:pr-12 md:text-right'} hidden md:block`}>
                    {/* Empty div for layout purposes */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessSectionEditor;
