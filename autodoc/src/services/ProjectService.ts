import { prisma } from '@/lib/prisma'

export async function getProjects() {
  return prisma.project.findMany({
    include: {
      repositories: true,
    },
  })
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      repositories: true,
      documents: true,
    },
  })
}

export async function createProject(data: { name: string; description?: string; userId: string }) {
  return prisma.project.create({
    data,
  })
}

export async function updateProject(id: string, data: { name?: string; description?: string }) {
  return prisma.project.update({
    where: { id },
    data,
  })
}

export async function deleteProject(id: string) {
  return prisma.project.delete({
    where: { id },
  })
}