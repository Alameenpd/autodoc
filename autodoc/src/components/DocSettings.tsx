'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  ignore: z.string(),
  aiEnhancement: z.boolean(),
});

interface DocSettingsProps {
  repositoryId: string;
  initialConfig: {
    ignore: string[];
    aiEnhancement: boolean;
  };
  onSave: (config: { ignore: string[]; aiEnhancement: boolean }) => Promise<void>;
}

export function DocSettings({ repositoryId, initialConfig, onSave }: DocSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ignore: initialConfig.ignore.join('\n'),
      aiEnhancement: initialConfig.aiEnhancement,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      await onSave({
        ignore: values.ignore.split('\n').map(line => line.trim()).filter(line => line !== ''),
        aiEnhancement: values.aiEnhancement,
      });
      // You might want to add some UI feedback here
    } catch (error) {
      console.error('Error saving documentation settings:', error);
      // You might want to add some error feedback here
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="ignore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ignored Files and Directories</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter one pattern per line, e.g.:
*.md
node_modules
dist"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter patterns for files or directories to ignore during documentation generation. Use .gitignore syntax.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="aiEnhancement"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">AI Enhancement</FormLabel>
                <FormDescription>
                  Use AI to enhance and improve the generated documentation.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </Form>
  );
}