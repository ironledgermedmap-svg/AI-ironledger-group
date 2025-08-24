export interface GitHubRepo {
  owner: string;
  name: string;
  branch?: string;
  url: string;
}

export interface GitHubFile {
  path: string;
  content: string;
  sha?: string;
}

export interface PullRequestData {
  title: string;
  description: string;
  branch: string;
  files: GitHubFile[];
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  
  constructor(private token?: string) {}

  // Parse GitHub URL to extract owner and repo
  parseGitHubUrl(url: string): GitHubRepo | null {
    try {
      const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/,
        /github\.com\/([^\/]+)\/([^\/]+)\.git/,
        /^([^\/]+)\/([^\/]+)$/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          const [, owner, name, branch] = match;
          return {
            owner,
            name: name.replace('.git', ''),
            branch: branch || 'main',
            url: `https://github.com/${owner}/${name}`
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to parse GitHub URL:', error);
      return null;
    }
  }

  // Get repository contents
  async getRepoContents(repo: GitHubRepo, path: string = ''): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/repos/${repo.owner}/${repo.name}/contents/${path}`;
      const params = new URLSearchParams();
      if (repo.branch) params.append('ref', repo.branch);
      
      const response = await fetch(`${url}?${params}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get repo contents:', error);
      throw error;
    }
  }

  // Get file content
  async getFileContent(repo: GitHubRepo, filePath: string): Promise<string> {
    try {
      const url = `${this.baseUrl}/repos/${repo.owner}/${repo.name}/contents/${filePath}`;
      const params = new URLSearchParams();
      if (repo.branch) params.append('ref', repo.branch);
      
      const response = await fetch(`${url}?${params}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get file: ${response.status}`);
      }

      const data = await response.json();
      return atob(data.content.replace(/\n/g, ''));
    } catch (error) {
      console.error('Failed to get file content:', error);
      throw error;
    }
  }

  // Get repository structure (recursive)
  async getRepoStructure(repo: GitHubRepo, path: string = '', maxDepth: number = 3): Promise<any> {
    if (maxDepth <= 0) return null;

    try {
      const contents = await this.getRepoContents(repo, path);
      const structure: any = {
        type: 'directory',
        name: path || repo.name,
        children: []
      };

      for (const item of contents) {
        if (item.type === 'file') {
          structure.children.push({
            type: 'file',
            name: item.name,
            path: item.path,
            size: item.size
          });
        } else if (item.type === 'dir' && maxDepth > 1) {
          const subStructure = await this.getRepoStructure(repo, item.path, maxDepth - 1);
          if (subStructure) {
            structure.children.push(subStructure);
          }
        }
      }

      return structure;
    } catch (error) {
      console.error('Failed to get repo structure:', error);
      return null;
    }
  }

  // Create a pull request (simulated - in real app you'd use GitHub API)
  async createPullRequest(repo: GitHubRepo, prData: PullRequestData): Promise<string> {
    try {
      // In a real implementation, you would:
      // 1. Create a new branch
      // 2. Commit files to the branch
      // 3. Create the pull request

      console.log('Creating pull request:', {
        repo: `${repo.owner}/${repo.name}`,
        title: prData.title,
        branch: prData.branch,
        files: prData.files.length
      });

      // Simulate PR creation
      const prNumber = Math.floor(Math.random() * 1000) + 1;
      const prUrl = `${repo.url}/pull/${prNumber}`;
      
      return prUrl;
    } catch (error) {
      console.error('Failed to create pull request:', error);
      throw error;
    }
  }

  // Update existing code with AI suggestions
  async updateCodeWithAI(repo: GitHubRepo, files: string[], aiPrompt: string): Promise<GitHubFile[]> {
    const updatedFiles: GitHubFile[] = [];

    for (const filePath of files) {
      try {
        const content = await this.getFileContent(repo, filePath);
        
        // Here you would use the AI service to suggest improvements
        // For now, we'll simulate this
        const updatedContent = `${content}\n\n// AI-generated improvements:\n// TODO: Implement AI suggestions based on: ${aiPrompt}`;
        
        updatedFiles.push({
          path: filePath,
          content: updatedContent
        });
      } catch (error) {
        console.warn(`Failed to update ${filePath}:`, error);
      }
    }

    return updatedFiles;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    return headers;
  }

  // Check if service is properly configured
  isConfigured(): boolean {
    return true; // For public repos, no token needed for read operations
  }
}

// Export singleton instance
export const githubService = new GitHubService();
