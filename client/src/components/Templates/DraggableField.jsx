import React from 'react';
import { PenTool, Type, Calendar, User, Briefcase, FileText } from 'lucide-react';

const fieldTypeConfig = {
  signature: {
    icon: PenTool,
    label: 'Signature',
    color: 'bg-blue-100 border-blue-400 text-blue-700',
  },
  initial: {
    icon: Type,
    label: 'Initial',
    color: 'bg-purple-100 border-purple-400 text-purple-700',
  },
  date_signed: {
    icon: Calendar,
    label: 'Date Signed',
    color: 'bg-green-100 border-green-400 text-green-700',
  },
  name: {
    icon: User,
    label: 'Name',
    color: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  },
  title: {
    icon: Briefcase,
    label: 'Title',
    color: 'bg-orange-100 border-orange-400 text-orange-700',
  },
  text: {
    icon: FileText,
    label: 'Text',
    color: 'bg-gray-100 border-gray-400 text-gray-700',
  },
};

const DraggableField = ({ type }) => {
  const config = fieldTypeConfig[type];
  const Icon = config.icon;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('fieldType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-move hover:shadow-md transition-shadow ${config.color}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{config.label}</span>
    </div>
  );
};

export default DraggableField;
export { fieldTypeConfig };
