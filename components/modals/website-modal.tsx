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
import { FileUpload } from '@/components/file-upload';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { initPinecone } from '@/lib/pinecone-client';
import { useModal } from '@/hooks/use-modal-store';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';

export const WebsiteModal = ({ user }: any) => {
  const { isOpen, onClose, type } = useModal();

  const isModalOpen = isOpen && type === 'website';

  const router = useRouter();

  const formSchema = z.object({
    pineconeAPI: z.string().min(1, {
      message: 'PINECONE API KEY is required.',
    }),
    pineconeEnvironment: z.string().min(1, {
      message: 'PINECONE ENVIRONMENT is required.',
    }),
    pineconeIndexName: z.string().min(1, {
      message: 'PINECONE INDEX NAME is required.',
    }),
    websiteURL: z.string().min(1, {
      message: 'WEBSITE NAME is required.',
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pineconeAPI: user?.botAPI || '',
      pineconeEnvironment: user?.botEnvironment || '',
      pineconeIndexName: user?.botName || '',
      websiteURL: '',
    },
  });

  const [urls, setUrls] = useState([]);
  const [selectedUrls, setSelectedUrls] = useState([]);

  const handleClose = () => {
    form.reset();
    onClose();
    setUrls([]);
    setSelectedUrls([]);
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let urlCheck = values.websiteURL.charAt(values.websiteURL.length - 1);

    if (urlCheck === '/') {
      let trimUrl = values.websiteURL.slice(0, -1);
      values.websiteURL = trimUrl;
    }

    const object = {
      ...values,
      websiteURLs: selectedUrls,
    };

    try {
      const res = await axios.post('/api/websiteBot', object);
      if (res.status === 200) {
        toast.success('Bot Trained');
        form.reset();
        onClose();
        router.push('/');
      }
      console.log(res);
    } catch (error: any) {
      toast.error(error);
    }
  };

  const fetchSublinks = async (mainURL: string) => {
    let urlCheck = mainURL.charAt(mainURL.length - 1);

    if (urlCheck === '/') {
      let trimUrl = mainURL.slice(0, -1);
      mainURL = trimUrl;
    }
    const res = await axios.post('/api/fetchSublinks', { mainURL: mainURL });

    if (res.status === 200) {
      toast.success('Sublinks Fetched');
      setUrls(res.data);
    }
  };

  const handleCheckboxClick = (url: string) => {
    setSelectedUrls((prevSelectedUrls: any) => {
      if (prevSelectedUrls.includes(url)) {
        // If URL is already in the array, remove it
        return prevSelectedUrls.filter(
          (selectedUrl: any) => selectedUrl !== url,
        );
      } else {
        // If URL is not in the array, add it
        return [...prevSelectedUrls, url];
      }
    });
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white max-w-fit text-black p-0 max-h-screen overflow-hidden flex flex-col">
        <DialogHeader className="pt-2 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add your Website URL
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 max-h-full overflow-hidden flex flex-col"
          >
            <div className="space-y-2 px-6 w-full max-h-full flex flex-col">
              <div className="flex items-center w-full justify-center text-center">
                <FormField
                  control={form.control}
                  name="websiteURL"
                  render={({ field }) => (
                    <FormItem className="w-full px-2">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Website URL
                      </FormLabel>
                      <div className="flex items-center space-x-2 w-full">
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                            placeholder="Enter Website URL"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => fetchSublinks(field.value)}
                        >
                          Fetch
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-start justify-center">
                <div className="space-y-2 px-2 max-h-full w-full flex flex-col">
                  <FormField
                    control={form.control}
                    name="pineconeAPI"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs whitespace-nowrap font-bold text-zinc-500 dark:text-secondary/70">
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
                        <FormLabel className="uppercase text-xs whitespace-nowrap font-bold text-zinc-500 dark:text-secondary/70">
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
                        <FormLabel className="uppercase text-xs whitespace-nowrap font-bold text-zinc-500 dark:text-secondary/70">
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
                </div>
                {urls.length > 0 && (
                  <div className="border-l p-2 w-fit space-y-2 flex flex-col">
                    <Label className="uppercase text-xs text-center w-full whitespace-nowrap font-bold text-zinc-500 dark:text-secondary/70">
                      Choose The URLs
                    </Label>
                    <Separator />
                    <ScrollArea className="h-48 w-fit rounded-md border">
                      {urls.map((url: string, i: number) => (
                        <div key={i}>
                          <div className="flex py-1 px-2 w-fit items-center space-x-2">
                            <Checkbox
                              id={`checkbox-${i}`}
                              onCheckedChange={() => handleCheckboxClick(url)}
                              // checked={selectedUrls.includes(url)}
                            />
                            <Label
                              htmlFor={`checkbox-${i}`}
                              className="whitespace-nowrap"
                            >
                              {url}
                            </Label>
                          </div>
                          <Separator
                            className={cn(urls.length - 1 === i && 'hidden')}
                          />
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
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
