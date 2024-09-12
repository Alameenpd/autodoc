import { Octokit } from "@octokit/rest";
import { prisma } from '@/lib/prisma';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import { Comment } from '@babel/types';
import ignore from 'ignore';
import OpenAI from 'openai';

interface CustomConfig {
  ignore?: string[];
  aiEnhancement?: boolean;
  // Add other configuration options here as needed
}

export class DocGenerationService {
  private octokit: Octokit;
  private customConfig: CustomConfig;
  private ig: ReturnType<typeof ignore>;
  private openai: OpenAI;

  constructor(accessToken: string, customConfig: CustomConfig = {}) {
    this.octokit = new Octokit({ auth: accessToken });
    this.customConfig = customConfig;
    this.ig = ignore().add(customConfig.ignore || []);
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateDocumentation(repoFullName: string): Promise<string> {
    const [owner, repo] = repoFullName.split('/');
    let documentation = `# ${repoFullName} Documentation\n\n`;

    try {
      documentation += await this.generateRepoOverview(owner, repo);
      documentation += await this.processRepository(owner, repo);

      if (this.customConfig.aiEnhancement) {
        documentation = await this.enhanceDocumentationWithAI(documentation);
      }

      return documentation;
    } catch (error) {
      console.error('Error generating documentation:', error);
      throw new Error('Failed to generate documentation');
    }
  }

  private async generateRepoOverview(owner: string, repo: string): Promise<string> {
    try {
      const { data: repoData } = await this.octokit.repos.get({ owner, repo });
      return `## Repository Overview

Name: ${repoData.name}
Description: ${repoData.description || 'No description provided'}
Main Language: ${repoData.language}
Stars: ${repoData.stargazers_count}
Forks: ${repoData.forks_count}
Last Updated: ${new Date(repoData.updated_at).toLocaleDateString()}

`;
    } catch (error) {
      console.error('Error generating repo overview:', error);
      return '';
    }
  }

  private async processRepository(owner: string, repo: string, path: string = ''): Promise<string> {
    let documentation = '';

    try {
      const { data: contents } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(contents)) {
        for (const item of contents) {
          if (this.ig.ignores(item.path)) continue;

          if (item.type === 'file') {
            documentation += await this.processFile(owner, repo, item.path);
          } else if (item.type === 'dir') {
            documentation += `\n## Directory: ${item.path}\n`;
            documentation += await this.processRepository(owner, repo, item.path);
          }
        }
      }

      return documentation;
    } catch (error) {
      console.error(`Error processing repository content at ${path}:`, error);
      return `Error processing content at ${path}\n`;
    }
  }

  private async processFile(owner: string, repo: string, path: string): Promise<string> {
    try {
      const { data: content } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if ('content' in content) {
        const decodedContent = Buffer.from(content.content, 'base64').toString('utf8');
        return this.analyzeFile(path, decodedContent);
      }

      return '';
    } catch (error) {
      console.error(`Error processing file ${path}:`, error);
      return `Error processing file ${path}\n`;
    }
  }

  private analyzeFile(filename: string, content: string): string {
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    let documentation = `\n### File: ${filename}\n`;

    switch (fileExtension) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        documentation += this.analyzeJavaScript(content);
        break;
      case 'py':
        documentation += this.analyzePython(content);
        break;
      case 'md':
        documentation += this.analyzeMarkdown(content);
        break;
      default:
        documentation += this.analyzeGenericFile(content);
    }

    return documentation;
  }

  private analyzeJavaScript(content: string): string {
    let documentation = '';
    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      traverse(ast, {
        FunctionDeclaration: (path) => {
          const name = path.node.id?.name;
          const params = path.node.params.map(p => (p as any).name).join(', ');
          const comment = this.getLeadingComment(path.node as any);
          documentation += `- Function: ${name}(${params})\n`;
          if (comment) documentation += `  Description: ${comment}\n`;
        },
        ClassDeclaration: (path) => {
          const name = (path.node.id as any).name;
          const comment = this.getLeadingComment(path.node as any);
          documentation += `- Class: ${name}\n`;
          if (comment) documentation += `  Description: ${comment}\n`;
        },
        VariableDeclaration: (path) => {
          const declarations = path.node.declarations;
          for (const declaration of declarations) {
            if (declaration.id.type === 'Identifier') {
              const name = declaration.id.name;
              const comment = this.getLeadingComment(path.node as any);
              documentation += `- Variable: ${name}\n`;
              if (comment) documentation += `  Description: ${comment}\n`;
            }
          }
        },
      });
    } catch (error) {
      console.error('Error parsing JavaScript:', error);
      documentation += 'Error: Unable to parse JavaScript content.\n';
    }
    return documentation;
  }

  private analyzePython(content: string): string {
    let documentation = '';
    const lines = content.split('\n');
    const functionRegex = /def\s+(\w+)\s*\((.*?)\):/;
    const classRegex = /class\s+(\w+)(?:\((.*?)\))?:/;
    let currentDocstring = '';

    for (const line of lines) {
      if (line.trim().startsWith('"""') || line.trim().startsWith("'''")) {
        if (currentDocstring) {
          currentDocstring += '\n' + line.trim();
          if (line.trim().endsWith('"""') || line.trim().endsWith("'''")) {
            documentation += `  Description: ${currentDocstring}\n`;
            currentDocstring = '';
          }
        } else {
          currentDocstring = line.trim();
        }
      } else if (currentDocstring) {
        currentDocstring += '\n' + line.trim();
      } else {
        const functionMatch = line.match(functionRegex);
        if (functionMatch) {
          documentation += `- Function: ${functionMatch[1]}(${functionMatch[2]})\n`;
        }
        const classMatch = line.match(classRegex);
        if (classMatch) {
          documentation += `- Class: ${classMatch[1]}\n`;
        }
      }
    }
    return documentation;
  }

  private analyzeMarkdown(content: string): string {
    let documentation = '- Markdown file content summary:\n';
    const lines = content.split('\n');
    let headings = '';
    for (const line of lines) {
      if (line.startsWith('#')) {
        headings += `  ${line}\n`;
      }
    }
    documentation += headings || '  No headings found.\n';
    return documentation;
  }

  private analyzeGenericFile(content: string): string {
    const lines = content.split('\n');
    return `- File content summary:\n  Total lines: ${lines.length}\n`;
  }

  private getLeadingComment(node: { leadingComments?: Array<Comment> }): string | undefined {
    if (node.leadingComments && node.leadingComments.length > 0) {
      return node.leadingComments[node.leadingComments.length - 1].value.trim();
    }
    return undefined;
  }

  private async enhanceDocumentationWithAI(documentation: string): Promise<string> {
    try {
      const prompt = `
        You are an expert technical writer. Your task is to enhance the following software documentation:

        ${documentation}

        Please improve this documentation by:
        1. Adding clear and concise explanations for complex parts
        2. Organizing the content in a more structured manner
        3. Adding examples where appropriate
        4. Ensuring consistent formatting and style
        5. Highlighting important notes or warnings

        Return the enhanced documentation in Markdown format.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
      });

      return response.choices[0].message.content || documentation;
    } catch (error) {
      console.error('Error enhancing documentation with AI:', error);
      return documentation;
    }
  }

  async generateAndSaveDocumentation(repositoryId: string): Promise<void> {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { project: true },
    });

    if (!repository) {
      throw new Error('Repository not found');
    }

    const customConfig = repository.customConfig as CustomConfig || {};
    this.customConfig = customConfig;
    this.ig = ignore().add(customConfig.ignore || []);

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