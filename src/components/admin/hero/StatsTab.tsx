import React from 'react';
import { Plus, Trash, GripVertical } from 'lucide-react';
import StatsCounter from '../../../components/StatsCounter';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Stat = {
  value: number;
  suffix: string;
  label: string;
  duration?: number;
};

type StatsTabProps = {
  stats: Stat[];
  onStatChange: (index: number, key: string, value: any) => void;
  onAddStat: () => void;
  onRemoveStat: (index: number) => void;
  onReorderStats?: (newStats: Stat[]) => void;
};

// Sortable item component for each stat
const SortableStat = ({ 
  stat, 
  index, 
  onStatChange, 
  onRemoveStat, 
  disableRemove, 
  id 
}: { 
  stat: Stat; 
  index: number; 
  onStatChange: (index: number, key: string, value: any) => void; 
  onRemoveStat: (index: number) => void; 
  disableRemove: boolean;
  id: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`p-4 border border-gray-200 rounded-md hover:border-gray-300 transition-colors ${isDragging ? 'bg-gray-50' : ''}`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <button
            type="button"
            className="cursor-grab p-1 mr-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <h4 className="font-medium text-gray-700">Stat #{index + 1}</h4>
        </div>
        <button
          type="button"
          onClick={() => onRemoveStat(index)}
          className="text-red-500 hover:text-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disableRemove}
        >
          <Trash size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
          <input
            type="number"
            value={stat.value}
            onChange={(e) => onStatChange(index, 'value', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">The numeric value to display</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
          <input
            type="text"
            value={stat.suffix}
            onChange={(e) => onStatChange(index, 'suffix', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., +, %, k"
          />
          <p className="mt-1 text-xs text-gray-500">Text to display after the number (optional)</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
          <input
            type="text"
            value={stat.label}
            onChange={(e) => onStatChange(index, 'label', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., Visas Processed"
          />
          <p className="mt-1 text-xs text-gray-500">Text displayed below the number</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Animation Duration (seconds)</label>
          <input
            type="number"
            value={stat.duration || 2.5}
            onChange={(e) => onStatChange(index, 'duration', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            min="0.5"
            max="10"
            step="0.1"
          />
          <p className="mt-1 text-xs text-gray-500">How long the counting animation should take</p>
        </div>
      </div>
    </div>
  );
};

const StatsTab: React.FC<StatsTabProps> = ({
  stats,
  onStatChange,
  onAddStat,
  onRemoveStat,
}) => {
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

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Find the indices of the items
      const oldIndex = stats.findIndex((_, i) => `stat-${i}` === active.id);
      const newIndex = stats.findIndex((_, i) => `stat-${i}` === over.id);
      
      // Create a new array with the updated order
      const newStats = arrayMove(stats, oldIndex, newIndex);
      
      // Update all stats with new indices
      newStats.forEach((stat, index) => {
        // This effectively updates the entire stats array in the parent component
        onStatChange(index, 'value', stat.value);
        onStatChange(index, 'suffix', stat.suffix);
        onStatChange(index, 'label', stat.label);
        onStatChange(index, 'duration', stat.duration || 2.5);
      });
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Stats Counter Settings</h3>
          <p className="text-xs text-gray-500 mt-1">
            Configure the statistics that appear in the hero section. These should highlight impressive numbers related to your business.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddStat}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus size={16} className="mr-2" />
          Add Stat
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
        <div className="bg-primary p-4 rounded-md">
          <StatsCounter stats={stats} />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-md mb-2 flex items-center">
          <GripVertical size={16} className="text-gray-400 mr-2" />
          <p className="text-sm text-gray-600">Drag and drop stats to reorder them</p>
        </div>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stats.map((_, i) => `stat-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            {stats.map((stat, index) => (
              <SortableStat
                key={`stat-${index}`}
                id={`stat-${index}`}
                stat={stat}
                index={index}
                onStatChange={onStatChange}
                onRemoveStat={onRemoveStat}
                disableRemove={stats.length <= 1}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default StatsTab;
