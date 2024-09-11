import { Octokit } from "@octokit/rest";
import { prisma } from '@/lib/prisma';

export class DocGenerationService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  async generateDocumentation(repoFullName: string): Promise<string> {
    const [owner, repo] = repoFullName.split('/');
    let documentation = '';

    try {
      // Fetch repository content
      const { data: contents } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: '',
      });

      // Process each file/directory
      for (const item of contents) {
        if (item.type === 'file') {
          documentation += await this.processFile(owner, repo, item.path);
        } else if (item.type === 'dir') {
          documentation += await this.processDirectory(owner, repo, item.path);
        }
      }

      return documentation;
    } catch (error) {
      console.error('Error generating documentation:', error);
      throw new Error('Failed to generate documentation');
    }
  }

  private async processFile(owner: string, repo: string, path: string): Promise<string> {
    const { data: content } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    if ('content' in content) {
      const decodedContent = Buffer.from(content.content, 'base64').toString('utf8');
      return this.analyzeCode(path, decodedContent);
    }

    return '';
  }

  private async processDirectory(owner: string, repo: string, path: string): Promise<string> {
    let documentation = `\n## Directory: ${path}\n`;

    const { data: contents } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    for (const item of contents) {
      if (item.type === 'file') {
        documentation += await this.processFile(owner, repo, item.path);
      } else if (item.type === 'dir') {
        documentation += await this.processDirectory(owner, repo, item.path);
      }
    }

    return documentation;
  }

  private analyzeCode(filename: string, content: string): string {
    // This is a simple implementation. In a real-world scenario, you'd want to use
    // more sophisticated code analysis tools or AI models here.
    let documentation = `\n### File: ${filename}\n`;

    const lines = content.split('\n');
    const functionRegex = /function\s+(\w+)/g;
    const classRegex = /class\s+(\w+)/g;

    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      documentation += `- Function: ${match[1]}\n`;
    }

    while ((match = classRegex.exec(content)) !== null) {
      documentation += `- Class: ${match[1]}\n`;
    }

    documentation += `Total lines: ${lines.length}\n`;

    return documentation;
  }

  async generateAndSaveDocumentation(repositoryId: string): Promise<void> {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { project: true },
    });

    if (!repository) {
      throw new Error('Repository not found');
    }

    const documentation = await this.generateDocumentation(repository.fullName);

    await prisma.document.create({
      data: {
        title: `Documentation for ${repository.name}`,
        content: documentation,
        projectId: repository.projectId,
        repositoryId: repository.id,
      },
    });
  }
}