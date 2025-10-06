import React from 'react';
import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';
import { fieldTypeConfig } from './DraggableField';

const PlacedField = ({ field, onUpdate, onDelete, isSelected, onSelect }) => {
  const config = fieldTypeConfig[field.type];

  const handleDragStop = (e, d) => {
    onUpdate(field.id, {
      x: d.x,
      y: d.y,
    });
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    onUpdate(field.id, {
      width: ref.style.width,
      height: ref.style.height,
      x: position.x,
      y: position.y,
    });
  };

  return (
    <Rnd
      size={{ width: field.width, height: field.height }}
      position={{ x: field.x, y: field.y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="parent"
      minWidth={80}
      minHeight={30}
      onClick={() => onSelect(field.id)}
      className={`border-2 rounded ${config.color} ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      <div className="relative w-full h-full flex items-center justify-center px-2">
        <span className="text-xs font-medium truncate">
          {config.label} - {field.recipientName || 'Unassigned'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(field.id);
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </Rnd>
  );
};

export default PlacedField;
