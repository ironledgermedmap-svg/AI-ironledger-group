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

  const generateProjectStructure = async () => {
    const featuresText = features.length > 0 ? `\nAdditional features: ${features.join(', ')}` : '';
    
    const prompt = `Generate a complete, production-ready ${framework} application with the following specifications:

Project Description: ${projectDescription}
Frontend: ${framework}
Styling: ${styling}
Backend: ${backend}
Database: ${database}
Complexity: ${complexity}${featuresText}

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

Ensure all code is complete and functional, not placeholder or commented code.`;

    return prompt;
  };

  const generateProject = async () => {
    if (!projectDescription.trim()) return;
    
    setIsGenerating(true);
    setGenerationProgress('Initializing AI code generation...');
    
    try {
      const prompt = await generateProjectStructure();
      setGenerationProgress('Generating code with Gemini AI...');
      
      const aiResponse = await generateWithAI(prompt);
      
      setGenerationProgress('Processing generated files...');
      
      // Try to parse JSON response
      let parsedResponse;
      try {
        // Extract JSON from response if it's wrapped in markdown
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        // Fallback to enhanced template generation
        parsedResponse = await generateEnhancedTemplate();
      }

      const files: GeneratedFile[] = parsedResponse.files?.map((file: any) => ({
        fileName: file.path,
        code: file.content
      })) || await generateEnhancedTemplate();

      setGeneratedFiles(files);
      setGenerationProgress('');
    } catch (error) {
      console.error('Failed to generate project:', error);
      setGenerationProgress('AI generation failed, using enhanced template...');
      
      // Fallback to enhanced template
      const fallbackFiles = await generateEnhancedTemplate();
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
        code: `# ${projectDescription}

## Description
${projectDescription}

## Tech Stack
- **Frontend**: ${framework}
- **Styling**: ${styling}
- **Backend**: ${backend}
- **Database**: ${database}

## Features
${features.length > 0 ? features.map(f => `- ${f}`).join('\n') : '- Modern, responsive design\n- Production-ready architecture\n- TypeScript support'}

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Production Build
\`\`\`bash
npm run build
npm run preview
\`\`\`

## Project Structure
\`\`\`
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── public/
└── docs/
\`\`\`

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests
5. Submit a pull request
`
      }
    ];

    // Add framework-specific files
    if (framework === 'react') {
      files.push(
        {
          fileName: 'src/App.tsx',
          code: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900">
                ${projectDescription}
              </h1>
              <nav className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
              </nav>
            </div>
          </div>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
        
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2024 ${projectDescription}. Built with React and TypeScript.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;`
        },
        {
          fileName: 'src/pages/HomePage.tsx',
          code: `import React, { useState, useEffect } from 'react';

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to ${projectDescription}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A modern, full-stack application built with ${framework}, ${styling}, and ${backend}.
          This is a production-ready starter template with best practices.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Fast & Modern</h3>
            <p className="text-gray-600">Built with the latest technologies and optimized for performance.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Secure by Default</h3>
            <p className="text-gray-600">Includes security best practices and authentication ready.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Responsive Design</h3>
            <p className="text-gray-600">Works perfectly on all devices with mobile-first approach.</p>
          </div>
        </div>
        
        <div className="mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;`
        },
        {
          fileName: 'src/main.tsx',
          code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`
        }
      );
    }

    // Add styling files
    if (styling === 'tailwind') {
      files.push(
        {
          fileName: 'tailwind.config.js',
          code: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}`
        },
        {
          fileName: 'src/index.css',
          code: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}`
        }
      );
    }

    // Add backend files if needed
    if (backend === 'nodejs') {
      files.push(
        {
          fileName: 'server/index.js',
          code: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to ${projectDescription} API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});`
        },
        {
          fileName: '.env.example',
          code: `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=3001
NODE_ENV=development

# External APIs
API_KEY="your-api-key-here"`
        }
      );
    }

    // Add configuration files
    files.push(
      {
        fileName: 'vite.config.ts',
        code: `import { defineConfig } from 'vite';
${framework === 'react' ? "import react from '@vitejs/plugin-react';" : ''}
${framework === 'vue' ? "import vue from '@vitejs/plugin-vue';" : ''}

export default defineConfig({
  plugins: [${framework === 'react' ? 'react()' : framework === 'vue' ? 'vue()' : ''}],
  server: {
    port: 5173,
    ${backend !== 'none' ? `proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }` : ''}
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});`
      },
      {
        fileName: 'tsconfig.json',
        code: JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: framework === 'react' ? 'react-jsx' : 'preserve',
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true
          },
          include: ['src'],
          references: [{ path: './tsconfig.node.json' }]
        }, null, 2)
      }
    );

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
    link.download = `${projectDescription.toLowerCase().replace(/[^a-z0-9]/g, '-')}-project.zip`;
    link.click();
    URL.revokeObjectURL(url);
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

          <button
            onClick={generateProject}
            disabled={!projectDescription.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating with AI...
              </>
            ) : (
              <>
                🧠 Generate with AI
              </>
            )}
          </button>

          {generationProgress && (
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
              <p className="text-blue-300 text-sm">{generationProgress}</p>
            </div>
          )}

          {generatedFiles.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={downloadProject}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <DownloadIcon />
                Download Project
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
                  <p className="text-center text-sm">
                    Describe your project and let our AI generate complete, production-ready code using the latest best practices.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
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
