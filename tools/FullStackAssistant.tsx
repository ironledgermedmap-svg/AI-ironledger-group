import React, { useState } from 'react';
import JSZip from 'jszip';
import type { GeneratedFile } from '../types';
import { GithubIcon, DownloadIcon } from '../constants';

export const FullStackAssistant: React.FC = () => {
  const [projectDescription, setProjectDescription] = useState('');
  const [framework, setFramework] = useState('react');
  const [styling, setStyling] = useState('tailwind');
  const [backend, setBackend] = useState('nodejs');
  const [database, setDatabase] = useState('postgresql');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateProject = async () => {
    if (!projectDescription.trim()) return;
    
    setIsGenerating(true);
    try {
      // This would integrate with your code generation service
      const mockFiles: GeneratedFile[] = [
        {
          fileName: 'package.json',
          code: JSON.stringify({
            name: 'generated-project',
            version: '1.0.0',
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview'
            },
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0'
            },
            devDependencies: {
              '@types/react': '^18.0.0',
              '@types/react-dom': '^18.0.0',
              '@vitejs/plugin-react': '^4.0.0',
              typescript: '^5.0.0',
              vite: '^4.4.0'
            }
          }, null, 2)
        },
        {
          fileName: 'App.tsx',
          code: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ${projectDescription}
        </h1>
        <p className="text-gray-600">
          This is your generated ${framework} application with ${styling} styling.
        </p>
      </div>
    </div>
  );
}

export default App;`
        },
        {
          fileName: 'main.tsx',
          code: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
        },
        {
          fileName: 'index.html',
          code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
        }
      ];
      setGeneratedFiles(mockFiles);
    } catch (error) {
      console.error('Failed to generate project:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadProject = async () => {
    const zip = new JSZip();
    
    generatedFiles.forEach(file => {
      zip.file(file.fileName, file.code);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated-project.zip';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Description
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe the web application you want to build..."
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frontend Framework
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="react">React</option>
                <option value="vue">Vue.js</option>
                <option value="svelte">Svelte</option>
                <option value="vanilla">Vanilla JS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Styling
              </label>
              <select
                value={styling}
                onChange={(e) => setStyling(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="tailwind">Tailwind CSS</option>
                <option value="bootstrap">Bootstrap</option>
                <option value="css">Plain CSS</option>
                <option value="styled-components">Styled Components</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backend
              </label>
              <select
                value={backend}
                onChange={(e) => setBackend(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="nodejs">Node.js</option>
                <option value="python">Python</option>
                <option value="php">PHP</option>
                <option value="none">Static Frontend</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Database
              </label>
              <select
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="mongodb">MongoDB</option>
                <option value="sqlite">SQLite</option>
                <option value="none">No Database</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateProject}
            disabled={!projectDescription.trim() || isGenerating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isGenerating ? 'Generating...' : 'Generate Project'}
          </button>

          {generatedFiles.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={downloadProject}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <DownloadIcon />
                Download ZIP
              </button>
              <button
                onClick={() => {/* This would push to GitHub */}}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <GithubIcon />
                Push to GitHub
              </button>
            </div>
          )}
        </div>

        <div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Generated Files
            </label>
            <div className="bg-gray-800 border border-gray-600 rounded-lg h-80 overflow-y-auto">
              {generatedFiles.length > 0 ? (
                <div className="p-4 space-y-3">
                  {generatedFiles.map((file, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg">
                      <div className="bg-gray-700 px-3 py-2 border-b border-gray-600">
                        <h4 className="text-sm font-medium text-white">{file.fileName}</h4>
                      </div>
                      <pre className="p-3 text-xs text-gray-300 overflow-x-auto bg-gray-900">
                        <code>{file.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Generated files will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
