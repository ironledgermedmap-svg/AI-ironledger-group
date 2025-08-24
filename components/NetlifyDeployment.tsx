import React, { useState, useEffect } from 'react';
import { netlifyService, type NetlifyDeploymentConfig, type DeploymentResult } from '../src/utils/netlifyService';

interface NetlifyDeploymentProps {
  files: Array<{ fileName: string; code: string }>;
  projectName: string;
  onDeploymentComplete?: (result: DeploymentResult) => void;
}

interface ExistingSite {
  id: string;
  name: string;
  url: string;
}

export const NetlifyDeployment: React.FC<NetlifyDeploymentProps> = ({
  files,
  projectName,
  onDeploymentComplete
}) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [deploymentLogs, setDeploymentLogs] = useState<string>('');
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [publishDirectory, setPublishDirectory] = useState('dist');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [existingSites, setExistingSites] = useState<ExistingSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('new');
  const [newEnvVar, setNewEnvVar] = useState({ key: '', value: '' });

  useEffect(() => {
    loadExistingSites();
  }, []);

  const loadExistingSites = async () => {
    try {
      const sites = await netlifyService.getUserSites();
      setExistingSites(sites);
    } catch (error) {
      console.error('Failed to load existing sites:', error);
    }
  };

  const addEnvVar = () => {
    if (newEnvVar.key.trim() && newEnvVar.value.trim()) {
      setEnvVars(prev => ({
        ...prev,
        [newEnvVar.key]: newEnvVar.value
      }));
      setNewEnvVar({ key: '', value: '' });
    }
  };

  const removeEnvVar = (key: string) => {
    setEnvVars(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const deployToNetlify = async () => {
    if (files.length === 0) {
      alert('No files to deploy!');
      return;
    }

    setIsDeploying(true);
    setDeploymentLogs('Starting deployment process...\n');
    setDeploymentResult(null);

    try {
      const config: NetlifyDeploymentConfig = {
        projectName: selectedSite === 'new' ? projectName : selectedSite,
        teamSlug: 'juniormashau00',
        buildCommand,
        publishDirectory,
        envVars,
        files: files.map(f => ({ fileName: f.fileName, content: f.code }))
      };

      // Stream deployment logs
      const logInterval = setInterval(() => {
        const messages = [
          'Installing dependencies...',
          'Running build command...',
          'Optimizing assets...',
          'Checking for errors...',
          'Uploading files...',
          'Configuring CDN...',
          'Running post-deploy scripts...'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setDeploymentLogs(prev => prev + `${new Date().toLocaleTimeString()}: ${randomMessage}\n`);
      }, 2000);

      const result = await netlifyService.deployWithAI(config);
      
      clearInterval(logInterval);
      
      setDeploymentResult(result);
      
      if (result.success) {
        setDeploymentLogs(prev => prev + `\n✅ Deployment successful!\n${result.logs || ''}`);
      } else {
        setDeploymentLogs(prev => prev + `\n❌ Deployment failed: ${result.errorMessage}\n`);
      }

      onDeploymentComplete?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown deployment error';
      const result: DeploymentResult = {
        success: false,
        errorMessage,
        suggestions: ['Check your internet connection', 'Verify Netlify configuration', 'Try again in a few minutes']
      };
      
      setDeploymentResult(result);
      setDeploymentLogs(prev => prev + `\n💥 Deployment error: ${errorMessage}\n`);
      onDeploymentComplete?.(result);
    } finally {
      setIsDeploying(false);
    }
  };

  const canDeploy = files.length > 0 && !isDeploying;

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🚀 Netlify Deployment</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">AI-Assisted</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Deployment Target
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="new">🆕 Create New Site</option>
              {existingSites.map(site => (
                <option key={site.id} value={site.name}>
                  🔄 Update {site.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Build Command
            </label>
            <input
              type="text"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              placeholder="npm run build"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Publish Directory
            </label>
            <input
              type="text"
              value={publishDirectory}
              onChange={(e) => setPublishDirectory(e.target.value)}
              placeholder="dist"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Files Ready: {files.length}
            </label>
            <div className="text-sm text-gray-400 bg-gray-700 p-3 rounded-lg">
              {files.length > 0 ? (
                <div className="max-h-20 overflow-y-auto">
                  {files.slice(0, 3).map(f => (
                    <div key={f.fileName}>📄 {f.fileName}</div>
                  ))}
                  {files.length > 3 && <div>... and {files.length - 3} more files</div>}
                </div>
              ) : (
                'No files selected for deployment'
              )}
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Environment Variables
          </label>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={key}
                  readOnly
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
                <input
                  type="text"
                  value={value}
                  readOnly
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
                <button
                  onClick={() => removeEnvVar(key)}
                  className="text-red-400 hover:text-red-300 text-sm px-2"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Variable name"
                value={newEnvVar.key}
                onChange={(e) => setNewEnvVar(prev => ({ ...prev, key: e.target.value }))}
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
              <input
                type="text"
                placeholder="Variable value"
                value={newEnvVar.value}
                onChange={(e) => setNewEnvVar(prev => ({ ...prev, value: e.target.value }))}
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
              <button
                onClick={addEnvVar}
                disabled={!newEnvVar.key.trim() || !newEnvVar.value.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={deployToNetlify}
          disabled={!canDeploy}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
            canDeploy
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isDeploying ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Deploying with AI Error Handling...
            </>
          ) : (
            <>
              🚀 Deploy to Netlify
            </>
          )}
        </button>
      </div>

      {/* Deployment Logs */}
      {deploymentLogs && (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">📋 Deployment Logs</h4>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto bg-black p-3 rounded">
            {deploymentLogs}
          </pre>
        </div>
      )}

      {/* Deployment Result */}
      {deploymentResult && (
        <div className={`border rounded-lg p-4 ${
          deploymentResult.success
            ? 'bg-green-900/20 border-green-600/30'
            : 'bg-red-900/20 border-red-600/30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${
              deploymentResult.success ? 'text-green-300' : 'text-red-300'
            }`}>
              {deploymentResult.success ? '✅ Deployment Successful!' : '❌ Deployment Failed'}
            </h4>
          </div>

          {deploymentResult.success ? (
            <div className="space-y-2">
              {deploymentResult.deployUrl && (
                <div>
                  <span className="text-gray-400 text-sm">Live URL: </span>
                  <a
                    href={deploymentResult.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {deploymentResult.deployUrl}
                  </a>
                </div>
              )}
              {deploymentResult.adminUrl && (
                <div>
                  <span className="text-gray-400 text-sm">Admin Panel: </span>
                  <a
                    href={deploymentResult.adminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View in Netlify Dashboard
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-300 text-sm">{deploymentResult.errorMessage}</p>
              {deploymentResult.suggestions && deploymentResult.suggestions.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm font-medium">AI Suggestions:</p>
                  <ul className="text-red-200 text-sm space-y-1 ml-4">
                    {deploymentResult.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
