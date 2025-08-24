import React from 'react';
import type { Tool, ToolId } from '../types';

interface SidebarProps {
  tools: Tool[];
  activeToolId: ToolId;
  onSelectTool: (toolId: ToolId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ tools, activeToolId, onSelectTool }) => {
  return (
    <aside className="w-64 bg-gray-800 shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">IRONLEDGER GROUP</h2>
        <nav className="space-y-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                activeToolId === tool.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{tool.icon}</span>
              <div>
                <div className="font-medium">{tool.name}</div>
                <div className="text-xs opacity-75">{tool.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};
