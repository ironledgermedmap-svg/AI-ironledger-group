import React, { useState } from 'react';
import type { Prospect } from '../types';

export const ProspectingTool: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchProspects = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // This would integrate with your prospecting API
      const mockProspects: Prospect[] = [
        {
          name: 'John Smith',
          specialty: 'Software Engineering',
          location: 'San Francisco, CA',
          contact: 'john.smith@company.com'
        },
        {
          name: 'Sarah Johnson',
          specialty: 'Marketing Director',
          location: 'New York, NY',
          contact: 'sarah.j@marketing.com'
        },
        {
          name: 'Michael Chen',
          specialty: 'Product Manager',
          location: 'Austin, TX',
          contact: 'mchen@product.co'
        }
      ];
      setProspects(mockProspects);
    } catch (error) {
      console.error('Failed to search prospects:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const exportProspects = () => {
    const csv = [
      'Name,Specialty,Location,Contact',
      ...prospects.map(p => `"${p.name}","${p.specialty}","${p.location}","${p.contact}"`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prospects.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Query
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., 'Software Engineer' or 'Marketing Director'"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Industries</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or Country"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={searchProspects}
            disabled={!searchQuery.trim() || isSearching}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isSearching ? 'Searching...' : 'Search Prospects'}
          </button>

          {prospects.length > 0 && (
            <button
              onClick={exportProspects}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Export CSV
            </button>
          )}
        </div>

        {prospects.length > 0 && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Specialty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {prospects.map((prospect, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {prospect.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {prospect.specialty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {prospect.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">
                        {prospect.contact}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
