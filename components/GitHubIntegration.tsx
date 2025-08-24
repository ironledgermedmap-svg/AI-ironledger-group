import React, { useState, useEffect } from 'react';
import { githubService, type GitHubRepo } from '../src/utils/githubService';

interface GitHubIntegrationProps {
  onRepoSelected: (repo: GitHubRepo, structure: any) => void;
  onFilesSelected: (files: string[]) => void;
}

export const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({
  onRepoSelected,
  onFilesSelected
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [structure, setStructure] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRepoLoad = async () => {
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const parsedRepo = githubService.parseGitHubUrl(repoUrl);
      if (!parsedRepo) {
        throw new Error('Invalid GitHub URL');
      }

      setRepo(parsedRepo);
      
      // Get repository structure
      const repoStructure = await githubService.getRepoStructure(parsedRepo);
      setStructure(repoStructure);
      
      onRepoSelected(parsedRepo, repoStructure);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repository');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFileSelection = (filePath: string) => {
    setSelectedFiles(prev => {
      const newSelection = prev.includes(filePath)
        ? prev.filter(path => path !== filePath)
        : [...prev, filePath];
      
      onFilesSelected(newSelection);
      return newSelection;
    });
  };

  const renderFileTree = (node: any, depth: number = 0): React.ReactNode => {
    if (!node) return null;

    const indentClass = `ml-${depth * 4}`;

    if (node.type === 'file') {
      return (
        <div key={node.path} className={`${indentClass} flex items-center space-x-2 py-1`}>
          <input
            type="checkbox"
            checked={selectedFiles.includes(node.path)}
            onChange={() => toggleFileSelection(node.path)}
            className="rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-300">📄 {node.name}</span>
          <span className="text-xs text-gray-500">({node.size} bytes)</span>
        </div>
      );
    }

    if (node.type === 'directory') {
      return (
        <div key={node.name} className={indentClass}>
          <div className="flex items-center space-x-2 py-1">
            <span className="text-sm font-medium text-gray-200">📁 {node.name}</span>
          </div>
          {node.children?.map((child: any) => renderFileTree(child, depth + 1))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          GitHub Repository URL
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo or owner/repo"
            className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleRepoLoad}
            disabled={!repoUrl.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isLoading ? '⏳' : '🔍'} Load
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {repo && !error && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 font-medium">{repo.owner}/{repo.name}</p>
              <p className="text-green-400 text-sm">Branch: {repo.branch}</p>
            </div>
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      )}

      {structure && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">
              Repository Files ({selectedFiles.length} selected)
            </label>
            <button
              onClick={() => {
                setSelectedFiles([]);
                onFilesSelected([]);
              }}
              className="text-xs text-gray-400 hover:text-gray-300"
            >
              Clear selection
            </button>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto">
            {renderFileTree(structure)}
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <p className="text-blue-300 text-sm font-medium mb-2">
            Selected Files ({selectedFiles.length}):
          </p>
          <div className="space-y-1">
            {selectedFiles.map(file => (
              <p key={file} className="text-blue-400 text-xs">• {file}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
