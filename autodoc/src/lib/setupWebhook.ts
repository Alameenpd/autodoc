import { Octokit } from "@octokit/rest";
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function setupWebhook(repositoryId: string, accessToken: string) {
  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
  });

  if (!repository) {
    throw new Error('Repository not found');
  }

  const octokit = new Octokit({ auth: accessToken });
  const [owner, repo] = repository.fullName.split('/');

  // Generate a random webhook secret
  const webhookSecret = crypto.randomBytes(20).toString('hex');

  try {
    // Create the webhook on GitHub
    await octokit.repos.createWebhook({
      owner,
      repo,
      config: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`,
        content_type: 'json',
        secret: webhookSecret,
      },
      events: ['push'],
    });

    // Save the webhook secret in the database
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { webhookSecret },
    });

    console.log(`Webhook set up successfully for ${repository.fullName}`);
  } catch (error) {
    console.error(`Error setting up webhook for ${repository.fullName}:`, error);
    throw error;
  }
}