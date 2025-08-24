import React, { useState } from 'react';
import JSZip from 'jszip';
import type { GeneratedFile } from '../types';
import { GithubIcon, DownloadIcon } from '../constants';
import { aiService } from '../src/utils/aiService';
import { ApiStatus } from '../components/ApiStatus';
import { GitHubIntegration } from '../components/GitHubIntegration';
import { githubService, type GitHubRepo } from '../src/utils/githubService';

type GenerationMode = 'create-new' | 'build-from-github' | 'update-existing';

export const FullStackAssistant: React.FC = () => {
  const [mode, setMode] = useState<GenerationMode>('create-new');
  const [projectDescription, setProjectDescription] = useState('');
  const [framework, setFramework] = useState('react');
  const [styling, setStyling] = useState('tailwind');
  const [backend, setBackend] = useState('nodejs');
  const [database, setDatabase] = useState('postgresql');
  const [complexity, setComplexity] = useState('intermediate');
  const [features, setFeatures] = useState<string[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  
  // GitHub integration state
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [repoStructure, setRepoStructure] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [updateInstructions, setUpdateInstructions] = useState('');

  const toggleFeature = (feature: string) => {
    setFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleRepoSelected = (repo: GitHubRepo, structure: any) => {
    setSelectedRepo(repo);
    setRepoStructure(structure);
    setGeneratedFiles([]);
  };

  const handleFilesSelected = (files: string[]) => {
    setSelectedFiles(files);
  };

  const generateWithAI = async (prompt: string): Promise<string> => {
    if (!aiService.isAvailable()) {
      throw new Error('AI service not available. Please configure your Gemini API key.');
    }

    return await aiService.generateContent(prompt, {
      model: 'gemini-2.0-flash-001'
    });
  };

  const generateGitHubAnalysisPrompt = async (): Promise<string> => {
    if (!selectedRepo || !repoStructure) return '';

    const prompt = \`Analyze this GitHub repository and suggest improvements/enhancements:

Repository: \${selectedRepo.owner}/\${selectedRepo.name}
Branch: \${selectedRepo.branch}
URL: \${selectedRepo.url}

Repository Structure:
\${JSON.stringify(repoStructure, null, 2)}

Analysis Request: \${projectDescription || 'Provide general improvements and modernization suggestions'}

Please provide:
1. Code quality improvements
2. Modern best practices implementation
3. Performance optimizations
4. Security enhancements
5. New features that would add value
6. Documentation improvements
7. Testing additions

Format your response as JSON with this structure:
{
  "analysis": "Detailed analysis of the repository",
  "suggestions": ["list of improvement suggestions"],
  "files": [
    {
      "path": "relative/file/path",
      "content": "improved file content",
      "description": "what was improved"
    }
  ]
}

Focus on providing production-ready, modern code improvements.\`;

    return prompt;
  };

  const generateUpdatePrompt = async (): Promise<string> => {
    if (!selectedRepo || selectedFiles.length === 0) return '';

    let filesContent = '';
    for (const filePath of selectedFiles) {
      try {
        const content = await githubService.getFileContent(selectedRepo, filePath);
        filesContent += \`\\n\\n=== \${filePath} ===\\n\${content}\`;
      } catch (error) {
        console.warn(\`Could not load \${filePath}:\`, error);
      }
    }

    const prompt = \`Update and improve the following files from GitHub repository \${selectedRepo.owner}/\${selectedRepo.name}:

Update Instructions: \${updateInstructions}

Files to update:\${filesContent}

Please provide improved versions of these files with:
1. Modern best practices
2. Better error handling
3. Performance improvements
4. Security enhancements
5. Code quality improvements
6. Documentation updates

Format as JSON:
{
  "files": [
    {
      "path": "file/path",
      "content": "updated content",
      "changes": "description of changes made"
    }
  ]
}\`;

    return prompt;
  };

  const generateGitHubFallback = async (): Promise<GeneratedFile[]> => {
    if (!selectedRepo) return [];

    const files: GeneratedFile[] = [
      {
        fileName: 'IMPROVEMENTS.md',
        code: \`# Suggested Improvements for \${selectedRepo.owner}/\${selectedRepo.name}

## Analysis Summary
Repository analyzed on \${new Date().toISOString()}

## Recommendations

### 1. Code Quality
- Add TypeScript for better type safety
- Implement ESLint and Prettier for code formatting
- Add comprehensive unit tests

### 2. Security
- Update dependencies to latest versions
- Add security headers
- Implement proper error handling

### 3. Performance
- Optimize bundle size
- Add caching strategies
- Implement lazy loading

### 4. DevOps
- Add CI/CD pipeline
- Implement automated testing
- Add deployment scripts

### 5. Documentation
- Update README with setup instructions
- Add API documentation
- Include contribution guidelines

## Next Steps
1. Review current codebase
2. Implement priority improvements
3. Test changes thoroughly
4. Deploy with monitoring

Generated by AI Full-Stack Assistant
\`
      }
    ];

    if (selectedFiles.length > 0) {
      files.push({
        fileName: 'SELECTED_FILES_ANALYSIS.md',
        code: \`# Analysis of Selected Files

## Files Reviewed
\${selectedFiles.map(file => \`- \${file}\`).join('\\n')}

## Recommendations
- Review each file for modern patterns
- Add proper error handling
- Implement type safety
- Add comprehensive tests
- Update documentation

## Instructions
\${updateInstructions || 'No specific instructions provided'}
\`
      });
    }

    return files;
  };

  const generateProjectStructure = async () => {
    const featuresText = features.length > 0 ? \`\\nAdditional features: \${features.join(', ')}\` : '';
    
    const prompt = \`Generate a complete, production-ready \${framework} application with the following specifications:

Project Description: \${projectDescription}
Frontend: \${framework}
Styling: \${styling}
Backend: \${backend}
Database: \${database}
Complexity: \${complexity}\${featuresText}

Please generate a comprehensive project structure with:
1. Complete package.json with all necessary dependencies
2. Proper folder structure
3. Main application components
4. API routes (if backend is included)
5. Database models/schemas (if database is included)
6. Configuration files
7. README with setup instructions

Requirements:
- Use TypeScript where applicable
- Follow modern best practices
- Include proper error handling
- Add responsive design
- Include basic testing setup
- Use modern hooks and patterns
- Add proper type definitions

Generate realistic, functional code that would work in a real application. Make it professional and production-ready.

Format your response as a JSON object with this structure:
{
  "files": [
    {
      "path": "relative/file/path",
      "content": "file content here"
    }
  ]
}

Ensure all code is complete and functional, not placeholder or commented code.\`;

    return prompt;
  };

  const generateProject = async () => {
    if (mode === 'create-new' && !projectDescription.trim()) return;
    if (mode === 'build-from-github' && !selectedRepo) return;
    if (mode === 'update-existing' && (!selectedRepo || selectedFiles.length === 0)) return;
    
    setIsGenerating(true);
    setGenerationProgress('Initializing AI code generation...');
    
    try {
      let prompt = '';
      let files: GeneratedFile[] = [];

      switch (mode) {
        case 'create-new':
          prompt = await generateProjectStructure();
          setGenerationProgress('Generating new project with Gemini AI...');
          break;
          
        case 'build-from-github':
          prompt = await generateGitHubAnalysisPrompt();
          setGenerationProgress('Analyzing GitHub repository and generating enhancements...');
          break;
          
        case 'update-existing':
          prompt = await generateUpdatePrompt();
          setGenerationProgress('Generating updates for selected files...');
          break;
      }
      
      const aiResponse = await generateWithAI(prompt);
      
      setGenerationProgress('Processing generated files...');
      
      // Try to parse JSON response
      let parsedResponse;
      try {
        // Extract JSON from response if it's wrapped in markdown
        const jsonMatch = aiResponse.match(/\`\`\`json\\n([\\s\\S]*?)\\n\`\`\`/) || aiResponse.match(/\\{[\\s\\S]*\\}/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        // Fallback based on mode
        if (mode === 'create-new') {
          parsedResponse = { files: await generateEnhancedTemplate() };
        } else {
          parsedResponse = { files: await generateGitHubFallback() };
        }
      }

      files = parsedResponse.files?.map((file: any) => ({
        fileName: file.path || file.fileName,
        code: file.content || file.code
      })) || [];

      if (files.length === 0) {
        files = mode === 'create-new' ? await generateEnhancedTemplate() : await generateGitHubFallback();
      }

      setGeneratedFiles(files);
      setGenerationProgress('');
    } catch (error) {
      console.error('Failed to generate project:', error);
      setGenerationProgress('AI generation failed, using fallback...');
      
      // Fallback based on mode
      const fallbackFiles = mode === 'create-new' ? 
        await generateEnhancedTemplate() : 
        await generateGitHubFallback();
      setGeneratedFiles(fallbackFiles);
      setGenerationProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateEnhancedTemplate = async (): Promise<GeneratedFile[]> => {
    const projectName = projectDescription.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    const files: GeneratedFile[] = [
      {
        fileName: 'package.json',
        code: JSON.stringify({
          name: projectName,
          version: '1.0.0',
          description: projectDescription,
          type: 'module',
          scripts: {
            dev: framework === 'react' ? 'vite' : framework === 'vue' ? 'vite' : 'npm run serve',
            build: framework === 'react' ? 'tsc && vite build' : 'vite build',
            preview: 'vite preview',
            test: 'vitest',
            lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0'
          },
          dependencies: {
            ...(framework === 'react' && {
              'react': '^18.2.0',
              'react-dom': '^18.2.0',
              'react-router-dom': '^6.8.0'
            }),
            ...(framework === 'vue' && {
              'vue': '^3.3.0',
              'vue-router': '^4.2.0'
            }),
            ...(styling === 'tailwind' && {
              'tailwindcss': '^3.3.0',
              'autoprefixer': '^10.4.14',
              'postcss': '^8.4.24'
            }),
            ...(features.includes('auth') && {
              'jsonwebtoken': '^9.0.0',
              'bcryptjs': '^2.4.3'
            }),
            ...(backend === 'nodejs' && {
              'express': '^4.18.2',
              'cors': '^2.8.5',
              'helmet': '^7.0.0',
              'dotenv': '^16.1.4'
            }),
            ...(database === 'postgresql' && {
              'pg': '^8.11.0',
              'prisma': '^4.15.0'
            }),
            ...(database === 'mongodb' && {
              'mongoose': '^7.2.2'
            })
          },
          devDependencies: {
            '@types/node': '^20.3.1',
            'typescript': '^5.0.2',
            'vite': '^4.4.0',
            'vitest': '^0.32.0',
            'eslint': '^8.42.0',
            ...(framework === 'react' && {
              '@types/react': '^18.2.6',
              '@types/react-dom': '^18.2.4',
              '@vitejs/plugin-react': '^4.0.0',
              '@typescript-eslint/eslint-plugin': '^5.59.0',
              '@typescript-eslint/parser': '^5.59.0'
            }),
            ...(framework === 'vue' && {
              '@vitejs/plugin-vue': '^4.2.3',
              'vue-tsc': '^1.6.5'
            })
          }
        }, null, 2)
      },
      {
        fileName: 'README.md',
        code: \`# \${projectDescription}

## Description
\${projectDescription}

## Tech Stack
- **Frontend**: \${framework}
- **Styling**: \${styling}
- **Backend**: \${backend}
- **Database**: \${database}

## Features
\${features.length > 0 ? features.map(f => \`- \${f}\`).join('\\n') : '- Modern, responsive design\\n- Production-ready architecture\\n- TypeScript support'}

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   \\\`\\\`\\\`bash
   npm install
   \\\`\\\`\\\`

3. Set up environment variables:
   \\\`\\\`\\\`bash
   cp .env.example .env
   \\\`\\\`\\\`

4. Start development server:
   \\\`\\\`\\\`bash
   npm run dev
   \\\`\\\`\\\`

### Production Build
\\\`\\\`\\\`bash
npm run build
npm run preview
\\\`\\\`\\\`

## Project Structure
\\\`\\\`\\\`
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── public/
└── docs/
\\\`\\\`\\\`

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests
5. Submit a pull request
\`
      }
    ];

    return files;
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
    link.download = \`\${projectDescription.toLowerCase().replace(/[^a-z0-9]/g, '-')}-project.zip\`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const createPullRequest = async () => {
    if (!selectedRepo || generatedFiles.length === 0) return;

    try {
      const prData = {
        title: \`AI-Generated Improvements: \${new Date().toLocaleDateString()}\`,
        description: \`Automated improvements generated by AI Full-Stack Assistant\\n\\n**Mode**: \${mode}\\n**Files Modified**: \${generatedFiles.length}\\n\\n**Changes**:\\n\${generatedFiles.map(f => \`- \${f.fileName}\`).join('\\n')}\`,
        branch: \`ai-improvements-\${Date.now()}\`,
        files: generatedFiles.map(f => ({
          path: f.fileName,
          content: f.code
        }))
      };

      const prUrl = await githubService.createPullRequest(selectedRepo, prData);
      
      // Show success message
      alert(\`Pull request created successfully!\\nURL: \${prUrl}\`);
    } catch (error) {
      console.error('Failed to create pull request:', error);
      alert('Failed to create pull request. Please check the console for details.');
    }
  };

  const featureOptions = [
    'Authentication',
    'User Dashboard',
    'API Integration',
    'Real-time Updates',
    'File Upload',
    'Search Functionality',
    'Admin Panel',
    'Payment Integration',
    'Email Notifications',
    'Social Login'
  ];

  const getButtonText = () => {
    switch (mode) {
      case 'create-new': return '🧠 Generate New Project';
      case 'build-from-github': return '🔍 Analyze & Enhance Repository';
      case 'update-existing': return '🔄 Update Selected Files';
      default: return '🧠 Generate with AI';
    }
  };

  const canGenerate = () => {
    switch (mode) {
      case 'create-new': return projectDescription.trim().length > 0;
      case 'build-from-github': return selectedRepo !== null;
      case 'update-existing': return selectedRepo !== null && selectedFiles.length > 0 && updateInstructions.trim().length > 0;
      default: return false;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 p-4 bg-gray-800 border border-gray-600 rounded-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">AI-Powered Code Generation</h2>
          <ApiStatus />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Generate production-ready, full-stack applications with the latest AI technology
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Generation Mode
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'create-new', label: '🆕 Create New Project', desc: 'Generate a fresh project from scratch' },
                { id: 'build-from-github', label: '🔍 Analyze & Enhance GitHub Repo', desc: 'Improve existing repository' },
                { id: 'update-existing', label: '🔄 Update Specific Files', desc: 'Modify selected files in repository' }
              ].map((modeOption) => (
                <label key={modeOption.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value={modeOption.id}
                    checked={mode === modeOption.id}
                    onChange={(e) => setMode(e.target.value as GenerationMode)}
                    className="mt-1 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{modeOption.label}</div>
                    <div className="text-xs text-gray-400">{modeOption.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {mode === 'create-new' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Description *
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your web application in detail. Be specific about features, target audience, and functionality..."
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
                    <option value="react">React 18</option>
                    <option value="vue">Vue 3</option>
                    <option value="svelte">Svelte</option>
                    <option value="vanilla">Vanilla TS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Styling Framework
                  </label>
                  <select
                    value={styling}
                    onChange={(e) => setStyling(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="tailwind">Tailwind CSS</option>
                    <option value="bootstrap">Bootstrap 5</option>
                    <option value="mui">Material-UI</option>
                    <option value="styled-components">Styled Components</option>
                    <option value="css">Plain CSS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Backend Technology
                  </label>
                  <select
                    value={backend}
                    onChange={(e) => setBackend(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="nodejs">Node.js + Express</option>
                    <option value="nextjs">Next.js API Routes</option>
                    <option value="python">Python + FastAPI</option>
                    <option value="php">PHP + Laravel</option>
                    <option value="none">Static Frontend Only</option>
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
                    <option value="supabase">Supabase</option>
                    <option value="firebase">Firebase</option>
                    <option value="none">No Database</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Complexity
                </label>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="simple">Simple (Basic CRUD)</option>
                  <option value="intermediate">Intermediate (Multiple features)</option>
                  <option value="advanced">Advanced (Complex architecture)</option>
                  <option value="enterprise">Enterprise (Microservices, scaling)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Additional Features
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {featureOptions.map((feature) => (
                    <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {(mode === 'build-from-github' || mode === 'update-existing') && (
            <GitHubIntegration 
              onRepoSelected={handleRepoSelected}
              onFilesSelected={handleFilesSelected}
            />
          )}

          {mode === 'build-from-github' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Analysis Focus (Optional)
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="What specific improvements or analysis would you like? (e.g., 'Focus on performance optimization' or 'Add modern React patterns')"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
              />
            </div>
          )}

          {mode === 'update-existing' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Update Instructions *
              </label>
              <textarea
                value={updateInstructions}
                onChange={(e) => setUpdateInstructions(e.target.value)}
                placeholder="Describe what changes you want to make to the selected files..."
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
              />
            </div>
          )}

          <button
            onClick={generateProject}
            disabled={!canGenerate() || isGenerating}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating with AI...
              </>
            ) : (
              getButtonText()
            )}
          </button>

          {generationProgress && (
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
              <p className="text-blue-300 text-sm">{generationProgress}</p>
            </div>
          )}

          {generatedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={downloadProject}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <DownloadIcon />
                  Download Project
                </button>
                {(mode === 'build-from-github' || mode === 'update-existing') && selectedRepo && (
                  <button
                    onClick={createPullRequest}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <GithubIcon />
                    Create PR
                  </button>
                )}
              </div>
              {mode === 'create-new' && (
                <button
                  onClick={() => {/* This would push to GitHub */}}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <GithubIcon />
                  Push to New Repository
                </button>
              )}
            </div>
          )}
        </div>

        <div className="xl:col-span-2">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Generated Project Files ({generatedFiles.length} files)
            </label>
            <div className="bg-gray-800 border border-gray-600 rounded-lg h-96 overflow-y-auto">
              {generatedFiles.length > 0 ? (
                <div className="space-y-1">
                  {generatedFiles.map((file, index) => (
                    <details key={index} className="border-b border-gray-700 last:border-b-0">
                      <summary className="bg-gray-700 px-4 py-3 cursor-pointer hover:bg-gray-650 flex items-center justify-between">
                        <span className="font-medium text-white">{file.fileName}</span>
                        <span className="text-xs text-gray-400">
                          {file.code.length} chars
                        </span>
                      </summary>
                      <div className="p-4 bg-gray-900">
                        <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                          <code>{file.code}</code>
                        </pre>
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                  <div className="text-6xl mb-4">🧠</div>
                  <h3 className="text-lg font-medium mb-2">AI-Powered Code Generation</h3>
                  <p className="text-center text-sm mb-4">
                    {mode === 'create-new' && 'Describe your project and let our AI generate complete, production-ready code using the latest best practices.'}
                    {mode === 'build-from-github' && 'Connect to a GitHub repository to analyze and enhance existing code with AI-powered improvements.'}
                    {mode === 'update-existing' && 'Select specific files from a repository to update with AI-generated improvements and modern patterns.'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="text-center">
                      <div className="text-2xl mb-1">⚡</div>
                      <p>Lightning Fast</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎯</div>
                      <p>Production Ready</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔧</div>
                      <p>Best Practices</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">📱</div>
                      <p>Responsive Design</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};