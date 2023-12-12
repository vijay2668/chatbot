'use client';

import axios from 'axios';
// import qs from "query-string";
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
import { FileUpload } from '@/components/file-upload';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { initPinecone } from '@/lib/pinecone-client';

const EditPage = ({ user }: any) => {
  const [index, setindex] = useState<any>([]);

  useEffect(() => {
    const check = async () => {
      if (user) {
        const pinecone = await initPinecone({
          environment: user?.botEnvironment,
          apiKey: user?.botAPI,
        });
        const i: any = await pinecone.listIndexes();
        setindex(i);
      }
    };

    check();
  }, [user]);

  const router = useRouter();

  const fileobject = z.object({
    key: z.string(),
    name: z.string(),
    serverData: z.any(),
    size: z.number(),
    url: z.string(),
  });

  const formSchema = z.object(
    index?.length > 0
      ? {
          pineconeAPI: z.string().min(1, {
            message: 'PINECONE API KEY is required.',
          }),
          pineconeEnvironment: z.string().min(1, {
            message: 'PINECONE ENVIRONMENT is required.',
          }),
          pineconeIndexName: z.string().min(1, {
            message: 'PINECONE INDEX NAME is required.',
          }),
          fileUrls: z.array(fileobject).min(1, {
            message: 'At least one file is required.',
          }),
          Update: z.boolean().refine(
            (val) => val === true, // Make the switch required
            {
              message: 'Please confirm that you want to update the data.',
            },
          ),
        }
      : {
          pineconeAPI: z.string().min(1, {
            message: 'PINECONE API KEY is required.',
          }),
          pineconeEnvironment: z.string().min(1, {
            message: 'PINECONE ENVIRONMENT is required.',
          }),
          pineconeIndexName: z.string().min(1, {
            message: 'PINECONE INDEX NAME is required.',
          }),
          fileUrls: z.array(fileobject).min(1, {
            message: 'At least one file is required.',
          }),
        },
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues:
      index?.length > 0
        ? {
            pineconeAPI: user?.botAPI || '',
            pineconeEnvironment: user?.botEnvironment || '',
            pineconeIndexName: user?.botName || '',
            fileUrls: [],
            Update: false,
          }
        : {
            pineconeAPI: user?.botAPI || '',
            pineconeEnvironment: user?.botEnvironment || '',
            pineconeIndexName: user?.botName || '',
            fileUrls: [],
          },
  });

  const handleClose = () => {
    form.reset();
    router.push('/');
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (index?.length > 0) {
        try {
          const res = await axios.post('/api/mergeBot', values);
          if (res.status === 200) {
            toast.success('Bot Trained');
            form.reset();
            router.push('/');
          }
          console.log('res', res);
        } catch (error: any) {
          toast.error(error);
        }

        return;
      }

      const res = await axios.post('/api/saveBot', values);
      if (res.status === 200) {
        toast.success('Bot Trained');
        form.reset();
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
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
                  name="fileUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="pdfFile"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="pineconeAPI"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Pinecone API Key
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter Pinecone API Key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pineconeEnvironment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Pinecone Environment
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter Pinecone Environment"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pineconeIndexName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Pinecone Index Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter Pinecone Index Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {index?.length > 0 && (
                <FormField
                  control={form.control}
                  name="Update"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Update Data
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                            aria-readonly
                          />
                          <Label htmlFor="update-mode">Update</Label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
export default EditPage;
