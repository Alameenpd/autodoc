'use client'
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  repoId: z.string().min(1, { message: "Please select a repository" }),
});

interface LinkRepoFormProps {
  projectId: string;
  onSuccess: () => void;
}

export function LinkRepoForm({ projectId, onSuccess }: LinkRepoFormProps) {
  const { data: session } = useSession();
  const [repos, setRepos] = useState([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoId: "",
    },
  });

  React.useEffect(() => {
    if (session?.accessToken) {
      fetchRepos(session.accessToken);
    }
  }, [session]);
  
  async function fetchRepos(accessToken: string) {
    try {
      const response = await fetch("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRepos(data);
      } else {
        console.error("Failed to fetch repositories");
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
    }
  }
  
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`/api/projects/${projectId}/repos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoId: values.repoId }),
      });

      if (response.ok) {
        onSuccess();
        form.reset();
      } else {
        console.error('Failed to link repository');
      }
    } catch (error) {
      console.error('Error linking repository:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="repoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a repository" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {repos.map((repo) => (
                    <SelectItem key={(repo as any).id} value={(repo as any).id.toString()}>
                      {(repo as any).full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the GitHub repository you want to link.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Link Repository</Button>
      </form>
    </Form>
  );
}