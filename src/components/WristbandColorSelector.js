import React from 'react';
import { Award } from 'lucide-react';

const WRISTBAND_COLORS = [
  { name: 'Red', hex: '#EF4444', tailwind: 'bg-red-500' },
  { name: 'Blue', hex: '#3B82F6', tailwind: 'bg-blue-500' },
  { name: 'Green', hex: '#10B981', tailwind: 'bg-green-500' },
  { name: 'Yellow', hex: '#F59E0B', tailwind: 'bg-yellow-500' },
  { name: 'Purple', hex: '#8B5CF6', tailwind: 'bg-purple-500' },
  { name: 'Pink', hex: '#EC4899', tailwind: 'bg-pink-500' },
  { name: 'Orange', hex: '#F97316', tailwind: 'bg-orange-500' },
  { name: 'Teal', hex: '#14B8A6', tailwind: 'bg-teal-500' },
  { name: 'Lime', hex: '#84CC16', tailwind: 'bg-lime-500' },
  { name: 'Indigo', hex: '#6366F1', tailwind: 'bg-indigo-500' },
  { name: 'Cyan', hex: '#06B6D4', tailwind: 'bg-cyan-500' },
  { name: 'Rose', hex: '#F43F5E', tailwind: 'bg-rose-500' },
];

function WristbandColorSelector({ selectedColor, onChange }) {
  return (
    <div className="form-group">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
        <Award className="w-4 h-4" />
        Wristband Color
      </label>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {WRISTBAND_COLORS.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => onChange(color.name.toLowerCase())}
            className={`relative group ${
              selectedColor === color.name.toLowerCase()
                ? 'ring-4 ring-purple-500 ring-offset-2'
                : 'hover:ring-2 hover:ring-gray-300'
            } rounded-xl transition-all`}
          >
            <div className={`${color.tailwind} h-16 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition transform group-hover:scale-105`}>
              {selectedColor === color.name.toLowerCase() && (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="text-xs font-medium text-gray-700 mt-1 text-center">
              {color.name}
            </div>
          </button>
        ))}
      </div>
      {selectedColor && (
        <div className="mt-3 text-sm text-gray-600">
          Selected: <span className="font-semibold capitalize">{selectedColor}</span> wristband
        </div>
      )}
    </div>
  );
}

export default WristbandColorSelector;
