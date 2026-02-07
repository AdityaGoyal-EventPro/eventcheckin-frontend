import React, { useState } from 'react';
import { Award, Check } from 'lucide-react';

const WRISTBAND_COLORS = [
  { name: 'Red', hex: '#EF4444', bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' },
  { name: 'Blue', hex: '#3B82F6', bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
  { name: 'Green', hex: '#10B981', bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' },
  { name: 'Yellow', hex: '#F59E0B', bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50' },
  { name: 'Purple', hex: '#8B5CF6', bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
  { name: 'Pink', hex: '#EC4899', bg: 'bg-pink-500', text: 'text-pink-600', light: 'bg-pink-50' },
  { name: 'Orange', hex: '#F97316', bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
  { name: 'Teal', hex: '#14B8A6', bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50' },
  { name: 'Lime', hex: '#84CC16', bg: 'bg-lime-500', text: 'text-lime-600', light: 'bg-lime-50' },
  { name: 'Indigo', hex: '#6366F1', bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' },
  { name: 'Cyan', hex: '#06B6D4', bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-50' },
  { name: 'Rose', hex: '#F43F5E', bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
];

function WristbandAssignment({ event, onColorAssigned }) {
  const [showPicker, setShowPicker] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const currentColor = event.wristband_color 
    ? WRISTBAND_COLORS.find(c => c.name.toLowerCase() === event.wristband_color.toLowerCase())
    : null;

  const handleAssignColor = async (colorName) => {
    setAssigning(true);
    try {
      await onColorAssigned(event.id, colorName.toLowerCase());
      setShowPicker(false);
    } catch (error) {
      alert('Failed to assign wristband color');
    } finally {
      setAssigning(false);
    }
  };

  if (!showPicker && !currentColor) {
    // Not assigned - show "Assign Color" button
    return (
      <button
        onClick={() => setShowPicker(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
      >
        <Award className="w-4 h-4" />
        Assign Wristband
      </button>
    );
  }

  if (!showPicker && currentColor) {
    // Already assigned - show current color with change option
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-2 ${currentColor.light} border-2 ${currentColor.bg.replace('bg-', 'border-')} rounded-lg`}>
          <div className={`w-4 h-4 ${currentColor.bg} rounded-full`}></div>
          <span className={`text-sm font-semibold ${currentColor.text} uppercase`}>
            {currentColor.name}
          </span>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition"
        >
          Change
        </button>
      </div>
    );
  }

  // Color picker mode
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Award className="w-4 h-4" />
          Select Wristband Color
        </h4>
        <button
          onClick={() => setShowPicker(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {WRISTBAND_COLORS.map((color) => (
          <button
            key={color.name}
            onClick={() => handleAssignColor(color.name)}
            disabled={assigning}
            className={`group relative ${
              currentColor?.name === color.name ? 'ring-2 ring-offset-2 ring-purple-500' : ''
            } disabled:opacity-50`}
          >
            <div className={`${color.bg} h-10 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition transform hover:scale-105 group-hover:ring-2 group-hover:ring-gray-300`}>
              {currentColor?.name === color.name && (
                <Check className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="text-xs font-medium text-gray-700 mt-1 text-center">
              {color.name}
            </div>
          </button>
        ))}
      </div>
      {assigning && (
        <div className="mt-2 text-center text-xs text-gray-500">
          Assigning...
        </div>
      )}
    </div>
  );
}

export default WristbandAssignment;
