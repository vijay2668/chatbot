'use client';

import axios from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { useModal } from '@/hooks/use-modal-store';
import { useEffect, useState } from 'react';
import { Switch } from '../ui/switch';

export const EditFileUploadModal = ({ user }: any) => {
  const { isOpen, data, onClose, type } = useModal();
  const [checked, setChecked] = useState(false);
  const isModalOpen = isOpen && type === 'editFile';
  const router = useRouter();

  const formSchema = z.object({
    files: z.any(),
    chatbotName: z.string().min(1, {
      message: 'Chatbot Name is required',
    }),
    chatbotInstructions: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
      chatbotName: '',
      chatbotInstructions: '',
    },
  });

  useEffect(() => {
    if (data && user) {
      form.setValue('chatbotName', data.name);
      form.setValue('chatbotInstructions', data.instructions);
    }
  }, [data, form, user]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { files, chatbotName, chatbotInstructions } = values;

      if (files.length === 0) {
        toast.error('At least one file is required');
        return;
      }

      const formData = new FormData();
      for (let file of files) {
        formData.append('files', file);
      }

      if (!checked && data?.file_ids) {
        for (let file_id of data?.file_ids) {
          formData.append('file_ids', file_id);
        }
      }

      formData.append('chatbotName', chatbotName);
      formData.append('chatbotInstructions', chatbotInstructions || '');
      formData.append('openAIAPIkey', user?.openAIAPIkey);
      formData.append('assistantId', data?.id);

      const response = await axios.post(
        '/api/updateAssistantWithFiles',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      console.log(response);
      if (response.status === 200) {
        toast.success('Assistant Updated');
        form.reset();
        onClose();
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 max-h-screen overflow-hidden flex flex-col">
        <DialogHeader className="pt-2 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Attach a file for training bot
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 max-h-full overflow-hidden flex flex-col"
          >
            <div className="space-y-2 px-6 overflow-y-scroll max-h-full flex flex-col">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf"
                          multiple
                          disabled={isLoading}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="attach your files"
                          onChange={(e: any) => {
                            form.setValue('files', e.target.files);
                          }}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="chatbotName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Chatbot Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter Chatbot Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chatbotInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Chatbot Instructions
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter Chatbot Instructions"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="flex flex-col">
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                  On - If want to replace with existing data
                </FormLabel>
                <Switch onCheckedChange={setChecked} checked={checked} />
              </FormItem>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-2">
              <Button variant="primary" disabled={isLoading}>
                {isLoading ? 'Training Bot...' : 'Train bot'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
