import { aiService } from './aiService';

export interface NetlifyDeploymentConfig {
  projectName: string;
  teamSlug: string;
  buildCommand?: string;
  publishDirectory?: string;
  envVars?: Record<string, string>;
  files?: Array<{ fileName: string; content: string }>;
}

export interface DeploymentResult {
  success: boolean;
  deployUrl?: string;
  adminUrl?: string;
  errorMessage?: string;
  logs?: string;
  suggestions?: string[];
}

export interface BuildError {
  type: 'build_error' | 'dependency_error' | 'config_error' | 'runtime_error';
  message: string;
  file?: string;
  line?: number;
  suggestions?: string[];
}

export class NetlifyService {
  private teamSlug: string;

  constructor(teamSlug: string = 'juniormashau00') {
    this.teamSlug = teamSlug;
  }

  // Create a new Netlify project
  async createProject(config: NetlifyDeploymentConfig): Promise<{ siteId: string; name: string }> {
    try {
      // Note: In a real implementation, this would use the Netlify MCP
      // For now, we'll simulate the creation
      const projectName = this.sanitizeProjectName(config.projectName);
      
      console.log('Creating Netlify project:', {
        name: projectName,
        team: this.teamSlug,
        buildCommand: config.buildCommand,
        publishDirectory: config.publishDirectory
      });

      // Simulate project creation
      const siteId = `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        siteId,
        name: projectName
      };
    } catch (error) {
      throw new Error(`Failed to create Netlify project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Deploy with AI-assisted error handling
  async deployWithAI(config: NetlifyDeploymentConfig): Promise<DeploymentResult> {
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: BuildError | null = null;

    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        console.log(`Deployment attempt ${attempts}/${maxAttempts}...`);
        
        // Create or get project
        const project = await this.createProject(config);
        
        // Prepare files for deployment
        const deployFiles = this.prepareDeploymentFiles(config.files || []);
        
        // Attempt deployment
        const result = await this.performDeployment(project.siteId, {
          ...config,
          files: deployFiles
        });

        if (result.success) {
          return {
            success: true,
            deployUrl: `https://${project.name}.netlify.app`,
            adminUrl: `https://app.netlify.com/sites/${project.name}`,
            logs: result.logs
          };
        } else {
          lastError = this.parseDeploymentError(result.errorMessage || '');
          
          if (attempts < maxAttempts) {
            console.log(`Deployment failed, attempting AI-assisted fix...`);
            
            // Use AI to fix the error
            const fixedFiles = await this.fixWithAI(lastError, config.files || []);
            config.files = fixedFiles;
          }
        }
      } catch (error) {
        lastError = {
          type: 'runtime_error',
          message: error instanceof Error ? error.message : 'Unknown deployment error'
        };
        
        if (attempts < maxAttempts) {
          console.log(`Error during deployment, trying AI fix...`);
          const fixedFiles = await this.fixWithAI(lastError, config.files || []);
          config.files = fixedFiles;
        }
      }
    }

    // If we get here, all attempts failed
    return {
      success: false,
      errorMessage: lastError?.message || 'Deployment failed after multiple attempts',
      suggestions: lastError?.suggestions || [
        'Check your build configuration',
        'Verify all dependencies are correctly specified',
        'Review environment variables',
        'Check for syntax errors in your code'
      ]
    };
  }

  // Use AI to analyze and fix deployment errors
  private async fixWithAI(error: BuildError, files: Array<{ fileName: string; content: string }>): Promise<Array<{ fileName: string; content: string }>> {
    try {
      if (!aiService.isAvailable()) {
        console.warn('AI service not available for error fixing');
        return files;
      }

      const prompt = `Fix this deployment error in the provided files:

Error Type: ${error.type}
Error Message: ${error.message}
${error.file ? `Error File: ${error.file}` : ''}
${error.line ? `Error Line: ${error.line}` : ''}

Files to fix:
${files.map(f => `=== ${f.fileName} ===\n${f.content}`).join('\n\n')}

Please provide the corrected files that fix the deployment error. Focus on:
1. Fixing syntax errors
2. Adding missing dependencies
3. Correcting configuration issues
4. Resolving build failures

Return the response as JSON:
{
  "fixes": [
    {
      "fileName": "path/to/file",
      "content": "corrected file content",
      "explanation": "what was fixed"
    }
  ],
  "suggestions": ["additional suggestions for preventing similar errors"]
}`;

      const aiResponse = await aiService.generateContent(prompt);
      
      // Try to parse AI response
      let parsedResponse;
      try {
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse AI fix response:', parseError);
        return files; // Return original files if parsing fails
      }

      if (parsedResponse.fixes && Array.isArray(parsedResponse.fixes)) {
        console.log('AI suggested fixes:', parsedResponse.suggestions);
        return parsedResponse.fixes.map((fix: any) => ({
          fileName: fix.fileName,
          content: fix.content
        }));
      }

      return files;
    } catch (error) {
      console.error('AI error fixing failed:', error);
      return files;
    }
  }

  // Parse deployment errors to understand the issue
  private parseDeploymentError(errorMessage: string): BuildError {
    const errorLower = errorMessage.toLowerCase();

    if (errorLower.includes('module not found') || errorLower.includes('package not found')) {
      return {
        type: 'dependency_error',
        message: errorMessage,
        suggestions: [
          'Add missing dependencies to package.json',
          'Check import paths are correct',
          'Verify package names and versions'
        ]
      };
    }

    if (errorLower.includes('syntax error') || errorLower.includes('unexpected token')) {
      return {
        type: 'build_error',
        message: errorMessage,
        suggestions: [
          'Check for syntax errors in your code',
          'Verify TypeScript configuration',
          'Check for missing semicolons or brackets'
        ]
      };
    }

    if (errorLower.includes('environment') || errorLower.includes('env')) {
      return {
        type: 'config_error',
        message: errorMessage,
        suggestions: [
          'Check environment variables are set',
          'Verify .env file configuration',
          'Check build environment settings'
        ]
      };
    }

    return {
      type: 'runtime_error',
      message: errorMessage,
      suggestions: [
        'Check build logs for more details',
        'Verify all files are included',
        'Review build command and settings'
      ]
    };
  }

  // Simulate deployment (in real implementation, this would use Netlify MCP)
  private async performDeployment(siteId: string, config: NetlifyDeploymentConfig): Promise<{ success: boolean; logs?: string; errorMessage?: string }> {
    // Simulate deployment process
    console.log('Deploying to Netlify site:', siteId);
    
    // Basic validation
    if (!config.files || config.files.length === 0) {
      return {
        success: false,
        errorMessage: 'No files provided for deployment'
      };
    }

    // Check for basic required files
    const hasIndexFile = config.files.some(f => 
      f.fileName === 'index.html' || 
      f.fileName === 'index.tsx' || 
      f.fileName === 'index.ts' ||
      f.fileName === 'src/index.tsx' ||
      f.fileName === 'src/index.ts'
    );

    if (!hasIndexFile) {
      return {
        success: false,
        errorMessage: 'No entry point found (index.html, index.tsx, or index.ts)'
      };
    }

    // Check for package.json if it's a Node.js project
    const hasPackageJson = config.files.some(f => f.fileName === 'package.json');
    const hasNodeModules = config.files.some(f => f.fileName.includes('node_modules'));

    if (hasPackageJson && !hasNodeModules) {
      // Simulate build process
      console.log('Running build process...');
      
      // Simulate random build success/failure for testing
      const success = Math.random() > 0.3; // 70% success rate
      
      if (!success) {
        return {
          success: false,
          errorMessage: 'Build failed: Module not found'
        };
      }
    }

    // Simulate successful deployment
    return {
      success: true,
      logs: `
Build started
Installing dependencies...
Building application...
Optimizing assets...
Deployment successful!
Deploy time: ${Math.floor(Math.random() * 60) + 30}s
      `.trim()
    };
  }

  // Prepare files for deployment (handle file paths, etc.)
  private prepareDeploymentFiles(files: Array<{ fileName: string; content: string }>): Array<{ fileName: string; content: string }> {
    return files.map(file => ({
      fileName: file.fileName.startsWith('/') ? file.fileName.slice(1) : file.fileName,
      content: file.content
    }));
  }

  // Sanitize project name for Netlify
  private sanitizeProjectName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 63); // Netlify site name limit
  }

  // Get deployment status
  async getDeploymentStatus(siteId: string): Promise<{ status: string; url?: string }> {
    // In real implementation, this would query Netlify API
    return {
      status: 'deployed',
      url: `https://app.netlify.com/sites/${siteId}`
    };
  }

  // List user's existing sites
  async getUserSites(): Promise<Array<{ id: string; name: string; url: string }>> {
    // In real implementation, this would use Netlify MCP
    return [
      { id: 'site1', name: 'my-awesome-site', url: 'https://my-awesome-site.netlify.app' },
      { id: 'site2', name: 'demo-project', url: 'https://demo-project.netlify.app' }
    ];
  }
}

// Export singleton instance
export const netlifyService = new NetlifyService();
